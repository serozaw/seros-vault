import { NextRequest, NextResponse } from "next/server";
import { getManagementTierById } from "@/lib/services";
import { BOOKING_CONFIG } from "@/lib/booking-config";
import { sendManualServiceRequestEmail, sendOwnerSaleNotification } from "@/lib/email";

export const runtime = "nodejs";

// Management retainer requests. Unlike presets and bookings, there's no
// file to gate and no calendar slot to protect from double-booking, so
// this doesn't touch Supabase at all — it just sends the buyer payment
// instructions and notifies you. Reuses the same Cash App handle as
// manual bookings (lib/booking-config.ts).
export async function POST(req: NextRequest) {
  try {
    const { tierId, email } = await req.json();
    const tier = getManagementTierById(tierId);

    if (!tier || !email) {
      return NextResponse.json({ error: "Missing tier or email." }, { status: 400 });
    }

    const { method, handle } = BOOKING_CONFIG.manualPayment;

    await sendManualServiceRequestEmail({ to: email, tier, method, handle });
    await sendOwnerSaleNotification({
      kind: "service",
      itemName: `Management — ${tier.name}`,
      amountCents: tier.priceCents,
      buyerEmail: email,
      footer: `Requested via manual payment (${method}). Follow up with the buyer once you see it land.`,
    });

    return NextResponse.json({
      ok: true,
      tierName: tier.name,
      amountCents: tier.priceCents,
      method,
      handle,
    });
  } catch (err) {
    console.error("Service request error:", err);
    return NextResponse.json({ error: "Could not submit that request." }, { status: 500 });
  }
}
