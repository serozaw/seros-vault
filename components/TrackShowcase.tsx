import { Track } from "@/lib/tracks";

export default function TrackShowcase({ tracks }: { tracks: Track[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {tracks.map((track) => (
        <div key={track.id} className="vault-panel p-5">
          <h3 className="font-display text-lg">{track.title}</h3>
          {track.subtitle && (
            <p className="mb-3 text-sm text-vault-muted">{track.subtitle}</p>
          )}
          {track.embedUrl ? (
            <iframe
              src={track.embedUrl}
              className="mt-2 h-[166px] w-full rounded-lg border-0"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : track.audioUrl ? (
            <audio controls className="mt-2 w-full" preload="none">
              <source src={track.audioUrl} />
            </audio>
          ) : (
            <p className="mt-2 text-sm text-vault-muted">
              Add an embed or audio URL in lib/tracks.ts
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
