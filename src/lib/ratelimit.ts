import "server-only";

/** Limitation de débit simple en mémoire (par instance serverless) — première barrière anti-spam. */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

/** Vérifie que la requête POST provient bien de notre propre site (protection CSRF pour les routes API). */
export function sameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  const host = headers.get("host");
  if (!origin) return true; // appels non navigateur
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
