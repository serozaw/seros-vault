import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isSessionSettled } from "@/lib/stripe";
import { getManagementTierById } from "@/lib/services";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// Mirrors app/api/download/route.ts and app/api/booking-status/route.ts for
// the management retainer flow: verifies payment with Stripe directly and
// runs fulfillment immediately, so the management-confirmed page doesn't
// have to wait on the webhook.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const stripe = getStripe();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!isSessionSettled(session.payment_status)) {
    return NextResponse.json({ error: "Payment not completed yet." }, { status: 402 });
  }

  if (session.metadata?.kind !== "service") {
    return NextResponse.json({ error: "This isn't a management order." }, { status: 400 });
  }

  const tier = getManagementTierById(session.metadata?.tierId ?? "");
  if (!tier) {
    return NextResponse.json({ error: "Tier no longer available." }, { status: 404 });
  }

  await fulfillCheckout(session);

  return NextResponse.json({
    tierName: tier.name,
    email: session.customer_details?.email,
  });
}
