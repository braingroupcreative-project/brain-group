import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, fmtDate } from "@/lib/utils";
import { paymentUrl } from "@/lib/workflow";
import { StatusBadge } from "@/components/StatusBadge";
import { confirmPayment, recordPayment, rejectPayment, setOrderStatus } from "../../../actions";

export const metadata = { title: "Commande", robots: { index: false } };

const PAY = { a_verifier: ["À vérifier", "bg-amber-50 text-amber-700"], confirme: ["Confirmé", "bg-emerald-50 text-emerald-700"], rejete: ["Rejeté", "bg-rose-50 text-rose-700"] } as const;
const ORDER_LABEL = { confirmee: "Confirmée", production: "En production", terminee: "Terminée / livrée", annulee: "Annulée" } as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.get("orders", id);
  if (!o) notFound();
  const [q, r] = await Promise.all([db.get("quotes", o.quote_id), db.get("requests", o.request_id)]);
  if (!q || !r) notFound();
  const payments = (await db.list("payments", { quote_id: q.id })).reverse();
  const paid = payments.filter((p) => p.status === "confirme").reduce((s, p) => s + Number(p.amount), 0);
  const balance = Math.max(0, q.total - paid);
  const payStatus = paid >= q.total ? "Soldé" : paid > 0 ? "Partiellement payé" : "Non payé";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/commandes" className="text-sm text-navy/60 hover:text-orange-700">← Commandes</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl">Commande {o.ref}</h1>
          <span className="rounded-full bg-navy px-3 py-0.5 text-xs font-bold text-white">{ORDER_LABEL[o.status]}</span>
          <StatusBadge status={r.status} />
        </div>
        <p className="mt-1 text-sm text-navy/60">
          <Link href={`/admin/demandes/${r.id}`} className="hover:underline">{r.ref}</Link> · <Link href={`/admin/devis/${q.id}`} className="hover:underline">{q.ref}</Link> · {r.name} ({r.phone})
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base">Paiements Wave</h2>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${paid >= q.total ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>Statut de paiement : {payStatus}</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Kpi l="Total devis" v={fcfa(q.total)} />
            <Kpi l="Acompte demandé" v={fcfa(q.deposit)} />
            <Kpi l="Total payé" v={fcfa(paid)} />
            <Kpi l="Solde restant" v={fcfa(balance)} strong />
          </dl>

          <ul className="mt-5 divide-y divide-navy/10">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-bold">{fcfa(p.amount)} <span className="font-normal capitalize text-navy/60">· {p.kind}</span></p>
                  <p className="text-xs text-navy/60">{fmtDate(p.paid_at, true)} · réf. {p.tx_ref || "—"}{p.confirmed_by ? ` · par ${p.confirmed_by}` : ""}</p>
                  {p.proof_path && <a className="text-xs font-semibold text-orange-700 hover:underline" href={`/api/admin/files?path=${encodeURIComponent(p.proof_path)}`}>Preuve</a>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PAY[p.status][1]}`}>{PAY[p.status][0]}</span>
                  {p.status === "a_verifier" && (<>
                    <form action={confirmPayment.bind(null, p.id)}><button className="btn-primary btn-sm">Confirmer</button></form>
                    <form action={rejectPayment.bind(null, p.id)}><button className="btn-ghost btn-sm">Rejeter</button></form>
                  </>)}
                </div>
              </li>
            ))}
            {payments.length === 0 && <li className="py-4 text-sm text-navy/60">Aucun paiement enregistré.</li>}
          </ul>

          {balance > 0 && (
            <form action={recordPayment.bind(null, q.id)} className="mt-5 grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-[1fr_1fr_auto]">
              <div><label className="label" htmlFor="amount">Enregistrer un paiement reçu (FCFA)</label><input id="amount" name="amount" inputMode="numeric" required className="input !py-2" defaultValue={Math.max(0, q.deposit - paid) || balance} /></div>
              <div><label className="label" htmlFor="tx">Référence Wave</label><input id="tx" name="tx_ref" className="input !py-2" /></div>
              <div className="flex items-end"><button className="btn-dark btn-sm w-full">Enregistrer</button></div>
            </form>
          )}
          <p className="mt-4 break-all text-xs text-navy/60">Page de paiement client : <a className="font-semibold text-orange-700 hover:underline" href={paymentUrl(q)} target="_blank">{paymentUrl(q)}</a></p>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-base">Avancement de la commande</h2>
            <div className="flex flex-wrap gap-2">
              {o.status !== "production" && o.status !== "terminee" && o.status !== "annulee" && (
                <form action={setOrderStatus.bind(null, o.id, "production")}><button className="btn-dark btn-sm">Passer en production</button></form>
              )}
              {o.status !== "terminee" && o.status !== "annulee" && (
                <form action={setOrderStatus.bind(null, o.id, "terminee")}><button className="btn-primary btn-sm">Marquer terminée / livrée</button></form>
              )}
              {o.status !== "annulee" && o.status !== "terminee" && (
                <form action={setOrderStatus.bind(null, o.id, "annulee")}><button className="btn-ghost btn-sm">Annuler</button></form>
              )}
            </div>
            <p className="mt-3 text-xs text-navy/50">« Terminée » envoie un e-mail de disponibilité/livraison au client. Une commande peut être en production alors qu&apos;un solde reste à payer.</p>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-base">Historique</h2>
            <ol className="space-y-2 text-sm">
              {[...o.history].reverse().map((h, i) => <li key={i}><p>{h.text}</p><p className="text-xs text-navy/50">{h.by} · {fmtDate(h.at, true)}</p></li>)}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Kpi({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return <div className="rounded-lg bg-mist p-3"><dt className="text-xs font-semibold text-navy/50">{l}</dt><dd className={`mt-1 font-display ${strong ? "text-lg font-extrabold text-orange-700" : "font-bold"}`}>{v}</dd></div>;
}
