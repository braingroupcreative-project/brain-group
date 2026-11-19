import { QuoteLine } from "./types";

export function fcfa(n: number): string {
  const v = Math.round(n || 0);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

export function lineTotal(l: QuoteLine): number {
  const gross = (Number(l.qty) || 0) * (Number(l.unit_price) || 0);
  return Math.round(gross * (1 - (Number(l.discount_pct) || 0) / 100));
}

export function computeQuote(
  items: QuoteLine[],
  mode: "percent" | "amount",
  value: number
) {
  const total = items.reduce((s, l) => s + lineTotal(l), 0);
  const raw = mode === "percent" ? (total * (Number(value) || 0)) / 100 : Number(value) || 0;
  const deposit = Math.min(total, Math.max(0, Math.round(raw)));
  return { total, deposit };
}

export function fmtDate(iso?: string | null, withTime = false): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Abidjan",
  });
}

export function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

export function cleanPhone(p: string): string {
  return (p || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
}

/** Numéro WhatsApp international (Côte d'Ivoire : 10 chiffres locaux -> préfixe 225). */
export function waNumber(phone: string): string {
  let d = (phone || "").replace(/\D/g, "").replace(/^00/, "");
  if (d.length === 10) d = "225" + d;
  return d;
}
