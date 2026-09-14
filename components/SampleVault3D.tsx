"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_PACK_NAME, SAMPLE_TEASERS } from "@/lib/samples";

const BASE_TILT_X = 10;
const BASE_TILT_Y = -22;
const DRAG_CLICK_THRESHOLD = 6; // px of movement below which a pointer-up counts as a click

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// A spinning, draggable 3D "SAMPLES.zip" — click (without dragging) to open
// a preview panel. Built entirely from CSS 3D transforms (two flat faces
// offset on the Z axis under perspective), so there's no model file, no
// WebGL, and nothing that can fail to load.
export default function SampleVault3D() {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(0);

  function applyTilt(rx: number, ry: number) {
    if (tiltRef.current) {
      tiltRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = 0;
    setDragging(true);
    if (tiltRef.current) tiltRef.current.style.transition = "none";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    movedRef.current = Math.hypot(dx, dy);
    applyTilt(clamp(BASE_TILT_X - dy * 0.25, -55, 55), clamp(BASE_TILT_Y + dx * 0.35, -160, 160));
  }

  function onPointerUp() {
    const wasClick = movedRef.current < DRAG_CLICK_THRESHOLD;
    startRef.current = null;
    setDragging(false);
    if (tiltRef.current) {
      tiltRef.current.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    }
    applyTilt(BASE_TILT_X, BASE_TILT_Y);
    if (wasClick) setOpen(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className="zip3d-scene mx-auto aspect-square w-full select-none"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Open ${SAMPLE_PACK_NAME} preview`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (startRef.current) onPointerUp();
        }}
        onKeyDown={onKeyDown}
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div className="zip3d-glow-ring" />
        <div ref={tiltRef} className="zip3d-tilt" style={{ transform: `rotateX(${BASE_TILT_X}deg) rotateY(${BASE_TILT_Y}deg)` }}>
          <div className={`zip3d-spin ${dragging ? "is-paused" : ""}`}>
            {/* Front face */}
            <div className="zip3d-face zip3d-front items-center justify-center gap-3 p-6 text-center">
              <div className="zip3d-zipper h-16 w-3 rounded-full opacity-80" />
              <p className="font-display text-sm text-vault-accentbright">SAMPLES</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-vault-muted">.zip</p>
              <p className="mt-1 text-[10px] text-vault-muted">Click or drag me</p>
            </div>
            {/* Back face */}
            <div className="zip3d-face zip3d-back items-center justify-center gap-2 p-6 text-center">
              <p className="font-display text-base text-vault-accentbright">
                Sero&rsquo;s Vault
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-vault-muted">
                Sound Design
              </p>
            </div>
          </div>
        </div>
        <div className="zip3d-pedestal" />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={SAMPLE_PACK_NAME}
          onClick={() => setOpen(false)}
        >
          <div
            className="vault-panel reveal is-visible relative w-full max-w-md p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-vault-muted transition-colors hover:text-vault-text"
            >
              ✕
            </button>

            <p className="vault-kicker">Inside the vault</p>
            <h3 className="font-display text-xl sm:text-2xl vault-heading">{SAMPLE_PACK_NAME}</h3>
            <p className="mt-2 text-sm text-vault-muted">
              A taste of what&rsquo;s in the pack. Full-length previews are dropping soon.
            </p>

            <ul className="mt-6 space-y-3">
              {SAMPLE_TEASERS.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-vault-border px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-6 w-8 shrink-0">
                      <EqualizerPreview playing={!!s.audioUrl} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-vault-text">{s.name}</p>
                      <p className="text-xs text-vault-muted">{s.tag}</p>
                    </div>
                  </div>
                  {s.audioUrl ? (
                    <audio controls preload="none" className="h-8 w-32 shrink-0">
                      <source src={s.audioUrl} />
                    </audio>
                  ) : (
                    <span className="vault-badge shrink-0 normal-case tracking-normal">
                      🔒 Coming soon
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// Local, lighter-weight equalizer used inside the modal rows — same visual
// language as EqualizerBars but static (dimmed) when there's no audio yet,
// so a "coming soon" row doesn't lie about having live audio.
function EqualizerPreview({ playing }: { playing: boolean }) {
  return (
    <div className={`eq-bars ${playing ? "" : "opacity-30"}`} aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="eq-bar"
          style={playing ? undefined : { animation: "none", transform: "scaleY(0.35)" }}
        />
      ))}
    </div>
  );
}
