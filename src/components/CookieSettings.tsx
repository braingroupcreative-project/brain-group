"use client";
import { HAS_TRACKING, OPEN_EVENT } from "./Tracking";

/** Lien du pied de page pour rouvrir le choix des cookies (affiché seulement si des pixels sont configurés). */
export function CookieSettings() {
  if (!HAS_TRACKING) return null;
  return (
    <li>
      <button type="button" className="hover:text-orange" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
        Gérer les cookies
      </button>
    </li>
  );
}
