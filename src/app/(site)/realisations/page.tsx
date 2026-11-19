import type { Metadata } from "next";
import Link from "next/link";
import { REALISATIONS } from "@/lib/content";
import { Gallery } from "./Gallery";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description: "Découvrez les réalisations de Brain Group : couvertures d'événements, supports imprimés et matériel informatique.",
  alternates: { canonical: "/realisations" },
};

export default function RealisationsPage() {
  const items = REALISATIONS.filter((r) => r.visible !== false).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-x">
          <p className="eyebrow">Réalisations</p>
          <h1 className="mt-2 text-4xl font-extrabold !text-white">Notre travail en images</h1>
          <p className="mt-3 max-w-2xl text-white/80">Événements couverts, supports imprimés et équipements livrés : parcourez nos réalisations par activité.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container-x">
          <Gallery items={items} />
          <div className="mt-12 text-center">
            <p className="text-navy/70">Un projet similaire ?</p>
            <Link href="/devis" className="btn-primary mt-3">Demander un devis</Link>
          </div>
        </div>
      </section>
    </>
  );
}
