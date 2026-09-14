import { NextRequest, NextResponse } from "next/server";
import { getStripe, getSiteUrlFromRequest } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/db";
import { TIP_AMOUNTS_CENTS } from "@/lib/tips";

export const runtime = "nodejs";

// Creates a Stripe Checkout Session for a "Buy me a coffee" tip. No
// calendar slot, no preset file, no email required up front — Stripe's own
// hosted checkout collects the buyer's email at payment time, same as it
// does for the other flows (see session.customer_details?.email in
// lib/fulfill.ts). The amount is validated against the exact preset list
// the widget offers (lib/tips.ts) so a tampered client request can't set an
// arbitrary price.
export async function POST(req: NextRequest) {
  try {
    const { amountCents, message } = await req.json();

    if (typeof amountCents !== "number" || !TIP_AMOUNTS_CENTS.includes(amountCents)) {
      return NextResponse.json({ error: "Invalid tip amount." }, { status: 400 });
    }

    const cleanMessage = typeof message === "string" ? message.trim().slice(0, 300) : "";

    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: "Buy Sero a Coffee — Sero's Vault",
              description: "A tip to support the vault. Thank you!",
            },
          },
        },
      ],
      success_url: `${siteUrl}/tip-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: siteUrl,
      customer_creation: "always",
      invoice_creation: { enabled: true },
      metadata: {
        kind: "tip",
        message: cleanMessage,
      },
    });

    // Record the order as pending up front, same pattern as the other
    // checkout routes — the webhook (or /tip-confirmed, whichever runs
    // first) flips this to "paid".
    try {
      const supabase = getServerSupabase();
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "tip",
        amount_cents: amountCents,
        tip_message: cleanMessage || null,
        status: "pending",
      });
    } catch (dbErr) {
      console.error("Failed to pre-record tip order:", dbErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Tip checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
