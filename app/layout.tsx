import type { Metadata } from "next";
import { Playfair_Display, Inter, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/SupportWidget";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// The blackletter "Old English" wordmark font used for the glowing hero
// treatment (see .neon-text / .vault-hero in globals.css).
const gothic = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gothic",
});

export const metadata: Metadata = {
  title: "Sero's Vault",
  description:
    "Sero's Vault — original music, sound design presets, and one-on-one collab bookings.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Sero's Vault",
    description:
      "Original music, sound design presets, and one-on-one collab bookings.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${gothic.variable}`}>
      <body className="min-h-screen bg-vault-bg bg-vault-radial text-vault-text font-body antialiased">
        <div className="vault-noise" aria-hidden="true" />
        <Nav />
        <main>{children}</main>
        <Footer />
        <SupportWidget />
      </body>
    </html>
  );
}
