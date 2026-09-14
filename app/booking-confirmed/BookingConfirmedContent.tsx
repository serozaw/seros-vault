"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Result = {
  packageName: string;
  durationMinutes: number;
  startsAt?: string;
  status?: string;
  email?: string;
};

export default function BookingConfirmedContent() {
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
    fetch(`/api/booking-status?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not verify your booking.");
        setResult(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="vault-panel p-10 text-center">
        <p className="text-vault-muted">Confirming your booking…</p>
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

  return (
    <div className="vault-panel p-10 text-center">
      <p className="mb-2 text-sm uppercase tracking-widest text-vault-accent">
        Booking confirmed
      </p>
      <h1 className="font-display text-2xl">{result?.packageName}</h1>
      {result?.startsAt && (
        <p className="mt-2 text-vault-muted">
          {new Date(result.startsAt).toLocaleString(undefined, {
            dateStyle: "full",
            timeStyle: "short",
          })}{" "}
          &middot; {result.durationMinutes} min
        </p>
      )}
      <p className="mt-4 text-sm text-vault-muted">
        A confirmation email is on its way{result?.email ? ` to ${result.email}` : ""}.
      </p>
    </div>
  );
}
