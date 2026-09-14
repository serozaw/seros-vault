"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/presets", label: "Presets" },
  { href: "/book", label: "Book a Collab" },
  { href: "/management", label: "Management" },
  { href: "/games", label: "Games" },
  { href: "/refund-policy", label: "Refund Policy" },
];

function openSupportWidget() {
  window.dispatchEvent(new Event("open-support-widget"));
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-vault-bg/75 backdrop-blur-xl shadow-[0_1px_0_rgba(168,85,247,0.18)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-display text-xl tracking-wide text-vault-text"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-vault-accent"
            style={{ boxShadow: "0 0 10px 2px rgba(168,85,247,0.8)" }}
          />
          SERO<span className="text-vault-accent">&apos;S</span> VAULT
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative inline-block pb-1 transition-colors ${
                  active ? "text-vault-accentbright" : "text-vault-muted hover:text-vault-accent"
                }`}
              >
                {l.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-accent to-transparent"
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={openSupportWidget}
            className="rounded-full border border-vault-accent/50 px-4 py-1.5 text-vault-accentbright transition-all duration-300 hover:border-vault-accent hover:bg-vault-accent/10 hover:-translate-y-0.5"
          >
            ☕ Support
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-xl text-vault-text"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden flex flex-col gap-1 border-t border-white/5 bg-vault-bg/95 backdrop-blur-xl px-6 py-4 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-2 transition-colors ${
                  active ? "text-vault-accentbright" : "text-vault-muted hover:text-vault-accent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setOpen(false);
              openSupportWidget();
            }}
            className="mt-2 rounded-lg border border-vault-accent/50 px-4 py-2.5 text-left text-vault-accentbright"
          >
            ☕ Support the Vault
          </button>
        </nav>
      )}
    </header>
  );
}
