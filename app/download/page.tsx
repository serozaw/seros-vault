import { Suspense } from "react";
import DownloadContent from "./DownloadContent";

export const metadata = { title: "Your Download — Sero's Vault" };

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <Suspense fallback={<Status text="Loading your order…" />}>
        <DownloadContent />
      </Suspense>
    </div>
  );
}

function Status({ text }: { text: string }) {
  return <p className="text-center text-vault-muted">{text}</p>;
}
