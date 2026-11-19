import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Brain Group — Événementiel, imprimerie & matériel informatique", template: "%s | Brain Group" },
  description:
    "Brain Group : couverture événementielle, imprimerie & communication visuelle, vente de matériel informatique. Demandez votre devis en ligne.",
  openGraph: { type: "website", locale: "fr_CI", siteName: "Brain Group", url: SITE.url },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#101B36", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
