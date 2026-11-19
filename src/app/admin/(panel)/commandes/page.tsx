import Link from "next/link";
import { db } from "@/lib/db";
import { fcfa, fmtDate } from "@/lib/utils";
import { confirmPayment, rejectPayment } from "../../actions";

export const metadata = { title: "Commandes & paiements", robots: { index: false } };

const ORDER_LABEL = { confirmee: "Confirmée", production: "En production", terminee: "Terminée", annulee: "Annulée" } as const;

export default async function Commandes() {
  const [orders, quotes, requests, payments] = await Promise.all([db.list("orders"), db.list("quotes"), db.list("requests"), db.list("payments")]);
  const qm = new Map(quotes.map((q) => [q.id, q]));
  const rm = new Map(requests.map((r) => [r.id, r]));
  const paid = new Map<string, number>();
  payments.filter((p) => p.status === "confirme").forEach((p) => paid.set(p.quote_id, (paid.get(p.quote_id) || 0) + Number(p.amount)));
  const toVerify = payments.filter((p) => p.status === "a_verifier");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Commandes & paiements</h1>
        <p className="text-sm text-navy/60">Le statut commercial et le statut de paiement sont suivis séparément.</p>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-navy/10 p-4 text-base">Paiements Wave à vérifier ({toVerify.length})</h2>
        {toVerify.length === 0 ? <p className="p-5 text-sm text-navy/60">Aucun paiement en attente de vérification.</p> : (
          <ul className="divide-y divide-navy/10">
            {toVerify.map((p) => {
              const q = qm.get(p.quote_id);
              const r = q && rm.get(q.request_id);
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <p className="font-bold">{fcfa(p.amount)} <span className="font-normal text-navy/60">· {p.kind} · {q?.ref}</span></p>
                    <p className="text-navy/70">{r?.name} · Réf. Wave : <b>{p.tx_ref || "—"}</b> · déclaré le {fmtDate(p.paid_at, true)}</p>
                    {p.proof_path && <a className="text-xs font-semibold text-orange-700 hover:underline" href={`/api/admin/files?path=${encodeURIComponent(p.proof_path)}`}>Voir la preuve</a>}
                  </div>
                  <div className="flex gap-2">
                    <form action={confirmPayment.bind(null, p.id)}><button className="btn-primary btn-sm">Confirmer</button></form>
                    <form action={rejectPayment.bind(null, p.id)}><button className="btn-ghost btn-sm">Rejeter</button></form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="border-t border-navy/10 bg-mist p-3 text-xs text-navy/60">Vérifiez d&apos;abord la transaction dans votre espace Wave Marchand : le QR Code seul ne prouve pas qu&apos;un paiement a été reçu.</p>
      </section>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-navy text-left text-xs uppercase tracking-wider text-white">
            <tr><th className="px-4 py-3">Commande</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Statut</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-right">Payé</th><th className="px-3 py-3 text-right">Solde</th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {orders.map((o) => {
              const q = qm.get(o.quote_id);
              const r = rm.get(o.request_id);
              const p = paid.get(o.quote_id) || 0;
              const bal = Math.max(0, (q?.total || 0) - p);
              return (
                <tr key={o.id} className="hover:bg-mist">
                  <td className="px-4 py-3 font-display font-bold"><Link className="text-orange-700 hover:underline" href={`/admin/commandes/${o.id}`}>{o.ref}</Link><p className="text-xs font-normal text-navy/50">{q?.ref}</p></td>
                  <td className="px-3 py-3">{r?.name}</td>
                  <td className="px-3 py-3">{ORDER_LABEL[o.status]}</td>
                  <td className="px-3 py-3 text-right">{fcfa(q?.total || 0)}</td>
                  <td className="px-3 py-3 text-right">{fcfa(p)}</td>
                  <td className={`px-3 py-3 text-right font-semibold ${bal > 0 ? "text-orange-700" : "text-emerald-700"}`}>{bal > 0 ? fcfa(bal) : "Soldé"}</td>
                </tr>
              );
            })}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-navy/50">Aucune commande. Elles apparaissent quand un devis accepté est converti.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
