"use client";
import { useState } from "react";
import { Visual } from "@/components/Visual";
import { SERVICES, type ServiceKey } from "@/lib/site";
import type { Realisation } from "@/lib/types";

export function Gallery({ items }: { items: Realisation[] }) {
  const [f, setF] = useState<ServiceKey | "all">("all");
  const shown = items.filter((i) => f === "all" || i.service === f);
  const tabs: [ServiceKey | "all", string][] = [["all", "Toutes"], ...Object.values(SERVICES).map((s) => [s.key, s.short] as [ServiceKey, string])];
  return (
    <>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par activité">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={f === k}
            onClick={() => setF(k)}
            className={`rounded-full px-4 py-2 font-display text-sm font-bold transition ${f === k ? "bg-navy text-white" : "bg-mist text-navy hover:bg-navy/10"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <figure key={r.id} className="card overflow-hidden">
            <Visual service={r.service} image={r.image} fit={r.fit} alt={r.title} className="aspect-[4/3]" label={SERVICES[r.service].short} />
            <figcaption className="p-4">
              <p className="font-display text-sm font-bold">{r.title}</p>
              <p className="mt-0.5 text-xs text-navy/60">{r.caption}</p>
              {r.link && /^https?:\/\//.test(r.link) && (
                <a href={r.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:underline">
                  Voir le projet <span aria-hidden="true">↗</span>
                </a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {shown.length === 0 && <p className="mt-8 text-navy/60">Aucune réalisation dans cette catégorie pour le moment.</p>}
    </>
  );
}
