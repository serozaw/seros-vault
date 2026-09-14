import { FreeDemo } from "@/lib/free-demos";

export default function FreeDemos({ demos }: { demos: FreeDemo[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {demos.map((demo) => (
        <div key={demo.id} className="vault-panel overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${demo.youtubeId}`}
              className="h-full w-full border-0"
              title={demo.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4">
            <h3 className="font-display text-base text-vault-text">{demo.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
