import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import { resetUserPassword, toggleUser } from "../../actions";
import { NewUserForm } from "./NewUserForm";

export const metadata = { title: "Utilisateurs", robots: { index: false } };

export default async function Users() {
  const me = await requireUser(["admin"]);
  const [users, audit] = await Promise.all([db.list("users"), db.list("audit")]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Utilisateurs</h1>
        <p className="text-sm text-navy/60">Administrateur : accès complet. Agent commercial : traite les demandes et prépare les devis, sans accès aux utilisateurs ni aux journaux.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="card overflow-hidden">
          <ul className="divide-y divide-navy/10">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-bold">{u.name} {!u.active && <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">désactivé</span>}</p>
                  <p className="text-navy/60">{u.email} · {u.role === "admin" ? "Administrateur" : "Agent commercial"}</p>
                </div>
                {u.id !== me.id && (
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={resetUserPassword.bind(null, u.id)} className="flex gap-1">
                      <input name="password" type="password" minLength={10} placeholder="Nouveau mot de passe" aria-label={`Nouveau mot de passe pour ${u.name}`} className="input !w-44 !py-1.5 text-xs" autoComplete="new-password" />
                      <button className="btn-ghost btn-sm">Réinit.</button>
                    </form>
                    <form action={toggleUser.bind(null, u.id)}><button className="btn-ghost btn-sm">{u.active ? "Désactiver" : "Activer"}</button></form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-base">Ajouter un utilisateur</h2>
          <NewUserForm />
        </section>
      </div>
      <section className="card overflow-hidden">
        <h2 className="border-b border-navy/10 p-4 text-base">Journal des actions sensibles</h2>
        <ul className="max-h-96 divide-y divide-navy/10 overflow-y-auto text-sm">
          {audit.slice(0, 100).map((a) => (
            <li key={a.id} className="flex flex-wrap justify-between gap-2 px-4 py-2"><span><b>{a.action}</b> · {a.target}</span><span className="text-xs text-navy/50">{a.user} · {fmtDate(a.at, true)}</span></li>
          ))}
          {audit.length === 0 && <li className="p-5 text-navy/50">Aucune action journalisée.</li>}
        </ul>
      </section>
    </div>
  );
}
