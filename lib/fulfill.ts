import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getServerSupabase } from "@/lib/db";
import { getPresetById } from "@/lib/presets";
import { getPackageById } from "@/lib/packages";
import { getManagementTierById } from "@/lib/services";
import {
  sendPresetDownloadEmail,
  sendBookingConfirmationEmail,
  sendServiceConfirmationEmail,
  sendTipThankYouEmail,
  sendOwnerSaleNotification,
} from "@/lib/email";
import { getSiteUrl } from "@/lib/stripe";

// The single source of truth for fulfillment, called from two places:
//   - app/api/webhook/route.ts — the durable path, triggered by Stripe.
//   - app/api/download/route.ts and app/api/booking-status/route.ts — the
//     instant path, triggered by the buyer's browser landing back on the
//     site after checkout, so they never have to wait on the webhook.
// Both paths converge here and this function is idempotent (safe to call
// twice for the same session), so whichever runs first "wins" and the
// other is a no-op.
export async function fulfillCheckout(session: Stripe.Checkout.Session) {
  const supabase = getServerSupabase();
  const kind = session.metadata?.kind;
  const email = session.customer_details?.email || undefined;
  const siteUrl = getSiteUrl();

  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing?.status === "paid") {
    return; // Already fulfilled.
  }

  if (kind === "preset") {
    const presetId = session.metadata?.presetId;
    const preset = presetId ? getPresetById(presetId) : undefined;
    if (!preset) throw new Error(`Unknown preset in session ${session.id}`);

    const downloadToken = existing?.download_token || randomUUID();

    if (existing) {
      await supabase
        .from("orders")
        .update({ status: "paid", email, download_token: downloadToken })
        .eq("id", existing.id);
    } else {
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "preset",
        preset_id: preset.id,
        email,
        amount_cents: preset.priceCents,
        status: "paid",
        download_token: downloadToken,
      });
    }

    if (email) {
      await sendPresetDownloadEmail({
        to: email,
        preset,
        downloadUrl: `${siteUrl}/api/download/file?token=${downloadToken}`,
      });
    }

    await sendOwnerSaleNotification({
      kind: "preset",
      itemName: preset.name,
      amountCents: preset.priceCents,
      buyerEmail: email,
    });
  } else if (kind === "booking") {
    const packageId = session.metadata?.packageId;
    const bookingId = session.metadata?.bookingId;
    const pkg = packageId ? getPackageById(packageId) : undefined;
    if (!pkg || !bookingId) throw new Error(`Unknown booking in session ${session.id}`);

    if (existing) {
      await supabase.from("orders").update({ status: "paid", email }).eq("id", existing.id);
    } else {
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "booking",
        package_id: pkg.id,
        email,
        amount_cents: pkg.priceCents,
        status: "paid",
      });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .update({ status: "confirmed", email })
      .eq("id", bookingId)
      .select()
      .maybeSingle();

    if (email && booking) {
      await sendBookingConfirmationEmail({
        to: email,
        pkg,
        startsAt: new Date(booking.starts_at),
      });
    }

    await sendOwnerSaleNotification({
      kind: "booking",
      itemName: pkg.name,
      amountCents: pkg.priceCents,
      buyerEmail: email,
      detail: booking
        ? new Date(booking.starts_at).toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "short",
          })
        : undefined,
    });
  } else if (kind === "service") {
    const tierId = session.metadata?.tierId;
    const tier = tierId ? getManagementTierById(tierId) : undefined;
    if (!tier) throw new Error(`Unknown management tier in session ${session.id}`);

    if (existing) {
      await supabase.from("orders").update({ status: "paid", email }).eq("id", existing.id);
    } else {
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "service",
        service_id: tier.id,
        email,
        amount_cents: tier.priceCents,
        status: "paid",
      });
    }

    if (email) {
      await sendServiceConfirmationEmail({ to: email, tier });
    }

    await sendOwnerSaleNotification({
      kind: "service",
      itemName: `Management — ${tier.name}`,
      amountCents: tier.priceCents,
      buyerEmail: email,
      footer: "Paid via Stripe. Reach out to get started.",
    });
  } else if (kind === "tip") {
    // No fixed price list to look up — the amount actually charged (and
    // validated server-side against lib/tips.ts at checkout time) is the
    // source of truth, so read it straight off the settled session.
    const amountCents = session.amount_total ?? 0;
    const message = session.metadata?.message || undefined;

    if (existing) {
      await supabase.from("orders").update({ status: "paid", email }).eq("id", existing.id);
    } else {
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        kind: "tip",
        email,
        amount_cents: amountCents,
        tip_message: message || null,
        status: "paid",
      });
    }

    if (email) {
      await sendTipThankYouEmail({ to: email, amountCents, message });
    }

    await sendOwnerSaleNotification({
      kind: "tip",
      itemName: "Buy me a coffee",
      amountCents,
      buyerEmail: email,
      detail: message ? `&ldquo;${message}&rdquo;` : undefined,
      footer: "Someone just bought you a coffee. \u{1F389}",
    });
  }
}
