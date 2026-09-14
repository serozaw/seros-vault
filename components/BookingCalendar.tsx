"use client";

import { useEffect, useMemo, useState } from "react";
import { PACKAGES, CollabPackage } from "@/lib/packages";
import { BOOKING_CONFIG } from "@/lib/booking-config";
import { generateSlotsForDay, getBlockedRange, Slot } from "@/lib/slots";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function maxDateStr() {
  const d = new Date(Date.now() + BOOKING_CONFIG.bookingWindowDays * 24 * 60 * 60_000);
  return d.toISOString().slice(0, 10);
}

type Reserved = {
  packageName: string;
  startsAt: string;
  amountCents: number;
  method: string;
  handle: string;
};

export default function BookingCalendar() {
  const [pkg, setPkg] = useState<CollabPackage>(PACKAGES[0]);
  const [date, setDate] = useState(todayStr());
  const [busy, setBusy] = useState<{ startsAt: string; endsAt: string }[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState<Reserved | null>(null);

  const paused = BOOKING_CONFIG.paymentMode === "paused";
  const manual = BOOKING_CONFIG.paymentMode === "manual";

  useEffect(() => {
    setLoadingAvailability(true);
    setSlot(null);
    const from = new Date(date + "T00:00:00").toISOString();
    const to = new Date(date + "T23:59:59").toISOString();
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => setBusy(data.busy || []))
      .catch(() => setBusy([]))
      .finally(() => setLoadingAvailability(false));
  }, [date]);

  const slots = useMemo(
    () => generateSlotsForDay(date, pkg.durationMinutes, busy),
    [date, pkg, busy]
  );
  const blockedRange = useMemo(() => getBlockedRange(date), [date]);

  async function submit() {
    if (!slot || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      const endpoint = manual ? "/api/booking-request" : "/api/checkout/booking";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          startsAt: slot.startsAt.toISOString(),
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reserve that slot.");

      if (manual) {
        setReserved({
          packageName: data.packageName,
          startsAt: data.startsAt,
          amountCents: data.amountCents,
          method: data.method,
          handle: data.handle,
        });
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
            Slot reserved
          </p>
          <h3 className="font-display text-2xl">{reserved.packageName}</h3>
          <p className="mt-2 text-vault-muted">
            {new Date(reserved.startsAt).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Package selection */}
      <div className="grid gap-4">
        {PACKAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPkg(p)}
            className={`vault-panel text-left p-5 transition-colors ${
              pkg.id === p.id ? "border-vault-accent" : "hover:border-vault-accent/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">{p.name}</h3>
              <span className="text-vault-accent font-display text-lg">
                {formatPrice(p.priceCents)}
              </span>
            </div>
            <p className="mt-1 text-sm text-vault-muted">{p.description}</p>
            <p className="mt-2 text-xs text-vault-muted">{p.durationMinutes} minutes</p>
          </button>
        ))}
      </div>

      {/* Scheduling */}
      <div className="vault-panel p-6">
        {paused && (
          <div className="mb-6 rounded-lg border border-vault-accent/40 bg-vault-accent/10 px-4 py-3 text-sm text-vault-accentbright">
            Booking payments are temporarily paused — check back soon, or reach out
            directly to arrange a session.
          </div>
        )}
        {manual && (
          <div className="mb-6 rounded-lg border border-vault-accent/40 bg-vault-accent/10 px-4 py-3 text-sm text-vault-accentbright">
            Pay via <strong>{BOOKING_CONFIG.manualPayment.method}</strong> — reserve your slot
            below and you'll get the exact payment details right after.
          </div>
        )}
        <label className="block text-sm text-vault-muted mb-2">Pick a date</label>
        <input
          type="date"
          value={date}
          min={todayStr()}
          max={maxDateStr()}
          onChange={(e) => setDate(e.target.value)}
          className="vault-input mb-6"
        />

        <label className="block text-sm text-vault-muted mb-2">Pick a time</label>
        {loadingAvailability ? (
          <p className="text-sm text-vault-muted">Loading availability…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-vault-muted">
            {blockedRange
              ? `Sero's unavailable this day${blockedRange.reason ? ` — ${blockedRange.reason}` : ""}. Try another date.`
              : "No open slots this day — try another date."}
          </p>
        ) : (
          <div className="mb-6 grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <button
                key={s.startsAt.toISOString()}
                onClick={() => setSlot(s)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  slot?.startsAt.getTime() === s.startsAt.getTime()
                    ? "border-vault-accent bg-vault-accent/10 text-vault-accent"
                    : "border-vault-border hover:border-vault-accent/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

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
          disabled={!slot || !email || submitting || paused}
          className="vault-btn w-full"
        >
          {paused
            ? "Bookings paused"
            : submitting
              ? manual
                ? "Reserving…"
                : "Redirecting to payment…"
              : manual
                ? `Reserve This Slot — ${formatPrice(pkg.priceCents)}`
                : `Book & Pay ${formatPrice(pkg.priceCents)}`}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-vault-muted">
          {manual
            ? "Your slot is reserved as soon as you submit — payment instructions follow immediately."
            : "Full payment is collected at booking. Times shown are your local time; your slot is confirmed instantly on payment."}
        </p>
      </div>
    </div>
  );
}
