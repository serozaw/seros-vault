# Sero's Vault

A Next.js site for showcasing your music, selling preset packs with instant
automatic delivery, and taking paid collab bookings — built on Stripe.

## What's here

- **Home** (`/`) — music showcase + featured presets + collab CTA
- **Presets store** (`/presets`) — Stripe Checkout, instant download on payment
- **Booking** (`/book`) — pick a package + time slot, pay in full, instantly confirmed
- **Support widget** — a floating "☕ Buy me a coffee" button on every page
  (plus a nav/footer link) for $5–$100 tips, no calendar or file involved
- Real double-booking prevention at the database level (not just app logic)
- A webhook that guarantees delivery/confirmation even if someone closes the
  tab right after paying, plus an instant path so they don't have to wait on it

## The stack, and why

| Piece | Tool | Why |
|---|---|---|
| Payments | **Stripe Checkout** | You asked for it — handles cards, receipts, tax if you turn it on, fraud protection |
| Hosting | **Vercel** | Built for Next.js, generous free tier, `git push` to deploy |
| Database | **Supabase** (Postgres) | Free tier, holds orders + the booking calendar |
| File storage | **Vercel Blob** | Where your preset .zip files live |
| Email | **Resend** | Sends the download link / booking confirmation |
| Domain | Your choice (Namecheap, Cloudflare, Vercel Domains, etc.) | Point it at Vercel once you have one |

Total to run this for real: **$0/month** to start (all five services have
free tiers that comfortably cover a small store), scaling with sales.
Stripe takes ~2.9% + $0.30 per transaction; everything else is free until
you outgrow it.

## 1. Get the accounts

1. **Stripe** — [stripe.com](https://stripe.com), verify your business, grab
   your API keys from **Developers > API keys**. Start in test mode.
2. **Vercel** — [vercel.com](https://vercel.com), sign up with GitHub.
3. **Supabase** — [supabase.com](https://supabase.com), create a new project
   (pick a strong database password, save it somewhere).
4. **Resend** — [resend.com](https://resend.com), grab an API key. To send
   from your own domain (recommended) verify it under **Domains**; until
   then you can send from `onboarding@resend.dev` for testing.

## 2. Set up the database

In your Supabase project: **SQL Editor > New query**, paste the contents of
`supabase/schema.sql`, and run it. That creates the `orders` and `bookings`
tables and the constraint that makes double-booking impossible.

## 3. Push this code to GitHub

```bash
cd seros-vault
git init
git add .
git commit -m "Sero's Vault"
```

Create a new repo on GitHub and push it there.

## 4. Deploy on Vercel

1. **Import Project** in Vercel, pick your repo.
2. Add the **Vercel Blob** storage integration (Storage tab > Create Database
   > Blob) — this is where preset files will live. The app doesn't need a
   token for it at runtime; you'll use `vercel blob put` from the CLI when
   uploading a pack (see "Adding a preset pack" below).
3. Add the rest of the environment variables (from `.env.example`):
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe dashboard)
   - `STRIPE_WEBHOOK_SECRET` (step 6 below — come back and add this after)
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL, e.g. `https://serosvault.vercel.app`, or your domain once connected)
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase project settings > API — service role key, not anon)
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `OWNER_EMAIL` — your own inbox, gets a notification every time something sells
4. Deploy.

## 5. Connect your domain

In Vercel: **Settings > Domains**, add your domain, follow the DNS
instructions from whichever registrar you bought it from (any registrar
works — Vercel just needs a couple of DNS records pointed at it). Once
connected, update `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy.

## 6. Wire up the Stripe webhook (do this after step 4)

1. Stripe dashboard > **Developers > Webhooks > Add endpoint**.
2. URL: `https://yourdomain.com/api/webhook`
3. Events to send: `checkout.session.completed`
4. Copy the **Signing secret** it gives you, add it to Vercel as
   `STRIPE_WEBHOOK_SECRET`, redeploy.

This webhook is your safety net — it's what guarantees a buyer's download
or booking confirmation goes out even if their browser closes right after
paying. The site *also* verifies payment the instant they land back on the
page, so in practice they never wait on it.

## 7. Go live

Everything above works in Stripe **test mode** (use card `4242 4242 4242
4242`, any future date/CVC, to test a full purchase). When you're ready:

1. Finish Stripe's business verification (**Activate your account**).
2. Swap your env vars from test keys (`sk_test_...`) to live keys
   (`sk_live_...`), and re-create the webhook endpoint in live mode.
3. Do one real test purchase yourself for $1 or your cheapest item.

## Adding a preset pack

1. Zip up the preset files.
2. Upload it to Vercel Blob. Easiest way — install the Vercel CLI once
   (`npm i -g vercel`, then `vercel link` inside this project), then:
   ```bash
   npx vercel blob put path/to/your-pack.zip --add-random-suffix
   ```
   That prints a URL like
   `https://xxxx.public.blob.vercel-storage.com/your-pack-ab12cd.zip` —
   copy it.
3. Open `lib/presets.ts`, copy an existing entry, and fill in `id` (unique,
   permanent), `name`, `description`, `priceCents`, `fileUrl` (the URL from
   step 2), and `fileName` (what buyers see when it downloads).
4. Add a cover image to `public/images/` and reference it as
   `coverImage: "/images/your-file.jpg"`.
5. Commit, push — Vercel redeploys automatically.

**Why the random-suffix URL matters:** it's what keeps the file from being
downloadable by anyone who doesn't go through checkout. Don't post the raw
Blob URL anywhere public.

## Selling through Gumroad (e.g. while Stripe is restricted)

Any pack can be sold through Gumroad instead of your own Stripe checkout —
useful if your Stripe account is under review, or you just want a second
sales channel.

1. Create a [Gumroad](https://gumroad.com) account and add a product for the
   pack — upload the same zip you'd have used for Vercel Blob, set the same
   price.
2. Copy that product's page URL.
3. In `lib/presets.ts`, add `gumroadUrl: "https://yourname.gumroad.com/l/xxxx"`
   to that preset's entry.
4. Commit, push. That pack's "Buy now" button now links straight to
   Gumroad's checkout instead of Stripe — everything else on the site is
   unaffected.
5. To sell it through the site again later, just delete the `gumroadUrl`
   line and redeploy.

**Keep the price in sync manually.** For a pack routed through Gumroad, the
`priceCents` in `lib/presets.ts` is just the number shown on the card —
the actual charge happens on Gumroad's own checkout page, using whatever
price you set *there*. If you change one, change the other, or the site
will show a different price than what Gumroad actually charges.

Gumroad takes 10% + $0.50 per sale (vs. Stripe's ~2.9% + $0.30) and handles
its own delivery and receipts — you don't need Vercel Blob or Resend for
anything routed through it.

**Bookings can't move to Gumroad** — there's no calendar/scheduling
equivalent there. See the next section for how bookings work without
Stripe.

## Taking booking payments without Stripe (manual/Cash App)

`lib/booking-config.ts` has a `paymentMode` switch:

- `"stripe"` — **currently on.** Normal automated Stripe Checkout: the
  buyer pays on Stripe's hosted page, the booking confirms instantly, and
  money settles to your bank via Stripe payouts.
- `"manual"` — no payment processor involved: someone reserves a slot on
  `/book`, the database locks it in immediately (the same
  double-booking-proof logic as the Stripe flow), and they're shown — and
  emailed — your `manualPayment.handle` (Cash App, by default) with the
  amount to send. You get an email too, so you know to watch for it.
  Because there's no payment API to confirm anything automatically,
  **you have to follow up by hand** in this mode: watch for the Cash App
  payment, then reach out to the buyer to confirm. If someone reserves a
  slot and never pays, the booking stays on your calendar until you cancel
  it — go into Supabase (**Table Editor > bookings**), find the row (by
  email or time), and either delete it or set its `status` to `cancelled`
  to free the slot back up.
- `"paused"` — booking turned off entirely with a "check back" notice.

Switching modes just means changing this one value and redeploying — the
code path for whichever mode isn't active is never removed, just dormant.

## Management retainer (`/management`)

A separate product from collab bookings — ongoing access for a fixed
period rather than a scheduled session, so it has no calendar involved.
Edit tiers, pricing, and the "what you get" list in `lib/services.ts`.

It has its own `SERVICE_PAYMENT_MODE` switch in `lib/services.ts`, same
three options as bookings above:

- `"stripe"` — **currently on.** Automated Stripe Checkout
  (`app/api/checkout/service`) — buyer pays on Stripe's hosted page and
  lands on `/management-confirmed` instantly.
- `"manual"` — same Cash App pattern as manual bookings: someone picks a
  term, submits their email, and immediately gets your `manualPayment`
  handle (from `lib/booking-config.ts`) with the amount due — you follow
  up once payment lands.
- `"paused"` — retainer requests turned off with a "check back" notice.

**If you're switching this to `"stripe"` on a project whose Supabase
database was created before this option existed,** run
`supabase/migrations/002_add_service_kind.sql` once in the Supabase SQL
editor first — it adds the `service` order kind and a `service_id` column
that the Stripe flow needs. A brand-new project created from the current
`supabase/schema.sql` already has these and can skip it.

## Support widget ("Buy me a coffee")

A floating ☕ button (bottom-right, every page) plus a "☕ Support" link in
the nav and footer open a small modal where someone can pick a preset tip
amount ($5/$10/$25/$50/$100 — edit the list in `lib/tips.ts`) and leave an
optional note, then pay through the same Stripe Checkout as everything
else. No calendar slot, no file, no email required up front — Stripe
collects the buyer's email at checkout, same as the preset flow.

You get a "💰 Coffee tip" owner notification (with their note, if they left
one) the same way you do for every other sale, and if they gave an email
they get a short thank-you back.

**If your Supabase database was created before this feature existed,** run
`supabase/migrations/003_add_tip_kind.sql` once in the Supabase SQL editor
first — it adds the `tip` order kind and a `tip_message` column. A
brand-new project created from the current `supabase/schema.sql` already
has these and can skip it.

## Editing your other prices

- Collab packages (Verse Session, Full Track, Custom Beat, Custom
  Presets, Mix & Master): `lib/packages.ts`
- Preset packs: `lib/presets.ts` (and the pack's own Gumroad listing, if
  it's routed there — see above)
- Management tiers: `lib/services.ts`

All prices are in whole cents (`priceCents: 2500` = $25.00).

## Adding music to the showcase

Edit `lib/tracks.ts`. Easiest option: paste a Spotify/SoundCloud/YouTube
"embed" link as `embedUrl`. Or drop an mp3 in `public/audio/` and reference
it as `audioUrl`.

## Changing collab packages / booking hours

- Packages, pricing, durations: `lib/packages.ts`
- Your available hours, timezone, how far out people can book:
  `lib/booking-config.ts`

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

To test webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
and run `stripe listen --forward-to localhost:3000/api/webhook` — it'll give
you a temporary webhook secret to put in `.env.local`.

## How the "instant delivery" actually works

1. Buyer pays on Stripe's hosted Checkout page.
2. Stripe redirects them back to `/download?session_id=...` (presets) or
   `/booking-confirmed?session_id=...` (bookings).
3. That page immediately asks the server to verify the session directly
   with Stripe's API and run fulfillment right then — so the download
   link or booking confirmation appears in seconds, without waiting on
   anything async.
4. Stripe also fires a webhook to `/api/webhook` in the background, which
   runs the exact same fulfillment logic. It's a no-op if step 3 already
   ran; it's the thing that saves the sale if the buyer closed the tab
   before step 3 finished.

## A note on scope

This is a full custom build, not a page-builder template — you own the
code and can extend it (add more packages, a blog, an admin dashboard,
whatever comes next). If at any point maintaining the Vercel/Supabase/
Stripe side feels like more than you want to deal with, the fallback is
migrating the store portion to something like Payhip or Gumroad and
keeping this front end for the portfolio — but nothing here locks you in
either way.
