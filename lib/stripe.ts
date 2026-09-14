import Stripe from "stripe";
import { NextRequest } from "next/server";

let _stripe: Stripe | null = null;

/** Lazily-constructed Stripe client (avoids crashing the build if the env var isn't set yet). */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  _stripe = new Stripe(key);
  return _stripe;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * Same idea as getSiteUrl(), but for routes that have the incoming request
 * on hand (the three checkout/* routes) — prefers the request's own origin
 * over NEXT_PUBLIC_SITE_URL. This is what the buyer's browser is actually
 * talking to right now, so Stripe's success/cancel redirect can never end
 * up pointing at localhost or a stale domain even if that env var is
 * missing, wrong, or hasn't taken effect on this deployment yet.
 */
export function getSiteUrlFromRequest(req: NextRequest): string {
  return req.nextUrl.origin || getSiteUrl();
}

/**
 * Whether a Checkout Session should be treated as paid/fulfillable. A
 * normal paid order comes back "paid" — but a session whose total is $0
 * (e.g. a free test tier) never collects a payment method at all, so
 * Stripe marks it "no_payment_required" instead. Both mean "go ahead and
 * fulfill this."
 */
export function isSessionSettled(status: Stripe.Checkout.Session.PaymentStatus): boolean {
  return status === "paid" || status === "no_payment_required";
}
