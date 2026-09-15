import Link from "next/link";
import { PRESETS } from "@/lib/presets";
import { TRACKS, YOUTUBE_CHANNEL_URL } from "@/lib/tracks";
import { FREE_DEMOS } from "@/lib/free-demos";
import PresetCard from "@/components/PresetCard";
import TrackShowcase from "@/components/TrackShowcase";
import FreeDemos from "@/components/FreeDemos";
import Reveal from "@/components/Reveal";
import GhostMascot from "@/components/GhostMascot";
import EqualizerBars from "@/components/EqualizerBars";

const TRUST_STRIP = [
  { icon: "🔒", label: "Secure Stripe checkout" },
  { icon: "⚡", label: "Instant confirmation" },
  { icon: "🎧", label: "Studio-grade quality" },
];

export default function HomePage() {
  const featured = PRESETS.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="vault-hero px-6 pt-24 pb-24 text-center">
        <GhostMascot
          size={72}
          className="hidden sm:block"
          style={{ top: "14%", right: "9%" }}
        />
        <GhostMascot
          size={40}
          className="ghost-mascot-sm hidden md:block"
          style={{ bottom: "12%", left: "7%" }}
        />
        <div className="mx-auto max-w-6xl">
          <p className="hero-animate hero-animate-1 mb-2 text-sm uppercase tracking-[0.3em] text-vault-accent">
            Producer &middot; Sound Designer
          </p>
          <h1 className="hero-animate hero-animate-2 neon-text text-6xl sm:text-8xl leading-[1.05] py-2">
            Sero&rsquo;s Vault
          </h1>
          <p className="hero-animate hero-animate-3 mx-auto mt-6 max-w-2xl text-vault-muted text-lg">
            Original music, studio-grade presets, and one-on-one collabs — built for
            producers who want the sound before they hear it everywhere else.
          </p>
          <div className="hero-animate hero-animate-4 mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/presets" className="vault-btn">
              Shop Presets
            </Link>
            <Link href="/book" className="vault-btn-ghost">
              Book a Collab
            </Link>
          </div>
          <div className="hero-animate hero-animate-5 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-vault-muted">
            {TRUST_STRIP.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5">
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          ↓
        </div>
      </section>

      {/* My Works */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-vault-border/70">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl sm:text-3xl vault-heading">My Works</h2>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-vault-accent hover:underline"
            >
              Watch on YouTube &rarr;
            </a>
          </div>
          <TrackShowcase tracks={TRACKS} />
        </section>
      </Reveal>

      {/* Free presets */}
      <Reveal>
        <section className="vault-section-alt mx-auto max-w-6xl px-6 py-16 border-t border-vault-border/70">
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl vault-heading">Free Presets</h2>
            <p className="mt-2 text-vault-muted">
              Free demo walkthroughs — grab the presets straight from the video.
            </p>
          </div>
          <FreeDemos demos={FREE_DEMOS} />
        </section>
      </Reveal>

      {/* Drum kits teaser */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-vault-border/70">
          <div className="vault-panel flex flex-col items-center gap-6 p-8 sm:p-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="vault-kicker">Fresh in the vault</p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl vault-heading">
                Drum Kits That Hit
              </h2>
              <p className="mt-2 max-w-md text-vault-muted">
                808s, kicks, claps &amp; percs pulled straight from Sero&rsquo;s own sessions.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden h-14 w-24 sm:block">
                <EqualizerBars bars={7} />
              </div>
              <Link href="/presets" className="vault-btn whitespace-nowrap">
                Browse Drum Kits
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Featured presets */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-vault-border/70">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl sm:text-3xl vault-heading">Featured Presets</h2>
            <Link href="/presets" className="text-sm text-vault-accent hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PresetCard preset={p} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Collab CTA */}
      <Reveal>
        <section className="vault-section-alt mx-auto max-w-6xl px-6 py-20 border-t border-vault-border/70">
          <div className="vault-panel flex flex-col items-center gap-4 p-10 text-center">
            <h2 className="font-display text-2xl sm:text-3xl vault-heading">Want to work together?</h2>
            <p className="max-w-xl text-vault-muted">
              Book a session directly — pick a package, pick a time, pay securely, and
              it&apos;s locked in instantly.
            </p>
            <Link href="/book" className="vault-btn mt-2">
              See Collab Packages
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
