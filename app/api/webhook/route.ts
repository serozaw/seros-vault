import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isSessionSettled } from "@/lib/stripe";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// This is the durable fulfillment path. The /download and /booking-confirmed
// pages also verify payment directly with Stripe so buyers get their file
// or confirmation the instant they land back on the site — this webhook is
// the backstop that guarantees fulfillment happens even if the buyer closes
// the tab before that redirect finishes (fulfillCheckout is idempotent, so
// whichever path runs first wins).
//
// Point a Stripe webhook endpoint at POST /api/webhook and subscribe it to
// "checkout.session.completed" (see README).
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (!isSessionSettled(session.payment_status)) {
    return NextResponse.json({ received: true });
  }

  try {
    await fulfillCheckout(session);
  } catch (err) {
    console.error("Fulfillment error:", err);
    // Return 500 so Stripe retries the webhook.
    return NextResponse.json({ error: "Fulfillment failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
