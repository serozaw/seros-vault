import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isSessionSettled } from "@/lib/stripe";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// Mirrors app/api/booking-status/route.ts and app/api/service-status/route.ts:
// verifies payment directly with Stripe and runs fulfillment immediately, so
// /tip-confirmed doesn't have to wait on the webhook to show a result.
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

  if (session.metadata?.kind !== "tip") {
    return NextResponse.json({ error: "This isn't a tip order." }, { status: 400 });
  }

  await fulfillCheckout(session);

  return NextResponse.json({
    amountCents: session.amount_total ?? 0,
    email: session.customer_details?.email,
  });
}
