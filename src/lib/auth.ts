import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { db } from "./db";
import type { Role, User } from "./types";

export const COOKIE = "bg_session";
const MAX_AGE = 60 * 60 * 8; // 8 h

export function authSecret() {
  const s =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-only-secret-change-me-dev-only-secret" : "");
  if (!s || s.length < 24) throw new Error("AUTH_SECRET manquant ou trop court (24+ caractères).");
  return new TextEncoder().encode(s);
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pw, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function createSession(user: User) {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(authSecret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Utilisateur courant ; relu en base à chaque requête (un compte désactivé est coupé immédiatement). */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const u = await db.get("users", String(payload.uid));
    return u && u.active ? u : null;
  } catch {
    return null;
  }
}

export async function requireUser(roles?: Role[]): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (roles && !roles.includes(u.role)) redirect("/admin?denied=1");
  return u;
}

/** Pour les routes API : renvoie null plutôt que de rediriger. */
export async function apiUser(roles?: Role[]): Promise<User | null> {
  const u = await currentUser();
  if (!u) return null;
  if (roles && !roles.includes(u.role)) return null;
  return u;
}

/** Création du premier administrateur à la première connexion (voir README). */
export async function bootstrapAdminIfEmpty(email: string, password: string): Promise<User | null> {
  const users = await db.list("users");
  if (users.length > 0) return null;
  const envEmail = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== "production" ? "admin@braingroup.local" : "");
  const envPw = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "ChangeMe!2026" : "");
  if (!envEmail || !envPw) return null;
  if (email.toLowerCase() !== envEmail.toLowerCase() || password !== envPw) return null;
  return db.insert("users", {
    email: envEmail.toLowerCase(),
    name: "Administrateur",
    role: "admin",
    password_hash: hashPassword(envPw),
    active: true,
  });
}
