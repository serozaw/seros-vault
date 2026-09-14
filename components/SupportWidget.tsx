"use client";

import { useEffect, useState } from "react";
import { TIP_AMOUNTS_CENTS, formatTipAmount } from "@/lib/tips";

// Mounted once in app/layout.tsx, so it floats on every page. Opens either
// from its own floating button or from anywhere else on the site by
// dispatching `window.dispatchEvent(new Event("open-support-widget"))` —
// that's how the Nav's "☕ Support" link (on every page, desktop + mobile)
// triggers it without needing its own route.
export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-support-widget", openHandler);
    return () => window.removeEventListener("open-support-widget", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setAmount(null);
    setMessage("");
    setError(null);
    setSubmitting(false);
  }

  async function submit() {
    if (!amount) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: amount, message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buy me a coffee"
        className="coffee-fab fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
      >
        ☕
        <span className="coffee-fab-tooltip">Buy me a coffee</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          <div
            className="vault-panel reveal is-visible w-full max-w-md p-6 sm:p-8 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              aria-label="Close"
              className="absolute right-4 top-4 text-vault-muted transition-colors hover:text-vault-text"
            >
              ✕
            </button>

            <p className="text-4xl">☕</p>
            <h3 className="mt-2 font-display text-xl sm:text-2xl">Buy Sero a Coffee</h3>
            <p className="mt-2 text-sm text-vault-muted">
              If a preset or track helped you out, toss a few dollars in the jar — totally
              optional, always appreciated.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIP_AMOUNTS_CENTS.map((cents) => (
                <button
                  key={cents}
                  onClick={() => setAmount(cents)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    amount === cents
                      ? "border-vault-accent bg-vault-accent/15 text-vault-accentbright"
                      : "border-vault-border text-vault-text hover:border-vault-accent/50"
                  }`}
                >
                  {formatTipAmount(cents)}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Leave a kind note (optional)"
              className="vault-input mt-4 resize-none text-left text-sm"
            />

            <button
              onClick={submit}
              disabled={!amount || submitting}
              className="vault-btn mt-5 w-full"
            >
              {submitting
                ? "Redirecting…"
                : amount
                ? `Continue to Payment — ${formatTipAmount(amount)}`
                : "Pick an amount"}
            </button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-3 text-xs text-vault-muted">Secure checkout via Stripe.</p>
          </div>
        </div>
      )}
    </>
  );
}
