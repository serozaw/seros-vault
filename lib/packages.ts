// ─────────────────────────────────────────────────────────────────────────
// COLLAB / BOOKING PACKAGES
// Edit this file to change what people can book. `durationMinutes` sets how
// long the slot blocks off on the calendar. Payment mode (Stripe vs. Cash
// App vs. paused) is set in lib/booking-config.ts, not here.
// ─────────────────────────────────────────────────────────────────────────

export type CollabPackage = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  deliverables: string[];
};

export const PACKAGES: CollabPackage[] = [
  {
    id: "session-verse",
    name: "Verse Session",
    description: "One focused session — a verse, hook, or feature on your track.",
    priceCents: 5000,
    durationMinutes: 90,
    deliverables: ["Recorded & comped vocal or instrumental part", "Rough mix bounce", "Session stems"],
  },
  {
    id: "full-track",
    name: "Full Track Collab",
    description: "Full collaboration from concept to a mix-ready record.",
    priceCents: 20000,
    durationMinutes: 240,
    deliverables: ["Full production", "Arrangement", "Rough mix", "Trackout stems"],
  },
  {
    id: "custom-beat-vc",
    name: "Custom Beat (Live VC)",
    description:
      "A beat built live with you on a video call, start to finish. $240–$400 depending on length (120–300 min) — this books the 120-min base session; if it runs longer we'll square up the difference directly.",
    priceCents: 24000,
    durationMinutes: 120,
    deliverables: ["Live video-call session", "Finished beat", "Trackout stems"],
  },
  {
    id: "custom-presets-vc",
    name: "Custom Presets (Live VC)",
    description: "Custom presets built live with you on a video call.",
    priceCents: 5000,
    durationMinutes: 120,
    deliverables: ["Live video-call session", "Custom preset pack built to spec"],
  },
  {
    id: "mix-master",
    name: "Mix & Master",
    description: "Professional mix and master on a track you already recorded.",
    priceCents: 12000,
    durationMinutes: 120,
    deliverables: ["Mixed & mastered WAV", "MP3 for streaming", "Instrumental version"],
  },
];

export function getPackageById(id: string): CollabPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}
