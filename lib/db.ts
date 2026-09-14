import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key, which bypasses
// Row Level Security. NEVER import this file from a client component, and
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser — it's omitted
// from NEXT_PUBLIC_ env vars on purpose.
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export type OrderRow = {
  id: string;
  stripe_session_id: string;
  kind: "preset" | "booking" | "service" | "tip";
  preset_id: string | null;
  package_id: string | null;
  service_id: string | null;
  email: string | null;
  amount_cents: number;
  status: "pending" | "paid" | "expired";
  download_token: string | null;
  tip_message: string | null;
  created_at: string;
};

export type BookingRow = {
  id: string;
  order_id: string | null;
  package_id: string;
  email: string | null;
  starts_at: string;
  ends_at: string;
  status: "hold" | "confirmed" | "cancelled";
  created_at: string;
};

/**
 * How long an unpaid booking hold reserves a slot before the API is
 * allowed to sweep it away and free the slot for someone else. Kept
 * deliberately longer than STRIPE_SESSION_MINUTES (see lib/stripe
 * checkout/booking route) — Stripe's own Checkout Session always expires
 * first, so a payment can never complete after we've already given the
 * slot to someone else.
 */
export const HOLD_MINUTES = 35;
