import BookingCalendar from "@/components/BookingCalendar";

export const metadata = { title: "Book a Collab — Sero's Vault" };

export default function BookPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl sm:text-4xl vault-heading">Book a Collab</h1>
        <p className="mt-3 text-vault-muted">
          Choose a package, pick an open slot, and pay securely — your booking is
          confirmed the instant payment goes through.
        </p>
      </div>
      <BookingCalendar />
    </div>
  );
}
