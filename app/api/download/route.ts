import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isSessionSettled } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/db";
import { getPresetById } from "@/lib/presets";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// Called by the /download page immediately after Stripe redirects back.
// Verifies payment directly against Stripe's API (not just trusting the
// URL) and reuses the same fulfillment logic the webhook uses, so the
// buyer gets their download link instantly instead of waiting for the
// webhook round-trip — while the webhook still runs as the durable backstop.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const stripe = getStripe();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!isSessionSettled(session.payment_status)) {
    return NextResponse.json({ error: "Payment not completed yet." }, { status: 402 });
  }

  if (session.metadata?.kind !== "preset") {
    return NextResponse.json({ error: "This isn't a preset order." }, { status: 400 });
  }

  const preset = getPresetById(session.metadata?.presetId ?? "");
  if (!preset) {
    return NextResponse.json({ error: "Preset no longer available." }, { status: 404 });
  }

  await fulfillCheckout(session);

  const supabase = getServerSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("download_token")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!order?.download_token) {
    return NextResponse.json({ error: "Could not generate your download." }, { status: 500 });
  }

  return NextResponse.json({
    presetName: preset.name,
    fileName: preset.fileName,
    downloadUrl: `/api/download/file?token=${order.download_token}`,
  });
}
