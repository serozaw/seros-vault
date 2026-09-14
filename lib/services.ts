// ─────────────────────────────────────────────────────────────────────────
// MANAGEMENT RETAINER
// Not a scheduled session — this is ongoing access for a fixed period, so
// unlike bookings there's no calendar slot to protect. Edit tiers, pricing,
// or the "what you get" list here.
//
// How payment works right now:
//   - "stripe" — normal automated Stripe Checkout (needs Stripe working)
//   - "manual" — buyer submits their email, is immediately shown (and
//     emailed) your Cash App handle from BOOKING_CONFIG.manualPayment, and
//     you follow up once you see the payment land. No processor needed.
//   - "paused" — retainer requests turned off entirely with a "check back"
//     notice
export const SERVICE_PAYMENT_MODE: "stripe" | "manual" | "paused" = "stripe";

export type ManagementTier = {
  id: string;
  name: string;
  priceCents: number;
};

export const MANAGEMENT_WHAT_YOU_GET: string[] = [
  "📈 Music platform growth & strategy",
  "📢 Promotion & marketing",
  "🎚️ Professional music mixing",
  "🤝 Connections with established artists",
  "🎹 Producer & beatmaker networking",
  "🎵 Release & content strategy",
  "🚀 Artist development & career guidance",
  "🔥 Opportunities to expand your audience and reach",
];

export const MANAGEMENT_TIERS: ManagementTier[] = [
  { id: "mgmt-2wk", name: "2 Weeks", priceCents: 20000 },
  { id: "mgmt-4wk", name: "4 Weeks", priceCents: 38000 },
  { id: "mgmt-5mo", name: "5 Months", priceCents: 65000 },
];

export function getManagementTierById(id: string): ManagementTier | undefined {
  return MANAGEMENT_TIERS.find((t) => t.id === id);
}
