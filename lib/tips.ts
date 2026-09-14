// ─────────────────────────────────────────────────────────────────────────
// SUPPORT / "BUY ME A COFFEE" TIPS
// Preset amounts shown in the floating support widget
// (components/SupportWidget.tsx). Kept here as the single source of truth
// so the checkout API (app/api/checkout/tip/route.ts) validates against the
// exact same list the buttons offer — a request for any other amount is
// rejected server-side, so nobody can tamper with the price client-side.
// ─────────────────────────────────────────────────────────────────────────

export const TIP_AMOUNTS_CENTS = [500, 1000, 2500, 5000, 10000];

export function formatTipAmount(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
