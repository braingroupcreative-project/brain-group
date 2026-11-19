import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate, hoursSince } from "@/lib/utils";
import { REQUEST_STATUSES, SERVICES, STATUS_LABELS } from "@/lib/site";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "Demandes", robots: { index: false } };

type SP = { q?: string; service?: string; statut?: string; du?: string; au?: string; filtre?: string };

export default async function Demandes({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [all, users] = await Promise.all([db.list("requests"), db.list("users")]);
  const uname = new Map(users.map((u) => [u.id, u.name]));
  const q = (sp.q || "").trim().toLowerCase();

  const rows = all.filter((r) => {
    if (q && ![r.ref, r.name, r.phone, r.email].some((x) => x.toLowerCase().includes(q))) return false;
    if (sp.service && r.service !== sp.service) return false;
    if (sp.statut && r.status !== sp.statut) return false;
    if (sp.du && r.created_at.slice(0, 10) < sp.du) return false;
    if (sp.au && r.created_at.slice(0, 10) > sp.au) return false;
    if (sp.filtre === "retard" && !(r.status === "nouvelle" && !r.taken_at && hoursSince(r.created_at) >= 48)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl">Demandes de devis</h1>
          <p className="text-sm text-navy/60">{rows.length} résultat(s){sp.filtre === "retard" && " — demandes en retard ou proches de 72 h"}</p>
        </div>
      </div>

      <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Référence, nom, téléphone, e-mail…" className="input lg:col-span-2" aria-label="Recherche" />
        <select name="service" defaultValue={sp.service || ""} className="input" aria-label="Activité">
          <option value="">Toutes activités</option>
          {Object.values(SERVICES).map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
        </select>
        <select name="statut" defaultValue={sp.statut || ""} className="input" aria-label="Statut">
          <option value="">Tous statuts</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <input type="date" name="du" defaultValue={sp.du} className="input" aria-label="Du" />
        <input type="date" name="au" defaultValue={sp.au} className="input" aria-label="Au" />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button className="btn-dark btn-sm">Filtrer</button>
          <Link href="/admin/demandes" className="btn-ghost btn-sm">Réinitialiser</Link>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-navy text-left text-xs uppercase tracking-wider text-white">
            <tr><th className="px-4 py-3">Réf.</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Activité</th><th className="px-3 py-3">Reçue le</th><th className="px-3 py-3">Agent</th><th className="px-3 py-3">Statut</th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.map((r) => {
              const late = r.status === "nouvelle" && !r.taken_at && hoursSince(r.created_at) >= 72;
              return (
                <tr key={r.id} className="hover:bg-mist">
                  <td className="px-4 py-3 font-display font-bold"><Link href={`/admin/demandes/${r.id}`} className="text-orange-700 hover:underline">{r.ref}</Link></td>
                  <td className="px-3 py-3"><p className="font-semibold">{r.name}</p><p className="text-xs text-navy/50">{r.phone}</p></td>
                  <td className="px-3 py-3">{SERVICES[r.service].short}</td>
                  <td className="px-3 py-3 text-navy/70">{fmtDate(r.created_at, true)}{late && <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700">+72 h</span>}</td>
                  <td className="px-3 py-3 text-navy/70">{r.assigned_to ? uname.get(r.assigned_to) || "—" : "—"}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-navy/50">Aucune demande ne correspond.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
