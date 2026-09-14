import { NextRequest, NextResponse } from "next/server";
import { getStripe, getSiteUrlFromRequest } from "@/lib/stripe";
import { getPresetById } from "@/lib/presets";
import { getServerSupabase } from "@/lib/db";

export const runtime = "nodejs";

// Creates a Stripe Checkout Session for a single preset pack and records a
// pending order. The buyer pays on Stripe's hosted page; on success they
// land on /download?session_id=... which verifies payment and unlocks the
// file immediately (see app/api/download/route.ts) — no waiting on email.
export async function POST(req: NextRequest) {
  try {
    const { presetId } = await req.json();
    const preset = getPresetById(presetId);

    if (!preset) {
      return NextResponse.json({ error: "Unknown preset." }, { status: 400 });
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
            unit_amount: preset.priceCents,
            product_data: {
              name: `${preset.name} — Sero's Vault`,
              description: preset.description,
              images: preset.coverImage.startsWith("http") ? [preset.coverImage] : undefined,
            },
          },
        },
      ],
      success_url: `${siteUrl}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/presets`,
      customer_creation: "if_required",
      invoice_creation: { enabled: true },
      metadata: { kind: "preset", presetId: preset.id },
    });

    // Record the order as pending up front. The webhook (or the download
    // page, whichever runs first) flips this to "paid".
    try {
      const supabase = getServerSupabase();
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "preset",
        preset_id: preset.id,
        amount_cents: preset.priceCents,
        status: "pending",
      });
    } catch (dbErr) {
      // Don't block checkout on this — the download page can upsert the
      // order itself once the session comes back paid.
      console.error("Failed to pre-record preset order:", dbErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Preset checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
