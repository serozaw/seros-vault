export const metadata = { title: "No-Refund Policy — Sero's Vault" };

const ACKNOWLEDGEMENTS = [
  "You are purchasing a digital product, not a physical item.",
  "You have reviewed the product description and compatibility requirements.",
  "You consent to immediate delivery or access to the product.",
  "You waive any right to cancel or request a refund once the product has been delivered, downloaded, or accessed.",
];

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl sm:text-4xl">No-Refund Policy</h1>
        <p className="mt-3 text-vault-muted">For digital products purchased through Sero&apos;s Vault</p>
      </div>

      <div className="vault-panel space-y-6 p-8 text-sm leading-relaxed text-vault-muted">
        <p>
          All sales of presets and other digital products are final and non-refundable. Because
          digital products are delivered or made accessible immediately after purchase, we do
          not offer refunds, returns, or exchanges once an order has been completed.
        </p>

        <div>
          <p className="mb-3 text-vault-text">
            By completing your purchase, you acknowledge and agree that:
          </p>
          <ul className="space-y-3">
            {ACKNOWLEDGEMENTS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-vault-accent">&#9670;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p>
          If you experience a technical issue with your purchase, please contact us with your
          order details so we can assist you.
        </p>

        <p className="text-xs">
          This policy does not limit any rights or remedies that cannot legally be excluded
          under applicable consumer-protection laws.
        </p>
      </div>
    </div>
  );
}
