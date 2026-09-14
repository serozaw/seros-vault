// ─────────────────────────────────────────────────────────────────────────
// BOOKING AVAILABILITY
// The timezone and hours you're actually available in. Slot times are shown
// to each visitor in their own local time automatically — this config just
// controls when slots exist in *your* time.
// ─────────────────────────────────────────────────────────────────────────

export const BOOKING_CONFIG = {
  timezone: "America/Denver",
  startHour: 10, // 10am
  endHour: 20, // 8pm — last bookable slot start depends on package duration
  slotIntervalMinutes: 60,
  /** How many days out people can book. */
  bookingWindowDays: 30,
  /** Days of week open, 0 = Sunday ... 6 = Saturday. Default: every day. */
  openDays: [0, 1, 2, 3, 4, 5, 6],
  /**
   * Specific calendar dates you're unavailable (out of town, etc.), on top
   * of the weekly openDays pattern above. Dates are "YYYY-MM-DD", inclusive
   * of both start and end, in the timezone set above. Add as many ranges
   * as you need; remove one once it's passed.
   */
  blockedRanges: [
    { start: "2026-09-04", end: "2026-09-09", reason: "Out of town" },
  ] as { start: string; end: string; reason?: string }[],
  /**
   * How booking payment works right now:
   *   - "stripe" — normal automated Stripe Checkout (needs Stripe working)
   *   - "manual" — buyer sends payment directly (Cash App, below), the
   *     slot is reserved immediately, and you follow up once you see the
   *     payment land. No processor account needed.
   *   - "paused" — booking turned off entirely with a "check back" notice
   */
  paymentMode: "stripe" as "stripe" | "manual" | "paused",
  /** Only used when paymentMode is "manual". */
  manualPayment: {
    method: "Cash App",
    /** Your $cashtag, e.g. "$SeroBeats" — shown to buyers at checkout. */
    handle: "$yvngbruh14",
  },
  /**
   * Shown in booking and management confirmation/instruction emails so
   * buyers have a direct way to reach you afterward. Leave as an empty
   * string to omit it from those emails entirely.
   */
  contactPhone: "(970) 287-6824",
};
