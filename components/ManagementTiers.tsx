"use client";

import { useState } from "react";
import {
  MANAGEMENT_TIERS,
  MANAGEMENT_WHAT_YOU_GET,
  ManagementTier,
  SERVICE_PAYMENT_MODE,
} from "@/lib/services";
import { BOOKING_CONFIG } from "@/lib/booking-config";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

type Reserved = {
  tierName: string;
  amountCents: number;
  method: string;
  handle: string;
};

export default function ManagementTiers() {
  const [tier, setTier] = useState<ManagementTier>(MANAGEMENT_TIERS[0]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState<Reserved | null>(null);

  const paused = SERVICE_PAYMENT_MODE === "paused";
  const manual = SERVICE_PAYMENT_MODE === "manual";

  async function submit() {
    if (!email) return;
    setSubmitting(true);
    setError(null);
    try {
      const endpoint = manual ? "/api/service-request" : "/api/checkout/service";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit that request.");

      if (manual) {
        setReserved(data);
        setSubmitting(false);
      } else {
        if (!data.url) throw new Error("Could not start checkout.");
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (reserved) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="vault-panel p-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-widest text-vault-accent">
            Request received
          </p>
          <h3 className="font-display text-2xl">Management — {reserved.tierName}</h3>
          <div className="mt-6 rounded-lg border border-vault-accent/40 bg-vault-accent/10 p-5">
            <p className="text-sm text-vault-muted">
              Send {formatPrice(reserved.amountCents)} via <strong>{reserved.method}</strong> to
            </p>
            <p className="mt-1 font-display text-2xl text-vault-accentbright">
              {reserved.handle}
            </p>
          </div>
          <p className="mt-4 text-xs text-vault-muted">
            A copy of these instructions was emailed to you. You'll hear back with final
            confirmation once payment is received.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* What you get */}
      <div className="vault-panel p-6">
        <h3 className="font-display text-lg mb-4">What you get</h3>
        <ul className="space-y-3">
          {MANAGEMENT_WHAT_YOU_GET.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-vault-muted">
              <span className="text-vault-accent">&#9670;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Tiers + request form */}
      <div className="vault-panel p-6">
        <h3 className="font-display text-lg mb-4">Choose a term</h3>
        <div className="grid gap-3 mb-6">
          {MANAGEMENT_TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTier(t)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                tier.id === t.id
                  ? "border-vault-accent bg-vault-accent/10"
                  : "border-vault-border hover:border-vault-accent/50"
              }`}
            >
              <span>{t.name}</span>
              <span className="text-vault-accent font-display">{formatPrice(t.priceCents)}</span>
            </button>
          ))}
        </div>

        {paused ? (
          <p className="rounded-lg border border-vault-border bg-vault-bg p-4 text-sm text-vault-muted">
            Management requests are temporarily paused — check back soon.
          </p>
        ) : (
          <>
            <label className="block text-sm text-vault-muted mb-2">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="vault-input mb-6"
            />

            <button
              onClick={submit}
              disabled={!email || submitting}
              className="vault-btn w-full"
            >
              {submitting
                ? "Submitting…"
                : manual
                ? `Get Started — ${formatPrice(tier.priceCents)}`
                : `Pay & Get Started — ${formatPrice(tier.priceCents)}`}
            </button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-3 text-xs text-vault-muted">
              {manual
                ? `Pay via ${BOOKING_CONFIG.manualPayment.method} — instructions follow immediately after you submit.`
                : "Secure checkout powered by Stripe."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
