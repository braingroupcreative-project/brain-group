import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SITE } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Brain Group",
    url: SITE.url,
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    description: "Couverture événementielle, imprimerie & communication visuelle, matériel informatique, sites web, applications, automatisation, intelligence artificielle, communication et visibilité.",
    address: { "@type": "PostalAddress", addressCountry: "CI", addressLocality: SITE.address },
    ...(SITE.facebook ? { sameAs: [SITE.facebook] } : {}),
  };
  return (
    <>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
