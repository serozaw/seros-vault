// ─────────────────────────────────────────────────────────────────────────
// FREE PRESET DEMOS
// YouTube videos demoing free presets — shown in the "Free Presets" section
// on the homepage. `youtubeId` is the part of the URL after youtu.be/ or
// ?v= (e.g. for https://youtu.be/L32oA0Bbhyk the id is "L32oA0Bbhyk").
// ─────────────────────────────────────────────────────────────────────────

export type FreeDemo = {
  id: string;
  title: string;
  youtubeId: string;
};

export const FREE_DEMOS: FreeDemo[] = [
  {
    id: "free-demo-1",
    title: "Free Preset Demo",
    youtubeId: "L32oA0Bbhyk",
  },
  {
    id: "free-demo-2",
    title: "Free Preset Demo",
    youtubeId: "HzySGnXxvEU",
  },
];
