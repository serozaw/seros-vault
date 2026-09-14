"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Result = { presetName: string; fileName: string; downloadUrl: string };

export default function DownloadContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing order reference.");
      setLoading(false);
      return;
    }
    fetch(`/api/download?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not verify your order.");
        setResult(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="vault-panel p-10 text-center">
        <p className="text-vault-muted">Confirming your payment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vault-panel p-10 text-center">
        <h1 className="font-display text-xl text-red-400">Something went wrong</h1>
        <p className="mt-2 text-vault-muted">{error}</p>
        <p className="mt-4 text-sm text-vault-muted">
          If you were charged, check your email for a download link, or reach out
          and it'll get sorted.
        </p>
      </div>
    );
  }

  return (
    <div className="vault-panel p-10 text-center">
      <p className="mb-2 text-sm uppercase tracking-widest text-vault-accent">
        Payment confirmed
      </p>
      <h1 className="font-display text-2xl">{result?.presetName}</h1>
      <p className="mt-2 text-vault-muted">Your download is ready.</p>
      <a href={result?.downloadUrl} className="vault-btn mt-6" download>
        Download {result?.fileName}
      </a>
      <p className="mt-4 text-xs text-vault-muted">
        A copy of this link was also sent to your email.
      </p>
    </div>
  );
}
