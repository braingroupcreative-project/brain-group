import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions de vente et de paiement", alternates: { canonical: "/conditions" } };

export default function Page() {
  return (
    <LegalPage title="Conditions de vente et de paiement">
      <h2>Devis</h2>
      <p>Chaque prestation ou produit fait l&apos;objet d&apos;un devis établi après étude de la demande. Le devis précise les prestations, les prix, le délai estimatif, la durée de validité et les modalités de paiement. Il est contractuel une fois accepté par le client.</p>
      <h2>Acompte et solde</h2>
      <p>Un acompte [montant ou pourcentage défini sur chaque devis] est demandé pour confirmer la commande. Le solde est réglé [à la livraison / selon les modalités du devis].</p>
      <h2>Mode de paiement</h2>
      <p>Les paiements s&apos;effectuent par Wave Marchand. Le client indique la référence de sa transaction ; le paiement est confirmé par Brain Group après vérification, et un reçu peut être émis.</p>
      <h2>Délais et livraison</h2>
      <p>Les délais sont donnés à titre estimatif sur le devis. Brain Group informe le client dès que la commande est terminée.</p>
      <h2>Annulation et modification</h2>
      <p>[Conditions d&apos;annulation et de remboursement de l&apos;acompte à définir par Brain Group].</p>
      <h2>Réclamations</h2>
      <p>Toute réclamation peut être adressée par e-mail, en rappelant la référence du devis ou de la commande.</p>
    </LegalPage>
  );
}
