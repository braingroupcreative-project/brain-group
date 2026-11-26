import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SERVICES, waLink, type ServiceKey } from "@/lib/site";
import { TrackEvent } from "@/components/TrackEvent";

export const metadata: Metadata = { title: "Demande envoyée", robots: { index: false } };

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ ref?: string; service?: string }> }) {
  const { ref = "", service = "" } = await searchParams;
  const safeRef = /^BG-\d{4}-\d{4}$/.test(ref) ? ref : "";
  const svc = SERVICES[service as ServiceKey];
  const wa = waLink(`Bonjour Brain Group, je viens d'envoyer la demande ${safeRef}${svc ? ` (${svc.label})` : ""}. Pouvez-vous la confirmer ?`);
  return (
    <section className="bg-mist py-16">
      {safeRef && <TrackEvent event="Lead" onceKey={`lead_${safeRef}`} params={{ content_name: svc?.label || "Demande de devis", content_category: service }} />}
      <div className="container-x">
        <div className="card mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="h-8 w-8" /></span>
          <h1 className="mt-5 text-2xl">Demande bien reçue !</h1>
          <p className="mt-2 text-navy/70">Un e-mail de confirmation vient de vous être envoyé. Conservez votre référence :</p>
          {safeRef && <p className="mt-4 rounded-xl bg-orange-50 py-4 font-display text-3xl font-extrabold tracking-wide text-orange-700">{safeRef}</p>}
          <p className="mt-4 text-sm text-navy/60">Notre équipe étudie votre demande et vous recontacte rapidement avec un devis.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95"><Icon name="whatsapp" className="h-5 w-5" /> Nous écrire sur WhatsApp</a>
            <Link href="/" className="btn-ghost">Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
