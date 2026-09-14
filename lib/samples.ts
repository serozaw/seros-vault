// ─────────────────────────────────────────────────────────────────────────
// SAMPLE VAULT
// Powers the spinning 3D "SAMPLES.zip" on the Presets page (components/
// SampleVault3D.tsx). Each entry is one teaser inside the pack.
//
// Drop in an `audioUrl` once you have a real preview clip ready — self-host
// it in /public/audio and point to "/audio/whatever.mp3", or paste any
// hosted URL. Until a teaser has an audioUrl, the vault shows a tasteful
// "Preview coming soon" state for it automatically — nothing to change
// anywhere else.
// ─────────────────────────────────────────────────────────────────────────

export type SampleTeaser = {
  id: string;
  name: string;
  tag: string;
  audioUrl?: string;
};

export const SAMPLE_PACK_NAME = "Sero's Sample Vault";

export const SAMPLE_TEASERS: SampleTeaser[] = [
  { id: "s1", name: "808 Slide 01", tag: "Bass" },
  { id: "s2", name: "Vault Kick", tag: "Drums" },
  { id: "s3", name: "Glass Pluck", tag: "Melodic" },
  { id: "s4", name: "Vinyl Perc Loop", tag: "Loop" },
];
