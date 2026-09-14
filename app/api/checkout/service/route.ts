import { NextRequest, NextResponse } from "next/server";
import { getStripe, getSiteUrlFromRequest } from "@/lib/stripe";
import { getManagementTierById } from "@/lib/services";
import { getServerSupabase } from "@/lib/db";

export const runtime = "nodejs";

// Creates a Stripe Checkout Session for a management retainer tier and
// records a pending order. Same shape as the preset checkout route — no
// calendar slot to hold, so it's a straightforward "pay, then fulfill".
// The buyer pays on Stripe's hosted page; on success they land on
// /management-confirmed?session_id=... which verifies payment and confirms
// immediately (see app/api/service-status/route.ts) — no waiting on email.
export async function POST(req: NextRequest) {
  try {
    const { tierId, email } = await req.json();
    const tier = getManagementTierById(tierId);

    if (!tier) {
      return NextResponse.json({ error: "Unknown tier." }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: tier.priceCents,
            product_data: {
              name: `Management — ${tier.name} — Sero's Vault`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/management-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/management`,
      customer_creation: "always",
      customer_email: email || undefined,
      invoice_creation: { enabled: true },
      metadata: { kind: "service", tierId: tier.id },
    });

    // Record the order as pending up front. The webhook (or the
    // management-confirmed page, whichever runs first) flips this to "paid".
    try {
      const supabase = getServerSupabase();
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "service",
        service_id: tier.id,
        email: email || null,
        amount_cents: tier.priceCents,
        status: "pending",
      });
    } catch (dbErr) {
      // Don't block checkout on this — the confirmation page can upsert
      // the order itself once the session comes back paid.
      console.error("Failed to pre-record service order:", dbErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Service checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
