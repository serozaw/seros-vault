import { Suspense } from "react";
import TipConfirmedContent from "./TipConfirmedContent";

export const metadata = { title: "Thank You — Sero's Vault" };

export default function TipConfirmedPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <Suspense fallback={<p className="text-center text-vault-muted">Loading…</p>}>
        <TipConfirmedContent />
      </Suspense>
    </div>
  );
}
