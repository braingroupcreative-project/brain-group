import Link from "next/link";
import { db } from "@/lib/db";
import { fcfa, fmtDate, hoursSince } from "@/lib/utils";
import { SERVICES } from "@/lib/site";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Tableau de bord", robots: { index: false } };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const [requests, quotes, orders, payments] = await Promise.all([
    db.list("requests"),
    db.list("quotes"),
    db.list("orders"),
    db.list("payments"),
  ]);

  const stale = requests.filter((r) => r.status === "nouvelle" && !r.taken_at);
  const overdue = stale.filter((r) => hoursSince(r.created_at) >= 72);
  const approaching = stale.filter((r) => hoursSince(r.created_at) >= 48 && hoursSince(r.created_at) < 72);

  const confirmed = payments.filter((p) => p.status === "confirme");
  const confirmedByQuote = new Map<string, number>();
  confirmed.forEach((p) => confirmedByQuote.set(p.quote_id, (confirmedByQuote.get(p.quote_id) || 0) + Number(p.amount)));
  const accepted = quotes.filter((q) => q.status === "accepte");
  const balanceDue = accepted.reduce((s, q) => s + Math.max(0, q.total - (confirmedByQuote.get(q.id) || 0)), 0);
  const deposits = confirmed.filter((p) => p.kind === "acompte").reduce((s, p) => s + Number(p.amount), 0);
  const toVerify = payments.filter((p) => p.status === "a_verifier");

  const kpis = [
    { l: "Demandes reçues", v: requests.length },
    { l: "Nouvelles", v: requests.filter((r) => r.status === "nouvelle").length, tone: "text-orange-700" },
    { l: "En traitement", v: requests.filter((r) => r.status === "en_traitement").length },
    { l: "En attente de validation", v: requests.filter((r) => ["devis_envoye", "en_attente_validation"].includes(r.status)).length },
    { l: "Devis envoyés", v: quotes.filter((q) => q.status === "envoye").length },
    { l: "Devis acceptés", v: accepted.length },
    { l: "Devis refusés", v: quotes.filter((q) => q.status === "refuse").length },
    { l: "Commandes en cours", v: orders.filter((o) => ["confirmee", "production"].includes(o.status)).length },
    { l: "Commandes terminées", v: orders.filter((o) => o.status === "terminee").length },
  ];
  const money = [
    { l: "Montant des devis (envoyés + acceptés)", v: fcfa(quotes.filter((q) => ["envoye", "accepte"].includes(q.status)).reduce((s, q) => s + q.total, 0)) },
    { l: "Acomptes reçus", v: fcfa(deposits) },
    { l: "Soldes à encaisser", v: fcfa(balanceDue) },
  ];
  const recent = requests.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Tableau de bord</h1>
        <p className="text-sm text-navy/60">Vue d&apos;ensemble de l&apos;activité commerciale.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/demandes" className="btn-dark btn-sm">Traiter les demandes</Link>
        <Link href="/admin/realisations" className="btn-primary btn-sm">+ Ajouter une réalisation</Link>
        <Link href="/admin/commandes" className="btn-ghost btn-sm">Commandes &amp; paiements</Link>
      </div>
      {denied && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Vous n&apos;avez pas les droits pour accéder à cette page.</p>}

      {(overdue.length > 0 || approaching.length > 0 || toVerify.length > 0) && (
        <div className="space-y-2" role="region" aria-label="Alertes">
          {overdue.length > 0 && (
            <Link href="/admin/demandes?filtre=retard" className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-rose-800 ring-1 ring-rose-200 hover:bg-rose-100">
              <Icon name="clock" className="h-5 w-5 shrink-0" />
              <span><b>{overdue.length} demande(s)</b> non prise(s) en charge depuis plus de 72 h — à traiter en priorité.</span>
            </Link>
          )}
          {approaching.length > 0 && (
            <Link href="/admin/demandes?filtre=retard" className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">
              <Icon name="clock" className="h-5 w-5 shrink-0" />
              <span><b>{approaching.length} demande(s)</b> approchent le délai de 72 h (plus de 48 h sans prise en charge).</span>
            </Link>
          )}
          {toVerify.length > 0 && (
            <Link href="/admin/commandes" className="flex items-center gap-3 rounded-xl bg-sky-50 p-4 text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100">
              <Icon name="doc" className="h-5 w-5 shrink-0" />
              <span><b>{toVerify.length} paiement(s) Wave</b> à vérifier.</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.l} className="card p-4">
            <p className={`font-display text-3xl font-extrabold ${k.tone || "text-navy"}`}>{k.v}</p>
            <p className="mt-1 text-xs font-semibold text-navy/60">{k.l}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {money.map((m) => (
          <div key={m.l} className="card border-l-4 border-orange p-4">
            <p className="font-display text-xl font-extrabold">{m.v}</p>
            <p className="mt-1 text-xs font-semibold text-navy/60">{m.l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy/10 p-4">
          <h2 className="text-base">Dernières demandes</h2>
          <Link href="/admin/demandes" className="text-sm font-semibold text-orange-700 hover:underline">Tout voir</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-navy/60">Aucune demande pour le moment.</p>
        ) : (
          <ul className="divide-y divide-navy/10">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/demandes/${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-mist">
                  <span className="min-w-0">
                    <span className="font-display text-sm font-bold">{r.ref}</span>
                    <span className="ml-2 text-sm text-navy/70">{r.name} · {SERVICES[r.service].short}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-navy/50">{fmtDate(r.created_at, true)} <StatusBadge status={r.status} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
