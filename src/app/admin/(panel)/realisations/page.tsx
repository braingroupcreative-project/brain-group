import { listRealisations, realisationSrc } from "@/lib/realisations";
import { SERVICES } from "@/lib/site";
import { Visual } from "@/components/Visual";
import { deleteRealisation, editRealisation, toggleRealisation } from "../../actions";
import { RealisationForm } from "./RealisationForm";

export const metadata = { title: "Réalisations", robots: { index: false } };

export default async function AdminRealisations() {
  const items = await listRealisations();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Réalisations</h1>
        <p className="text-sm text-navy/60">
          Ajoutez, masquez, mettez en avant ou supprimez ce qui apparaît sur le site (page d&apos;accueil et page Réalisations).
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4">
          {items.length === 0 && <p className="card p-6 text-sm text-navy/60">Aucune réalisation. Ajoutez la première →</p>}
          {items.map((r) => (
            <article key={r.id} className={`card grid gap-4 p-4 sm:grid-cols-[180px_1fr] ${r.visible ? "" : "opacity-60"}`}>
              <Visual service={r.service} image={realisationSrc(r.image)} fit={r.fit} alt={r.title} className="aspect-[4/3] rounded-lg ring-1 ring-navy/10" />
              <div>
                <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-mist px-2.5 py-0.5">{SERVICES[r.service].short}</span>
                  {r.featured && <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-orange-700">★ En avant</span>}
                  {!r.visible && <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-zinc-700">Masquée</span>}
                </div>
                <form action={editRealisation.bind(null, r.id)} className="space-y-2">
                  <input name="title" defaultValue={r.title} aria-label="Titre" required className="input !py-2 text-sm font-semibold" />
                  <input name="caption" defaultValue={r.caption} aria-label="Légende" className="input !py-2 text-sm" />
                  <input name="link" defaultValue={r.link || ""} aria-label="Lien du projet" placeholder="Lien du projet (https://…)" inputMode="url" className="input !py-2 text-sm" />
                  <div className="flex flex-wrap items-center gap-2">
                    <select name="service" defaultValue={r.service} aria-label="Activité" className="input !w-auto !py-1.5 text-sm">
                      {Object.values(SERVICES).map((s) => (
                        <option key={s.key} value={s.key}>{s.short}</option>
                      ))}
                    </select>
                    <button className="btn-dark btn-sm">Enregistrer</button>
                  </div>
                </form>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-navy/10 pt-3">
                  <form action={toggleRealisation.bind(null, r.id, "visible")}>
                    <button className="btn-ghost btn-sm">{r.visible ? "Masquer du site" : "Afficher sur le site"}</button>
                  </form>
                  <form action={toggleRealisation.bind(null, r.id, "featured")}>
                    <button className="btn-ghost btn-sm">{r.featured ? "Retirer de l'accueil" : "Mettre en avant"}</button>
                  </form>
                  <form action={deleteRealisation.bind(null, r.id)}>
                    <button className="btn-ghost btn-sm !text-rose-600">Supprimer</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="card h-fit p-5 xl:sticky xl:top-6">
          <h2 className="mb-3 text-base">Ajouter une réalisation</h2>
          <RealisationForm />
        </section>
      </div>
    </div>
  );
}
