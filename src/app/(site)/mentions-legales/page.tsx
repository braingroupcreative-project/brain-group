import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Brain Group — [forme juridique], [capital], [numéro RCCM], [numéro de compte contribuable]<br />
        Siège : [adresse complète]<br />
        E-mail : {SITE.email}{SITE.phone ? ` · Téléphone : ${SITE.phone}` : ""}<br />
        Directeur de la publication : [nom du responsable]
      </p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, images, logos et éléments graphiques du site sont la propriété de Brain Group ou utilisés avec autorisation. Toute reproduction sans accord écrit préalable est interdite.</p>
      <h2>Responsabilité</h2>
      <p>Brain Group s&apos;efforce de fournir des informations exactes mais ne peut garantir l&apos;absence d&apos;erreurs. Les devis envoyés par e-mail ou depuis le site font seuls foi pour les prix et délais.</p>
    </LegalPage>
  );
}
