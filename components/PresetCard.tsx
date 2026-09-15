"use client";

import { useState } from "react";
import { Preset } from "@/lib/presets";
import EqualizerBars from "@/components/EqualizerBars";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function PresetCard({ preset }: { preset: Preset }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const isDrumKit = preset.tags.some((t) => /drum/i.test(t));
  const showCover = preset.coverImage && !coverFailed;
  const visibleTags = preset.tags.slice(0, 2);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId: preset.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="vault-panel vault-card group flex flex-col overflow-hidden">
      <div className="aspect-square w-full relative overflow-hidden">
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preset.coverImage}
            alt={preset.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="vault-cover-fallback flex h-full w-full items-center justify-center">
            <span aria-hidden="true" className="text-4xl opacity-80">
              {isDrumKit ? "🥁" : "🎛️"}
            </span>
          </div>
        )}
        {isDrumKit && (
          <>
            <span className="vault-badge absolute left-3 top-3">🥁 Drum Kit</span>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-vault-bg/95 to-transparent" />
            <div className="absolute inset-x-4 bottom-3 h-6">
              <EqualizerBars bars={7} />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-vault-muted">
          {visibleTags.map((t, i) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true" className="text-vault-border">&middot;</span>}
              {t}
            </span>
          ))}
        </div>
        <h3 className="font-display text-lg text-vault-text">{preset.name}</h3>
        <p className="text-sm text-vault-muted flex-1">{preset.description}</p>

        {preset.audioPreviewUrl && (
          <audio controls className="w-full" preload="none">
            <source src={preset.audioPreviewUrl} />
          </audio>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-2xl leading-none text-vault-accentbright">
            {preset.priceCents === 0 ? "Free" : formatPrice(preset.priceCents)}
          </span>
          {preset.gumroadUrl ? (
            <a
              href={preset.gumroadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="vault-btn"
            >
              Buy on Gumroad
            </a>
          ) : (
            <button onClick={buy} disabled={loading} className="vault-btn">
              {loading ? "Redirecting…" : preset.priceCents === 0 ? "Get it free" : "Buy now"}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
