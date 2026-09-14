import { Suspense } from "react";
import ManagementConfirmedContent from "./ManagementConfirmedContent";

export const metadata = { title: "Management Confirmed — Sero's Vault" };

export default function ManagementConfirmedPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <Suspense fallback={<p className="text-center text-vault-muted">Loading…</p>}>
        <ManagementConfirmedContent />
      </Suspense>
    </div>
  );
}
