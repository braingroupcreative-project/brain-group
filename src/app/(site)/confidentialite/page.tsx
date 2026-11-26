import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>Brain Group — {SITE.email}.</p>
      <h2>Données collectées</h2>
      <p>Via le formulaire de devis : nom et prénoms, téléphone, e-mail, ville/commune, entreprise (facultatif), détails du besoin, message et pièces jointes que vous choisissez d&apos;envoyer. Pour un paiement : référence de transaction Wave et preuve éventuelle.</p>
      <h2>Finalités</h2>
      <ul>
        <li>Étudier votre demande, établir un devis et vous recontacter (e-mail, téléphone, WhatsApp).</li>
        <li>Gérer la commande, les acomptes, les soldes et la facturation.</li>
        <li>Respecter nos obligations légales et comptables.</li>
      </ul>
      <p>Nous ne collectons que les données nécessaires et ne les vendons pas.</p>
      <h2>Destinataires et sous-traitants</h2>
      <p>Les données sont accessibles uniquement aux personnes habilitées de Brain Group. Elles sont traitées par nos prestataires techniques : hébergement (Vercel), base de données et stockage privé (Supabase), envoi d&apos;e-mails (Resend). Avec votre accord, les plateformes publicitaires Meta, TikTok et Google reçoivent des données de navigation.</p>
      <h2>Cookies, mesure d&apos;audience et publicité</h2>
      <p>
        Avec votre accord, le site utilise des pixels de suivi de Meta (Facebook et Instagram), TikTok et Google pour mesurer l&apos;audience, vérifier l&apos;efficacité de nos publicités et vous présenter
        des annonces pertinentes. Ces outils déposent des cookies et reçoivent des informations de navigation (pages vues, demande de devis envoyée, clic sur WhatsApp).
        Ils ne sont activés qu&apos;après votre consentement et ne sont jamais utilisés sur les pages privées de devis et de paiement. Vous pouvez refuser ou modifier votre choix à tout moment
        avec le lien « Gérer les cookies » en bas de page.
      </p>
      <h2>Durée de conservation</h2>
      <p>[Durée à définir, par exemple : demandes sans suite 24 mois ; documents commerciaux et comptables selon la durée légale].</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à {SITE.email}.</p>
      <h2>Sécurité</h2>
      <p>Connexions chiffrées (HTTPS), stockage privé des pièces jointes, accès restreint à l&apos;administration et journalisation des actions sensibles.</p>
    </LegalPage>
  );
}
