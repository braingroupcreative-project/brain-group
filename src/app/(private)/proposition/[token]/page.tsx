import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, fmtDate, lineTotal } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { decideQuote } from "./actions";

export const metadata: Metadata = { title: "Votre devis", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Proposition({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = await db.findOne("quotes", { token });
  if (!q || q.status === "brouillon") notFound();
  const r = await db.get("requests", q.request_id);
  if (!r) notFound();

  const validUntil = new Date(new Date(q.sent_at || q.created_at).getTime() + q.validity_days * 86400000);
  const expired = q.status === "envoye" && validUntil.getTime() < Date.now();
  const accept = decideQuote.bind(null, token, true);
  const refuse = decideQuote.bind(null, token, false);

  return (
    <section className="bg-mist py-10 sm:py-14">
      <div className="container-x">
        <div className="card mx-auto max-w-3xl p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Devis</p>
              <h1 className="mt-1 text-2xl sm:text-3xl">{q.ref}</h1>
              <p className="mt-1 text-sm text-navy/60">Demande {r.ref} · Valable jusqu&apos;au {fmtDate(validUntil.toISOString())}</p>
            </div>
            <a href={`/api/proposition/${token}/pdf`} target="_blank" className="btn-ghost btn-sm"><Icon name="download" className="h-4 w-4" /> Télécharger le PDF</a>
          </div>

          <p className="mt-5 text-navy/80">Bonjour {r.name}, voici notre proposition.</p>

          <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-navy/10">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-navy text-left text-xs uppercase tracking-wider text-white">
                <tr><th className="px-4 py-3">Désignation</th><th className="px-3 py-3 text-right">Qté</th><th className="px-3 py-3 text-right">P.U.</th><th className="px-4 py-3 text-right">Total</th></tr>
              </thead>
              <tbody>
                {q.items.map((l, i) => (
                  <tr key={i} className="border-t border-navy/10">
                    <td className="px-4 py-3">{l.label}{l.discount_pct ? <span className="ml-2 text-xs text-orange-700">(-{l.discount_pct}%)</span> : null}</td>
                    <td className="px-3 py-3 text-right">{l.qty}</td>
                    <td className="px-3 py-3 text-right">{fcfa(l.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{fcfa(lineTotal(l))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-5 space-y-1.5 text-right text-sm">
            <div className="flex justify-end gap-6 text-lg font-bold"><dt>Total</dt><dd className="w-40">{fcfa(q.total)}</dd></div>
            <div className="flex justify-end gap-6"><dt className="text-navy/60">Acompte à la commande</dt><dd className="w-40 font-semibold">{fcfa(q.deposit)}</dd></div>
            <div className="flex justify-end gap-6"><dt className="text-navy/60">Solde</dt><dd className="w-40 font-semibold">{fcfa(q.total - q.deposit)}</dd></div>
          </dl>

          {(q.delay || q.payment_terms || q.conditions) && (
            <div className="mt-6 grid gap-4 rounded-xl bg-mist p-4 text-sm sm:grid-cols-2">
              {q.delay && <div><p className="font-display text-xs font-bold uppercase text-orange-700">Délai estimatif</p><p className="mt-1">{q.delay}</p></div>}
              {q.payment_terms && <div><p className="font-display text-xs font-bold uppercase text-orange-700">Paiement</p><p className="mt-1">{q.payment_terms}</p></div>}
              {q.conditions && <div className="sm:col-span-2"><p className="font-display text-xs font-bold uppercase text-orange-700">Conditions</p><p className="mt-1 whitespace-pre-wrap">{q.conditions}</p></div>}
            </div>
          )}

          <div className="mt-8">
            {q.status === "envoye" && !expired && (
              <form className="flex flex-col gap-3 sm:flex-row">
                <button formAction={accept} className="btn-primary flex-1 py-4 text-base">J&apos;accepte ce devis</button>
                <button formAction={refuse} className="btn-ghost flex-1">Je refuse</button>
              </form>
            )}
            {q.status === "envoye" && expired && <p className="rounded-lg bg-amber-50 p-4 text-amber-800">Ce devis a expiré. Contactez-nous pour obtenir une nouvelle proposition.</p>}
            {q.status === "accepte" && (
              <div className="rounded-xl bg-emerald-50 p-5">
                <p className="font-display font-bold text-emerald-800">Devis accepté le {fmtDate(q.decided_at)} ✔</p>
                <p className="mt-1 text-sm text-emerald-800/80">Prochaine étape : le règlement de l&apos;acompte par Wave Marchand.</p>
                <Link href={`/paiement/${token}`} className="btn-primary mt-4">Procéder au paiement</Link>
              </div>
            )}
            {q.status === "refuse" && <p className="rounded-lg bg-zinc-100 p-4 text-zinc-700">Vous avez refusé ce devis le {fmtDate(q.decided_at)}. Merci de votre retour.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
