import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isSessionSettled } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/db";
import { getPackageById } from "@/lib/packages";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// Mirrors app/api/download/route.ts for the booking flow: verifies payment
// with Stripe directly and runs fulfillment immediately, so the
// booking-confirmed page doesn't have to wait on the webhook.
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

  if (session.metadata?.kind !== "booking") {
    return NextResponse.json({ error: "This isn't a booking order." }, { status: 400 });
  }

  const pkg = getPackageById(session.metadata?.packageId ?? "");
  if (!pkg) {
    return NextResponse.json({ error: "Package no longer available." }, { status: 404 });
  }

  await fulfillCheckout(session);

  const bookingId = session.metadata?.bookingId;
  const supabase = getServerSupabase();
  const { data: booking } = bookingId
    ? await supabase
        .from("bookings")
        .select("starts_at, ends_at, status")
        .eq("id", bookingId)
        .maybeSingle()
    : { data: null };

  return NextResponse.json({
    packageName: pkg.name,
    durationMinutes: pkg.durationMinutes,
    startsAt: booking?.starts_at,
    status: booking?.status,
    email: session.customer_details?.email,
  });
}
