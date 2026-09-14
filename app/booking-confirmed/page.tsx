import { Suspense } from "react";
import BookingConfirmedContent from "./BookingConfirmedContent";

export const metadata = { title: "Booking Confirmed — Sero's Vault" };

export default function BookingConfirmedPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <Suspense fallback={<p className="text-center text-vault-muted">Loading…</p>}>
        <BookingConfirmedContent />
      </Suspense>
    </div>
  );
}
