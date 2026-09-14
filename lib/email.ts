import { Resend } from "resend";
import { Preset } from "./presets";
import { CollabPackage } from "./packages";
import { ManagementTier } from "./services";
import { BOOKING_CONFIG } from "./booking-config";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email send.");
    return null;
  }
  return new Resend(key);
}

const DEFAULT_FROM = "Sero's Vault <onboarding@resend.dev>";

// Guards against a misconfigured EMAIL_FROM env var silently breaking every
// email. Resend rejects (422) any `from` that isn't `email@example.com` or
// `Name <email@example.com>` — e.g. accidentally pasting a DNS/MX record
// value in there instead of an address. Falling back keeps mail flowing
// while making the misconfiguration visible in the function logs.
const EMAIL_RE = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
function isValidFrom(value: string): boolean {
  const match = value.match(/^(.*)<(.+)>$/);
  const address = match ? match[2].trim() : value.trim();
  return EMAIL_RE.test(address);
}

const rawFrom = process.env.EMAIL_FROM;
if (rawFrom && !isValidFrom(rawFrom)) {
  console.error(
    `EMAIL_FROM env var ("${rawFrom}") is not a valid "email@example.com" or "Name <email@example.com>" address — falling back to ${DEFAULT_FROM}. Fix EMAIL_FROM in Vercel project settings.`
  );
}
const FROM = rawFrom && isValidFrom(rawFrom) ? rawFrom : DEFAULT_FROM;

// Appended to booking/management emails only (not presets — nothing to
// follow up on there) so buyers have a direct way to reach Sero afterward.
// Set BOOKING_CONFIG.contactPhone to "" to omit it.
function contactLine(): string {
  if (!BOOKING_CONFIG.contactPhone) return "";
  return `<p style="color:#a79bc4;font-size:13px">Screenshot this email and text it to Sero at <strong style="color:#f3eefc">${BOOKING_CONFIG.contactPhone}</strong></p>`;
}

export async function sendPresetDownloadEmail(opts: {
  to: string;
  preset: Preset;
  downloadUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your download: ${opts.preset.name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Thanks for your purchase! Your download is ready.</p>
        <p style="margin:24px 0">
          <a href="${opts.downloadUrl}"
             style="background:#a855f7;color:#0a0612;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
            Download ${opts.preset.name}
          </a>
        </p>
        <p style="color:#a79bc4;font-size:13px">
          This link is tied to your order. Keep this email if you need to re-download later.
        </p>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail(opts: {
  to: string;
  pkg: CollabPackage;
  startsAt: Date;
}) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Booking confirmed: ${opts.pkg.name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Your collab session is booked and paid in full.</p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>${opts.pkg.name}</strong><br/>
          ${opts.startsAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}<br/>
          ${opts.pkg.durationMinutes} minutes
        </p>
        <p style="color:#a79bc4;font-size:13px">
          You'll hear from Sero directly with session details ahead of time.
        </p>
        ${contactLine()}
      </div>
    `,
  });
}

// Notifies the store owner (you) every time something sells, so you don't
// have to keep checking the Stripe dashboard. Sent to OWNER_EMAIL — set
// that env var to whatever inbox you want sale alerts to land in.
export async function sendOwnerSaleNotification(opts: {
  kind: "preset" | "booking" | "service" | "tip";
  itemName: string;
  amountCents: number;
  buyerEmail?: string;
  detail?: string; // e.g. the booked date/time
  footer?: string; // override the default "check Stripe" line
}) {
  const resend = getResend();
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("OWNER_EMAIL not set — skipping owner sale notification.");
    return;
  }
  if (!resend) return;

  const amount = (opts.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const label =
    opts.kind === "preset"
      ? "Preset sale"
      : opts.kind === "booking"
      ? "Collab booking"
      : opts.kind === "service"
      ? "Management retainer"
      : "Coffee tip";

  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `💰 ${label}: ${opts.itemName} (${amount})`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">New sale — Sero's Vault</h2>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>${label}:</strong> ${opts.itemName}<br/>
          <strong>Amount:</strong> ${amount}<br/>
          ${opts.buyerEmail ? `<strong>Buyer:</strong> ${opts.buyerEmail}<br/>` : ""}
          ${opts.detail ? `${opts.detail}<br/>` : ""}
        </p>
        <p style="color:#a79bc4;font-size:13px">
          ${opts.footer || "Full order details are in your Stripe dashboard."}
        </p>
      </div>
    `,
  });
}

// Sent immediately when someone reserves a slot under manual payment mode
// (no Stripe involved) — tells them where to send payment to lock it in.
export async function sendManualBookingRequestEmail(opts: {
  to: string;
  pkg: CollabPackage;
  startsAt: Date;
  method: string;
  handle: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (opts.pkg.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your slot is reserved — send payment to confirm: ${opts.pkg.name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Your slot is reserved. Send payment to lock it in:</p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>${opts.pkg.name}</strong><br/>
          ${opts.startsAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}<br/>
          ${opts.pkg.durationMinutes} minutes<br/>
          <strong>Amount due:</strong> ${amount}
        </p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          Send ${amount} via <strong>${opts.method}</strong> to:<br/>
          <span style="font-size:20px;color:#d8b4fe">${opts.handle}</span>
        </p>
        <p style="color:#a79bc4;font-size:13px">
          You'll hear back with final confirmation once payment is received.
        </p>
        ${contactLine()}
      </div>
    `,
  });
}

// Sent when a management retainer is paid in full via Stripe Checkout —
// mirrors sendBookingConfirmationEmail, no calendar slot involved.
export async function sendServiceConfirmationEmail(opts: { to: string; tier: ManagementTier }) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Management retainer confirmed: ${opts.tier.name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Your management retainer is confirmed and paid in full.</p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>Management — ${opts.tier.name}</strong>
        </p>
        <p style="color:#a79bc4;font-size:13px">
          You'll hear from Sero directly to get things started.
        </p>
        ${contactLine()}
      </div>
    `,
  });
}

// Sent to the buyer right after a "Buy me a coffee" tip goes through — a
// quick, warm thank-you. No deliverable involved (unlike the other
// confirmation emails), so it's deliberately short.
export async function sendTipThankYouEmail(opts: {
  to: string;
  amountCents: number;
  message?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (opts.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Thank you for the coffee ☕ (${amount})`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Seriously — thank you. Support like this is what keeps the vault going.</p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>Coffee tip:</strong> ${amount}
          ${opts.message ? `<br/><em>&ldquo;${opts.message}&rdquo;</em>` : ""}
        </p>
        <p style="color:#a79bc4;font-size:13px">— Sero</p>
      </div>
    `,
  });
}

// Sent immediately when someone requests a management retainer tier under
// manual payment mode — same manual-payment pattern as bookings, no
// calendar slot involved.
export async function sendManualServiceRequestEmail(opts: {
  to: string;
  tier: ManagementTier;
  method: string;
  handle: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (opts.tier.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Management retainer request received — send payment to confirm: ${opts.tier.name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0612;color:#f3eefc;padding:32px">
        <h2 style="color:#d8b4fe;margin-bottom:4px">Sero's Vault</h2>
        <p>Thanks for reaching out. Send payment to lock in your management retainer:</p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          <strong>Management — ${opts.tier.name}</strong><br/>
          <strong>Amount due:</strong> ${amount}
        </p>
        <p style="margin:16px 0;padding:16px;background:#150f22;border:1px solid #2b2140;border-radius:8px">
          Send ${amount} via <strong>${opts.method}</strong> to:<br/>
          <span style="font-size:20px;color:#d8b4fe">${opts.handle}</span>
        </p>
        <p style="color:#a79bc4;font-size:13px">
          You'll hear back with final confirmation once payment is received.
        </p>
        ${contactLine()}
      </div>
    `,
  });
}
