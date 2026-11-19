import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fcfa, fmtDate, hoursSince, waNumber } from "@/lib/utils";
import { FIELD_LABELS } from "@/lib/form";
import { REQUEST_STATUSES, SERVICES, STATUS_LABELS, waLink } from "@/lib/site";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/Icon";
import { addNote, assignRequest, changeStatus, createQuote, deleteRequest, takeRequest } from "../../../actions";

export const metadata = { title: "Demande", robots: { index: false } };

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const { id } = await params;
  const r = await db.get("requests", id);
  if (!r) notFound();
  const [users, quotes] = await Promise.all([db.list("users"), db.list("quotes", { request_id: r.id })]);
  const orders = await db.list("orders", { request_id: r.id });
  const agent = users.find((u) => u.id === r.assigned_to);
  const age = hoursSince(r.created_at);
  const late = r.status === "nouvelle" && !r.taken_at;
  const wa = waLink(`Bonjour ${r.name}, ici Brain Group au sujet de votre demande ${r.ref} (${SERVICES[r.service].label}).`, waNumber(r.phone));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/demandes" className="text-sm text-navy/60 hover:text-orange-700">← Demandes</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl">{r.ref}</h1>
          <StatusBadge status={r.status} />
          {late && age >= 72 && <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">Non prise en charge depuis {Math.floor(age)} h</span>}
          {late && age >= 48 && age < 72 && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Approche 72 h</span>}
        </div>
        <p className="mt-1 text-sm text-navy/60">{SERVICES[r.service].label} · reçue le {fmtDate(r.created_at, true)}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-base">Client</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Info l="Nom" v={r.name} />
              <Info l="Téléphone" v={r.phone} />
              <Info l="E-mail" v={r.email} />
              <Info l="Entreprise" v={r.company || "—"} />
              <Info l="Ville / commune" v={r.city} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="btn-dark btn-sm"><Icon name="phone" className="h-4 w-4" /> Appeler</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-[#25D366] text-white"><Icon name="whatsapp" className="h-4 w-4" /> WhatsApp</a>
              <a href={`mailto:${r.email}?subject=${encodeURIComponent("Votre demande " + r.ref)}`} className="btn-ghost btn-sm"><Icon name="mail" className="h-4 w-4" /> E-mail</a>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-base">Détails de la demande</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {Object.entries(r.details).map(([k, v]) => <Info key={k} l={FIELD_LABELS[k] || k} v={v} />)}
            </dl>
            {r.message && <div className="mt-4 rounded-lg bg-mist p-3 text-sm"><p className="mb-1 text-xs font-bold uppercase text-navy/50">Message du client</p><p className="whitespace-pre-wrap">{r.message}</p></div>}
            {r.attachments.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase text-navy/50">Pièces jointes (stockage privé)</p>
                <ul className="space-y-2">
                  {r.attachments.map((a) => (
                    <li key={a.path}>
                      <a href={`/api/admin/files?path=${encodeURIComponent(a.path)}`} className="inline-flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm font-semibold hover:bg-orange-50">
                        <Icon name="download" className="h-4 w-4 text-orange-700" /> {a.name} <span className="font-normal text-navy/50">({Math.round(a.size / 1024)} Ko)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base">Devis</h2>
              <form action={createQuote.bind(null, r.id)}><button className="btn-primary btn-sm">+ Créer un devis</button></form>
            </div>
            {quotes.length === 0 ? <p className="text-sm text-navy/60">Aucun devis pour cette demande.</p> : (
              <ul className="divide-y divide-navy/10">
                {quotes.map((q) => {
                  const o = orders.find((x) => x.quote_id === q.id);
                  return (
                    <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <span><Link href={`/admin/devis/${q.id}`} className="font-display font-bold text-orange-700 hover:underline">{q.ref}</Link> <span className="text-navy/60">· {fcfa(q.total)} · {q.status}</span></span>
                      {o && <Link href={`/admin/commandes/${o.id}`} className="text-xs font-semibold text-navy/70 hover:underline">Commande {o.ref} →</Link>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-base">Traitement</h2>
            <p className="mb-3 text-sm text-navy/70">Agent : <b>{agent?.name || "non affectée"}</b></p>
            {!r.taken_at && <form action={takeRequest.bind(null, r.id)}><button className="btn-primary mb-4 w-full">Prendre en charge</button></form>}
            <form action={changeStatus.bind(null, r.id)} className="flex gap-2">
              <select name="status" defaultValue={r.status} className="input !py-2 text-sm" aria-label="Statut">
                {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <button className="btn-dark btn-sm">OK</button>
            </form>
            {me.role === "admin" && (
              <form action={assignRequest.bind(null, r.id)} className="mt-3 flex gap-2">
                <select name="assigned_to" defaultValue={r.assigned_to || ""} className="input !py-2 text-sm" aria-label="Affecter à">
                  <option value="">— Non affectée —</option>
                  {users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button className="btn-ghost btn-sm">Affecter</button>
              </form>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-base">Notes internes</h2>
            <p className="mb-2 text-xs text-navy/50">Jamais visibles par le client.</p>
            <ul className="mb-3 space-y-2">
              {r.notes.map((n, i) => (
                <li key={i} className="rounded-lg bg-amber-50 p-3 text-sm"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-1 text-xs text-navy/50">{n.by} · {fmtDate(n.at, true)}</p></li>
              ))}
            </ul>
            <form action={addNote.bind(null, r.id)} className="space-y-2">
              <textarea name="text" required rows={2} maxLength={2000} className="input text-sm" placeholder="Ajouter une note…" aria-label="Nouvelle note" />
              <button className="btn-ghost btn-sm">Ajouter</button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-base">Historique</h2>
            <ol className="space-y-3 border-l-2 border-navy/10 pl-4">
              {[...r.history].reverse().map((h, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-orange" />
                  <p>{h.text}</p><p className="text-xs text-navy/50">{h.by} · {fmtDate(h.at, true)}</p>
                </li>
              ))}
            </ol>
          </section>

          {me.role === "admin" && (
            <form action={deleteRequest.bind(null, r.id)}>
              <button className="text-xs font-semibold text-rose-600 hover:underline" formNoValidate>Supprimer définitivement cette demande</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return <div><dt className="text-xs font-semibold text-navy/50">{l}</dt><dd className="font-semibold break-words">{v}</dd></div>;
}
