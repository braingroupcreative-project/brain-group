import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { proposalUrl, whatsappQuoteLink } from "@/lib/workflow";
import { Icon } from "@/components/Icon";
import { convertToOrder, decideQuoteAdmin, sendQuote } from "../../../actions";
import { QuoteEditor } from "./QuoteEditor";

export const metadata = { title: "Devis", robots: { index: false } };

const STATUS = { brouillon: "Brouillon", envoye: "Envoyé", accepte: "Accepté", refuse: "Refusé" } as const;

export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string; err?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const q = await db.get("quotes", id);
  if (!q) notFound();
  const r = await db.get("requests", q.request_id);
  if (!r) notFound();
  const order = await db.findOne("orders", { quote_id: q.id });
  const locked = q.status === "accepte" || q.status === "refuse";

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/demandes/${r.id}`} className="text-sm text-navy/60 hover:text-orange-700">← Demande {r.ref}</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl">Devis {q.ref}</h1>
          <span className="rounded-full bg-navy px-3 py-0.5 text-xs font-bold text-white">{STATUS[q.status]}</span>
        </div>
        <p className="mt-1 text-sm text-navy/60">Client : {r.name} · {r.phone} · créé le {fmtDate(q.created_at)} par {q.created_by}{q.sent_at ? ` · envoyé le ${fmtDate(q.sent_at, true)}` : ""}</p>
      </div>

      {sp.sent === "1" && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Devis envoyé au client par e-mail ✔</p>}
      {sp.sent === "0" && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">Le devis est enregistré comme envoyé mais l&apos;e-mail a échoué. Vérifiez la configuration e-mail, puis utilisez « Renvoyer » ou WhatsApp.</p>}
      {sp.err === "total" && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">Le total du devis doit être supérieur à 0 pour l&apos;envoyer.</p>}

      <QuoteEditor
        id={q.id}
        locked={locked}
        initial={{
          items: q.items, validity_days: q.validity_days, conditions: q.conditions, delay: q.delay,
          payment_terms: q.payment_terms, deposit_mode: q.deposit_mode, deposit_value: Number(q.deposit_value),
        }}
      />

      <section className="card p-5">
        <h2 className="mb-3 text-base">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/quotes/${q.id}/pdf`} target="_blank" className="btn-ghost btn-sm"><Icon name="doc" className="h-4 w-4" /> Aperçu PDF</a>
          {!locked && (
            <form action={sendQuote.bind(null, q.id)}>
              <button className="btn-primary btn-sm">{q.status === "envoye" ? "Renvoyer par e-mail" : "Envoyer par e-mail"}</button>
            </form>
          )}
          {q.status !== "brouillon" && (
            <a href={whatsappQuoteLink(q, r)} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-[#25D366] text-white"><Icon name="whatsapp" className="h-4 w-4" /> Partager sur WhatsApp</a>
          )}
          {q.status === "envoye" && (
            <>
              <form action={decideQuoteAdmin.bind(null, q.id, true)}><button className="btn-dark btn-sm">Enregistrer : accepté</button></form>
              <form action={decideQuoteAdmin.bind(null, q.id, false)}><button className="btn-ghost btn-sm">Enregistrer : refusé</button></form>
            </>
          )}
          {q.status === "accepte" && !order && (
            <form action={convertToOrder.bind(null, q.id)}><button className="btn-primary btn-sm">Convertir en commande</button></form>
          )}
          {order && <Link href={`/admin/commandes/${order.id}`} className="btn-dark btn-sm">Voir la commande {order.ref}</Link>}
        </div>
        {q.status !== "brouillon" && (
          <p className="mt-4 break-all text-xs text-navy/60">Lien client : <a className="font-semibold text-orange-700 hover:underline" href={proposalUrl(q)} target="_blank">{proposalUrl(q)}</a></p>
        )}
        {q.decided_at && <p className="mt-2 text-sm text-navy/70">Décision enregistrée le {fmtDate(q.decided_at, true)}.</p>}
      </section>
    </div>
  );
}
