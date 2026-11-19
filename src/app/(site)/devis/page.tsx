import type { Metadata } from "next";
import { QuoteForm } from "./QuoteForm";
import type { ServiceKey } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demander un devis",
  description: "Demandez un devis gratuit à Brain Group : événementiel, imprimerie ou matériel informatique. Formulaire guidé en quelques minutes.",
  alternates: { canonical: "/devis" },
};

export default async function DevisPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const initial = ["evenementiel", "imprimerie", "informatique"].includes(service || "") ? (service as ServiceKey) : undefined;
  return (
    <>
      <section className="bg-navy py-12 text-white">
        <div className="container-x">
          <p className="eyebrow">Demande de devis</p>
          <h1 className="mt-2 text-3xl font-extrabold !text-white sm:text-4xl">Décrivez votre besoin, nous faisons le reste</h1>
          <p className="mt-2 max-w-2xl text-white/75">Trois étapes simples. Vous recevrez une référence de suivi par e-mail.</p>
        </div>
      </section>
      <section className="bg-mist py-10 sm:py-14">
        <div className="container-x">
          <div className="card mx-auto max-w-3xl p-5 sm:p-8">
            <QuoteForm initialService={initial} />
          </div>
        </div>
      </section>
    </>
  );
}
