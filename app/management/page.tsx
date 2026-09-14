import ManagementTiers from "@/components/ManagementTiers";

export const metadata = { title: "Management — Sero's Vault" };

export default function ManagementPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="font-display text-3xl sm:text-4xl vault-heading">Music Management &amp; Artist Development</h1>
        <p className="mt-4 text-vault-muted">
          We help independent artists turn their music into a platform. From music promotion
          and platform growth to professional mixing, producer connections, and artist
          networking, we provide the tools and connections you need to take your career to the
          next level.
        </p>
      </div>
      <ManagementTiers />
      <div className="mx-auto mt-14 max-w-2xl text-center">
        <p className="font-display text-lg text-vault-accentbright">
          Your music. Your vision. Our connections.
        </p>
        <p className="mt-2 text-sm text-vault-muted">
          We help you lock in, build your platform, and get your music heard.
        </p>
      </div>
    </div>
  );
}
