// ─────────────────────────────────────────────────────────────────────────
// MUSIC SHOWCASE
// Add your tracks here. Use `embedUrl` for a Spotify/SoundCloud/YouTube
// embed (easiest — just paste the embed link from their "Share > Embed"
// option), or `audioUrl` to self-host an mp3 in /public/audio and use the
// built-in player instead.
//
// SoundCloud embed URLs follow this shape (swap in your track's page URL,
// URL-encoded, after `url=`):
//   https://w.soundcloud.com/player/?url=<encoded-track-url>&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false
// ─────────────────────────────────────────────────────────────────────────

export type Track = {
  id: string;
  title: string;
  subtitle?: string;
  embedUrl?: string;
  audioUrl?: string;
  coverImage?: string;
};

/** Shown as a "Watch on YouTube" link alongside the tracks below. */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@SeroY2k";

export const TRACKS: Track[] = [
  {
    id: "btch",
    title: "btch",
    subtitle: "Prod. Bys0ld x Centrlx x Owekko",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fseroy2kk%2Fsero-btch-prodbys0ld-x-centrlx&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false",
  },
  {
    id: "cooked",
    title: "cooked",
    subtitle: "Prod. Drako",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fp1uginxsero2%2Fsero-cooked-prod-drako&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false",
  },
];
