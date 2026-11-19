import "server-only";
import { db } from "./db";
import { DEFAULT_REALISATIONS } from "./content";
import type { Realisation } from "./types";

/** URL publique d'une image : fichier statique du site ou média du stockage servi par /api/media. */
export function realisationSrc(image: string): string {
  return image.startsWith("/") ? image : `/api/media?path=${encodeURIComponent(image)}`;
}

const fallback = (): Realisation[] =>
  DEFAULT_REALISATIONS.map((d, i) => ({ ...d, created_at: new Date(2026, 0, 1, 0, 0, 3 - i).toISOString() }));

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Liste les réalisations. Au tout premier appel, insère les réalisations par défaut (logos fournis),
 * une seule fois (compteur atomique) — les appels simultanés attendent la fin de l'insertion.
 * Si la table n'existe pas encore (schéma non appliqué), on retombe sur les valeurs par défaut sans planter le site.
 */
export async function listRealisations(opts: { onlyVisible?: boolean } = {}): Promise<Realisation[]> {
  let rows: Realisation[];
  try {
    rows = await db.list("realisations");
    if (rows.length === 0) {
      if ((await db.counter("realisations_seed")) === 1) {
        for (const d of DEFAULT_REALISATIONS) {
          try {
            await db.insert("realisations", { ...d });
          } catch (e) {
            console.error("[realisations] insertion par défaut", e);
          }
        }
      } else {
        for (let i = 0; i < 6 && rows.length === 0; i++) {
          await wait(400);
          rows = await db.list("realisations");
        }
      }
      rows = await db.list("realisations");
    }
  } catch (e) {
    console.error("[realisations] base indisponible, valeurs par défaut", e);
    rows = fallback();
  }
  rows = [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || (a.created_at < b.created_at ? 1 : -1));
  return opts.onlyVisible ? rows.filter((r) => r.visible) : rows;
}
