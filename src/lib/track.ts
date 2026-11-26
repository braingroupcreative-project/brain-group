/* Événements publicitaires (côté navigateur). Ne fait rien tant que les pixels ne sont pas chargés,
   c'est-à-dire tant que le visiteur n'a pas accepté les cookies de mesure et de publicité. */

export type TrackEvent = "ViewContent" | "Lead" | "Contact";

const GADS = process.env.NEXT_PUBLIC_GADS_ID || "";
const GADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL || "";

type Params = Record<string, string | number | boolean>;
type AnyFn = (...a: unknown[]) => void;
type W = { fbq?: AnyFn; ttq?: { track: AnyFn }; gtag?: AnyFn };

const TIKTOK_NAMES: Record<TrackEvent, string> = { ViewContent: "ViewContent", Lead: "SubmitForm", Contact: "Contact" };
const GOOGLE_NAMES: Record<TrackEvent, string> = { ViewContent: "view_item", Lead: "generate_lead", Contact: "contact" };

/** Envoie l'événement à chaque plateforme chargée. Retourne true si au moins une l'a reçu. */
export function track(event: TrackEvent, params: Params = {}): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as W;
  let sent = false;
  if (typeof w.fbq === "function") {
    w.fbq("track", event, params);
    sent = true;
  }
  if (w.ttq && typeof w.ttq.track === "function") {
    w.ttq.track(TIKTOK_NAMES[event], params);
    sent = true;
  }
  if (typeof w.gtag === "function") {
    w.gtag("event", GOOGLE_NAMES[event], params);
    if (event === "Lead" && GADS && GADS_LEAD_LABEL) w.gtag("event", "conversion", { send_to: `${GADS}/${GADS_LEAD_LABEL}` });
    sent = true;
  }
  return sent;
}

/** Les pixels se chargent juste après le consentement : on réessaie quelques secondes. */
export function trackWhenReady(event: TrackEvent, params: Params = {}, tries = 20) {
  if (track(event, params) || tries <= 0) return;
  setTimeout(() => trackWhenReady(event, params, tries - 1), 750);
}
