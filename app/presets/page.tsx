import { PRESETS } from "@/lib/presets";
import PresetCard from "@/components/PresetCard";
import SampleVault3D from "@/components/SampleVault3D";

export const metadata = { title: "Presets — Sero's Vault" };

export default function PresetsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-14 text-center">
        <h1 className="font-display text-3xl sm:text-4xl vault-heading">Preset Vault</h1>
        <p className="mt-3 text-vault-muted">
          Pay securely with Stripe — your download unlocks the instant checkout
          completes, plus a copy in your inbox.
        </p>
      </div>

      <div className="mb-16 grid gap-10 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="mx-auto w-full max-w-[220px]">
          <SampleVault3D />
        </div>
        <div className="text-center lg:text-left">
          <p className="vault-kicker">Peek inside</p>
          <h2 className="mt-1 font-display text-xl sm:text-2xl">Give the zip a spin</h2>
          <p className="mx-auto mt-2 max-w-md text-vault-muted lg:mx-0">
            Drag it, spin it, click it — a taste of what&rsquo;s inside the vault. Full
            sample previews are dropping soon.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((p) => (
          <PresetCard key={p.id} preset={p} />
        ))}
      </div>
    </div>
  );
}
