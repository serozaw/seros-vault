// ─────────────────────────────────────────────────────────────────────────
// PRESET CATALOG
// Edit this file to add, remove, or reprice preset packs. Each entry needs:
//   - a unique `id` (never reuse an id, even after removing a pack — old
//     orders reference it)
//   - `priceCents` in whole cents (e.g. 1999 = $19.99)
//   - `fileUrl` — the URL Vercel Blob gave you back after you uploaded the
//     zip (see README "Adding a preset pack"). It contains a long random
//     suffix, which is what keeps the file from being downloadable by
//     anyone who doesn't come through checkout — don't post it publicly.
//   - `gumroadUrl` (optional) — set this and the "Buy now" button sends
//     buyers straight to that Gumroad product page instead of your own
//     Stripe checkout. Use this for any pack you're selling through Gumroad
//     right now (e.g. while Stripe is unavailable); leave it unset once
//     Stripe's back to sell it through the site directly again. See README
//     "Selling through Gumroad" for the full how-to.
// After editing, redeploy the site for changes to go live.
// ─────────────────────────────────────────────────────────────────────────

export type Preset = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  priceCents: number;
  coverImage: string;
  audioPreviewUrl?: string;
  tags: string[];
  /** Full URL returned by Vercel Blob when you uploaded the deliverable. */
  fileUrl: string;
  /** Human-readable file name the buyer will see when they download. */
  fileName: string;
  /** Set to sell this pack through Gumroad instead of the site's Stripe checkout. */
  gumroadUrl?: string;
};

export const PRESETS: Preset[] = [
  {
    id: "support-drum-kit",
    slug: "support-drum-kit",
    name: "Support + Free Demo",
    description: "43-sound drum kit — 808s, kicks, snares, claps, hats & percs. Free.",
    longDescription:
      "Carries 8 - 808's, 3 - Hi-Hats, 5 - Claps, 4 - Open Hats, 5 - Kicks, 9 - Percs, 9 - Snares. Total of 43 sounds.",
    priceCents: 0,
    coverImage: "/images/preset-support-drum-kit.jpg",
    tags: ["Drum Kit", "Free", "808s"],
    fileUrl: "https://8npelibmjbhznaqv.public.blob.vercel-storage.com/Drums-QM2pHQHkMjN158Z7voUbxNkI2L2h2U.zip",
    fileName: "Seros-Vault-Support-Drum-Kit.zip",
  },
  {
    id: "digital-era",
    slug: "digital-era",
    name: "Digital Era",
    description: "Sero's signature main-chain: vocal, delay, reverb & texture presets.",
    longDescription:
      "5 presets pulled straight from Sero's own sessions — the exact vocal, delay, reverb, and texture-layer chain behind the Digital Era sound. Drop them in and go.",
    priceCents: 2500,
    coverImage: "/images/preset-digital-era.jpg",
    tags: ["Signature", "Vocal Chain", "FX"],
    fileUrl: "https://REPLACE-ME.public.blob.vercel-storage.com/digital-era-XXXXXX.zip",
    fileName: "Seros-Vault-Digital-Era.zip",
    gumroadUrl: "https://seroy2k.gumroad.com/l/yhszft",
  },

  // The starter placeholder packs (Midnight Drift Vol. 1, Vault Drums 001,
  // Glasswave FX) have been pulled from the storefront for now — they were
  // never real products (fake fileUrl placeholders). Copy the shape above
  // to add real packs back in whenever they're ready.
];

export function getPresetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
