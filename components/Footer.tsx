"use client";

import Link from "next/link";
import { YOUTUBE_CHANNEL_URL } from "@/lib/tracks";

const QUICK_LINKS = [
  { href: "/presets", label: "Presets" },
  { href: "/book", label: "Book a Collab" },
  { href: "/management", label: "Management" },
  { href: "/games", label: "Games" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-vault-accent/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-vault-text">
              SERO<span className="text-vault-accent">&apos;S</span> VAULT
            </p>
            <p className="mt-3 max-w-xs text-sm text-vault-muted">
              Original music, studio-grade presets, and one-on-one collabs — built for
              producers who want the sound before they hear it everywhere else.
            </p>
          </div>

          <div>
            <p className="vault-kicker mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-vault-muted transition-colors hover:text-vault-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vault-muted transition-colors hover:text-vault-accent"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="vault-kicker mb-3">Legal</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/refund-policy" className="text-vault-muted transition-colors hover:text-vault-accent">
                  Refund Policy
                </Link>
              </li>
              <li>
                <p className="text-vault-muted">Presets licensed for use in your own productions. Not for resale.</p>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event("open-support-widget"))}
                  className="text-vault-muted transition-colors hover:text-vault-accent"
                >
                  ☕ Buy me a coffee
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-vault-border/60 pt-6 text-center text-xs text-vault-muted">
          &copy; {new Date().getFullYear()} Sero&apos;s Vault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
