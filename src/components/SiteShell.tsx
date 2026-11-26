import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { Tracking } from "./Tracking";
import { SITE } from "@/lib/site";

/**
 * Cadre commun des pages. `tracking` = pixels publicitaires + bannière de cookies.
 * Les pages privées (devis client, paiement) n'ont JAMAIS de suivi : leur adresse contient un jeton secret
 * qui ne doit pas être transmis aux plateformes publicitaires.
 */
export function SiteShell({ children, tracking }: { children: React.ReactNode; tracking: boolean }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Brain Group",
    url: SITE.url,
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    description:
      "Couverture événementielle, imprimerie & communication visuelle, matériel informatique, sites web, applications, automatisation, intelligence artificielle, communication et visibilité.",
    address: { "@type": "PostalAddress", addressCountry: "CI", addressLocality: SITE.address },
    ...(SITE.facebook ? { sameAs: [SITE.facebook] } : {}),
  };
  return (
    <>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <WhatsAppFloat trackContact={tracking} />
      {tracking && <Tracking />}
      {tracking && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}
