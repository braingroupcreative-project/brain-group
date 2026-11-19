import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SERVICES } from "@/lib/site";

export const metadata: Metadata = {
  title: "À propos",
  description: "Brain Group : notre mission, notre vision, nos valeurs et notre savoir-faire en événementiel, imprimerie, matériel informatique, solutions digitales et communication.",
  alternates: { canonical: "/a-propos" },
};

const VALUES = [
  ["Proximité", "Un échange direct avec une équipe disponible et à l'écoute."],
  ["Qualité", "Un soin constant du détail, de la prise de besoin à la livraison."],
  ["Transparence", "Des devis clairs, un suivi précis des paiements et des commandes."],
  ["Réactivité", "Une réponse rapide à chaque demande, sans qu'aucune ne reste sans suite."],
];

export default function About() {
  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-x">
          <p className="eyebrow">À propos</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold !text-white">Brain Group, cinq métiers au service de vos projets</h1>
        </div>
      </section>
      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="prose-bg">
            <h2 className="!mt-0">Qui sommes-nous ?</h2>
            <p>
              Brain Group est une entreprise ivoirienne qui accompagne particuliers, entreprises et institutions dans cinq domaines complémentaires : la
              couverture événementielle, l&apos;imprimerie et la communication visuelle, la vente de matériel informatique, et les solutions digitales (sites web,
              applications, automatisation, intelligence artificielle) et la communication et la visibilité des entreprises et des personnalités (réseaux sociaux, clips vidéo, publicité en ligne).
            </p>
            <h2>Notre mission</h2>
            <p>Rendre vos événements mémorables, vos supports de communication percutants et votre équipement accessible, avec un service simple et fiable.</p>
            <h2>Notre vision</h2>
            <p>Devenir le partenaire de référence pour tous ceux qui veulent communiquer, célébrer et s&apos;équiper avec un seul interlocuteur de confiance.</p>
            <h2>Notre savoir-faire</h2>
            <ul>
              {Object.values(SERVICES).map((s) => (
                <li key={s.key}><Link href={s.href} className="font-semibold text-orange-700 hover:underline">{s.label}</Link> — {s.blurb}</li>
              ))}
            </ul>
          </div>
          <aside className="card h-fit bg-mist p-6">
            <h2 className="text-lg">Nos engagements</h2>
            <ul className="mt-4 space-y-4">
              {VALUES.map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                  <div><p className="font-display text-sm font-bold">{t}</p><p className="text-sm text-navy/70">{d}</p></div>
                </li>
              ))}
            </ul>
            <Link href="/devis" className="btn-primary mt-6 w-full">Demander un devis</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
