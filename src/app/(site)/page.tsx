import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Visual } from "@/components/Visual";
import { SERVICES } from "@/lib/site";
import { ADVANTAGES } from "@/lib/content";
import { listRealisations, realisationSrc } from "@/lib/realisations";

export const revalidate = 60;

export default async function Home() {
  const featured = (await listRealisations({ onlyVisible: true })).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-navy-700/60 blur-3xl" />
        <div className="container-x relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="eyebrow !text-orange">Événementiel · Imprimerie · Informatique · Digital · Communication</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-6xl">
              Vos événements, vos supports, <span className="text-orange">votre équipement.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Brain Group réunit cinq savoir-faire, de l&apos;événement au numérique et à la communication, pour donner de l&apos;éclat à vos projets. Décrivez votre besoin en quelques minutes et recevez un devis clair.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/devis" className="btn-primary px-7 py-4 text-base">
                Demander un devis <Icon name="arrow" className="h-5 w-5" />
              </Link>
              <Link href="/realisations" className="btn border border-white/25 px-7 py-4 text-base text-white hover:bg-white/10">
                Voir nos réalisations
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              {["Devis gratuit", "Réponse rapide", "Suivi de votre commande"].map((t) => (
                <li key={t} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-orange" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3" aria-hidden="true">
            {(["digital", "evenementiel", "imprimerie", "informatique", "communication"] as const).map((k, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={`/illustrations/${k}.svg`} alt="" width={800} height={600} className={`w-full rounded-2xl shadow-xl ${i === 0 ? "col-span-2" : ""}`} loading={i === 0 ? "eager" : "lazy"} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-mist py-16 sm:py-20">
        <div className="container-x">
          <p className="eyebrow">Nos activités</p>
          <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Cinq pôles, un seul interlocuteur</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Object.values(SERVICES).map((s) => (
              <Link key={s.key} href={s.href} className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-700 transition group-hover:bg-orange group-hover:text-navy">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg">{s.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/70">{s.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-bold text-orange-700">
                  Découvrir <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RÉALISATIONS */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Réalisations</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Un aperçu de notre travail</h2>
            </div>
            <Link href="/realisations" className="btn-ghost btn-sm">Toutes les réalisations</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <figure key={r.id} className="card overflow-hidden">
                <Visual service={r.service} image={r.image ? realisationSrc(r.image) : undefined} fit={r.fit} alt={r.title} className="aspect-[4/3]" label={SERVICES[r.service].short} />
                <figcaption className="p-4">
                  <p className="font-display text-sm font-bold">{r.title}</p>
                  <p className="mt-0.5 text-xs text-navy/60">{r.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="container-x">
          <p className="eyebrow">Pourquoi Brain Group</p>
          <h2 className="mt-2 max-w-2xl text-3xl !text-white sm:text-4xl">Une démarche simple, du devis à la livraison</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <div key={a.title}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange text-navy"><Icon name={a.icon} /></span>
                <h3 className="mt-4 text-base !text-white">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARCOURS */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <p className="eyebrow">Comment ça marche</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Quatre étapes</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["Décrivez votre besoin", "Un formulaire guidé en 3 étapes, adapté à votre service."],
              ["Recevez votre devis", "Nous étudions votre demande et vous répondons avec une proposition détaillée."],
              ["Validez et réglez l'acompte", "Acceptez le devis en ligne et payez par Wave Marchand."],
              ["Suivez votre commande", "Nous vous informons jusqu'à la livraison."],
            ].map(([t, d], i) => (
              <li key={t} className="card p-5">
                <span className="font-display text-3xl font-extrabold text-orange">{i + 1}</span>
                <h3 className="mt-2 text-base">{t}</h3>
                <p className="mt-1.5 text-sm text-navy/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-orange px-6 py-12 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-2xl !text-navy sm:text-3xl">Un projet en tête ? Parlons-en.</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy/80">Votre demande est enregistrée avec une référence de suivi. Aucun engagement.</p>
            <Link href="/devis" className="btn-dark mt-7 px-8 py-4 text-base">Demander un devis</Link>
          </div>
        </div>
      </section>
    </>
  );
}
