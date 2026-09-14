import { NextRequest, NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { getStripe, getSiteUrlFromRequest } from "@/lib/stripe";
import { getPackageById } from "@/lib/packages";
import { getServerSupabase, HOLD_MINUTES } from "@/lib/db";
import { BOOKING_CONFIG } from "@/lib/booking-config";
import { getBlockedRange } from "@/lib/slots";

export const runtime = "nodejs";

// Books a collab slot. Sequence, in order:
//   1. Delete any expired holds so their slots become available again.
//   2. Insert a new "hold" row for the requested slot. The database's
//      exclusion constraint (see supabase/schema.sql) makes it physically
//      impossible for two holds/bookings to overlap, even under concurrent
//      requests — this is what actually prevents double-booking, not the
//      application code.
//   3. Create a Stripe Checkout Session that expires before the hold does,
//      and record a pending order.
// Payment is collected in full, upfront, before the booking is confirmed.
export async function POST(req: NextRequest) {
  try {
    const { packageId, startsAt, email } = await req.json();
    const pkg = getPackageById(packageId);

    if (!pkg || !startsAt) {
      return NextResponse.json({ error: "Missing package or time." }, { status: 400 });
    }

    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
      return NextResponse.json({ error: "Invalid or past start time." }, { status: 400 });
    }
    const end = new Date(start.getTime() + pkg.durationMinutes * 60_000);

    const localDate = formatInTimeZone(start, BOOKING_CONFIG.timezone, "yyyy-MM-dd");
    const blocked = getBlockedRange(localDate);
    if (blocked) {
      return NextResponse.json(
        { error: `That date isn't available${blocked.reason ? ` (${blocked.reason})` : ""}.` },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // 1. Release expired holds.
    await supabase
      .from("bookings")
      .delete()
      .eq("status", "hold")
      .lt("created_at", new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString());

    // 2. Try to claim the slot.
    const { data: hold, error: holdError } = await supabase
      .from("bookings")
      .insert({
        package_id: pkg.id,
        email: email || null,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "hold",
      })
      .select()
      .single();

    if (holdError) {
      // Postgres exclusion-constraint violation = someone already holds/has this slot.
      if (holdError.code === "23P01") {
        return NextResponse.json(
          { error: "That slot was just taken. Please pick another time." },
          { status: 409 }
        );
      }
      throw holdError;
    }

    // 3. Create the Checkout Session. It expires well before the hold does
    // (Stripe's own minimum is 30 minutes) so a payment can never complete
    // after the hold has already been swept and the slot given away.
    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(req);
    const STRIPE_SESSION_MINUTES = 30;
    const expiresAt = Math.floor(Date.now() / 1000) + STRIPE_SESSION_MINUTES * 60;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: pkg.priceCents,
              product_data: {
                name: `${pkg.name} — Sero's Vault Collab Booking`,
                description: `${formatInTimeZone(
                  start,
                  BOOKING_CONFIG.timezone,
                  "MMM d, yyyy h:mm a zzz"
                )} • ${pkg.durationMinutes} min`,
              },
            },
          },
        ],
        success_url: `${siteUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/book`,
        customer_creation: "always",
        customer_email: email || undefined,
        expires_at: expiresAt,
        invoice_creation: { enabled: true },
        metadata: {
          kind: "booking",
          packageId: pkg.id,
          bookingId: hold.id,
          startsAt: start.toISOString(),
        },
      });
    } catch (stripeErr) {
      // Release the hold if Stripe failed to create a session for it.
      await supabase.from("bookings").delete().eq("id", hold.id);
      throw stripeErr;
    }

    // Record the pending order and link it to the hold.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        kind: "booking",
        package_id: pkg.id,
        email: email || null,
        amount_cents: pkg.priceCents,
        status: "pending",
      })
      .select()
      .single();

    if (!orderError && order) {
      await supabase.from("bookings").update({ order_id: order.id }).eq("id", hold.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Booking checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
