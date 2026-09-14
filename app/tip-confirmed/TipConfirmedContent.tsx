"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Result = {
  amountCents: number;
  email?: string;
};

export default function TipConfirmedContent() {
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
    fetch(`/api/tip-status?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not verify your tip.");
        setResult(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="vault-panel p-10 text-center">
        <p className="text-vault-muted">Confirming your tip…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vault-panel p-10 text-center">
        <h1 className="font-display text-xl text-red-400">Something went wrong</h1>
        <p className="mt-2 text-vault-muted">{error}</p>
      </div>
    );
  }

  const amount = ((result?.amountCents ?? 0) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="vault-panel p-10 text-center">
      <p className="mb-2 text-4xl">☕</p>
      <p className="mb-2 text-sm uppercase tracking-widest text-vault-accent">Thank you</p>
      <h1 className="font-display text-2xl">You just bought Sero a coffee — {amount}</h1>
      <p className="mt-4 text-sm text-vault-muted">
        Seriously, it means a lot
        {result?.email ? ` — a receipt is on its way to ${result.email}` : ""}.
      </p>
    </div>
  );
}
