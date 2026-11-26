import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICE_PAGES } from "@/lib/content";
import { SERVICES, SITE, waLink, type ServiceKey } from "@/lib/site";
import { Icon } from "@/components/Icon";
import { TrackEvent } from "@/components/TrackEvent";

export function generateStaticParams() {
  return Object.keys(SERVICE_PAGES).map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const p = SERVICE_PAGES[service as ServiceKey];
  if (!p) return {};
  return { title: p.seoTitle, description: p.seoDescription, alternates: { canonical: `/services/${service}` } };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const p = SERVICE_PAGES[service as ServiceKey];
  if (!p) notFound();
  const meta = SERVICES[p.key];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.title,
    provider: { "@type": "LocalBusiness", name: "Brain Group", url: SITE.url },
    areaServed: "CI",
    description: p.seoDescription,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <TrackEvent event="ViewContent" onceKey={`view_${p.key}`} params={{ content_name: p.title, content_category: p.key }} />
      <section className={`bg-gradient-to-br ${p.gradient} text-white`}>
        <div className="container-x grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr]">
          <div>
          <nav aria-label="Fil d'Ariane" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Accueil</Link> / Services
          </nav>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold !text-white sm:text-5xl">{p.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{p.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/devis?service=${p.key}`} className="btn-primary px-7 py-4 text-base">
              Demander un devis <Icon name="arrow" className="h-5 w-5" />
            </Link>
            <a href={waLink(`Bonjour Brain Group, je souhaite des informations sur : ${meta.label}.`)} target="_blank" rel="noopener noreferrer" className="btn border border-white/30 px-7 py-4 text-base text-white hover:bg-white/10">
              <Icon name="whatsapp" className="h-5 w-5" /> Nous écrire sur WhatsApp
            </a>
          </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/illustrations/${p.key}.svg`} alt="" width={800} height={600} className="mx-auto w-full max-w-md rounded-3xl shadow-2xl lg:max-w-none" />
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <p className="eyebrow">Nos prestations</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {p.offers.map((o) => (
              <div key={o.title} className="card flex gap-4 p-6">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700"><Icon name="check" /></span>
                <div>
                  <h2 className="text-lg">{o.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-navy/70">{o.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Comment procéder</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">De la demande à la livraison</h2>
            <ol className="mt-6 space-y-4">
              {p.steps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1 text-navy/80">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="eyebrow">Questions fréquentes</p>
            <div className="mt-4 space-y-3">
              {p.faq.map((f) => (
                <details key={f.q} className="card group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-sm font-bold">
                    {f.q}
                    <Icon name="chevron" className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-navy/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-x text-center">
          <h2 className="text-2xl sm:text-3xl">Prêt à lancer votre projet ?</h2>
          <Link href={`/devis?service=${p.key}`} className="btn-primary mt-6 px-8 py-4 text-base">Demander un devis</Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
