import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { formatInTimeZone } from "date-fns-tz";
import { getPackageById } from "@/lib/packages";
import { getServerSupabase, HOLD_MINUTES } from "@/lib/db";
import { BOOKING_CONFIG } from "@/lib/booking-config";
import { getBlockedRange } from "@/lib/slots";
import { sendManualBookingRequestEmail, sendOwnerSaleNotification } from "@/lib/email";

export const runtime = "nodejs";

// Manual-payment booking path — used when BOOKING_CONFIG.paymentMode is
// "manual" (no payment processor involved). Same slot-claiming logic as
// the Stripe route (app/api/checkout/booking/route.ts): the database's
// exclusion constraint is what actually prevents double-booking. The
// difference is there's no payment step here — the slot is reserved
// immediately and payment is followed up on directly (Cash App etc).
export async function POST(req: NextRequest) {
  try {
    const { packageId, startsAt, email } = await req.json();
    const pkg = getPackageById(packageId);

    if (!pkg || !startsAt || !email) {
      return NextResponse.json({ error: "Missing package, time, or email." }, { status: 400 });
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

    // Release any expired Stripe-flow holds so their slots free up too.
    await supabase
      .from("bookings")
      .delete()
      .eq("status", "hold")
      .lt("created_at", new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString());

    // Claim the slot directly as "confirmed" — there's no payment step to
    // wait on here, so the slot is reserved the moment someone requests it.
    // (If payment never shows up, cancel the booking row in Supabase to
    // free the slot back up.)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        package_id: pkg.id,
        email,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "confirmed",
      })
      .select()
      .single();

    if (bookingError) {
      if (bookingError.code === "23P01") {
        return NextResponse.json(
          { error: "That slot was just taken. Please pick another time." },
          { status: 409 }
        );
      }
      throw bookingError;
    }

    const { data: order } = await supabase
      .from("orders")
      .insert({
        // No Stripe session exists for a manual booking — this satisfies
        // the column's NOT NULL + UNIQUE constraint without needing a
        // database migration.
        stripe_session_id: `manual-${randomUUID()}`,
        kind: "booking",
        package_id: pkg.id,
        email,
        amount_cents: pkg.priceCents,
        status: "pending",
      })
      .select()
      .single();

    if (order) {
      await supabase.from("bookings").update({ order_id: order.id }).eq("id", booking.id);
    }

    const { method, handle } = BOOKING_CONFIG.manualPayment;

    await sendManualBookingRequestEmail({ to: email, pkg, startsAt: start, method, handle });
    await sendOwnerSaleNotification({
      kind: "booking",
      itemName: pkg.name,
      amountCents: pkg.priceCents,
      buyerEmail: email,
      detail: `${start.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })} — awaiting ${method} payment`,
      footer: `Reserved via manual payment (${method}). Confirm with the buyer once you see it land — cancel the booking in Supabase if it doesn't.`,
    });

    return NextResponse.json({
      ok: true,
      packageName: pkg.name,
      startsAt: start.toISOString(),
      durationMinutes: pkg.durationMinutes,
      amountCents: pkg.priceCents,
      method,
      handle,
    });
  } catch (err) {
    console.error("Booking request error:", err);
    return NextResponse.json({ error: "Could not reserve that slot." }, { status: 500 });
  }
}
