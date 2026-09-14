import SnakeGame from "@/components/SnakeGame";

export const metadata = { title: "Games — Sero's Vault" };

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl sm:text-4xl vault-heading">Game Vault</h1>
        <p className="mt-3 text-vault-muted">
          A little arcade corner while your download loads. Starting with Snake —
          more games coming soon.
        </p>
      </div>
      <SnakeGame />
    </div>
  );
}
