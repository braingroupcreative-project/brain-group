"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db, nextRef, audit } from "@/lib/db";
import {
  bootstrapAdminIfEmpty,
  createSession,
  destroySession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { computeQuote } from "@/lib/utils";
import { REQUEST_STATUSES } from "@/lib/site";
import {
  log,
  notifyOrderDone,
  paidTotal,
  sendQuoteToClient,
  sendReceipt,
  setRequestStatus,
} from "@/lib/workflow";
import type { QuoteLine } from "@/lib/types";

// ---------- Session ----------
export async function login(_: unknown, fd: FormData): Promise<{ error: string } | undefined> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000) || !rateLimit(`login-mail:${email}`, 6, 15 * 60 * 1000))
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };

  let user = await db.findOne("users", { email });
  if (user && (!user.active || !verifyPassword(password, user.password_hash))) user = null;
  if (!user) user = await bootstrapAdminIfEmpty(email, password);
  if (!user) return { error: "Identifiants incorrects." };
  await createSession(user);
  await audit(user.email, "connexion", "session");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Demandes ----------
export async function takeRequest(id: string) {
  const u = await requireUser();
  const r = await db.get("requests", id);
  if (!r) return;
  await setRequestStatus(r, r.status === "nouvelle" ? "en_traitement" : r.status, u.name, {
    assigned_to: u.id,
    taken_at: r.taken_at || new Date().toISOString(),
    history: [...r.history, log(u.name, "Prise en charge de la demande")],
  });
  revalidatePath("/admin", "layout");
}

export async function changeStatus(id: string, fd: FormData) {
  const u = await requireUser();
  const status = String(fd.get("status"));
  const r = await db.get("requests", id);
  if (!r || !REQUEST_STATUSES.includes(status) || status === r.status) return;
  await setRequestStatus(r, status, u.name);
  await audit(u.email, `statut ${status}`, r.ref);
  revalidatePath("/admin", "layout");
}

export async function assignRequest(id: string, fd: FormData) {
  const u = await requireUser();
  const to = String(fd.get("assigned_to") || "");
  const r = await db.get("requests", id);
  if (!r) return;
  const agent = to ? await db.get("users", to) : null;
  await db.update("requests", id, {
    assigned_to: agent?.id ?? null,
    taken_at: agent ? r.taken_at || new Date().toISOString() : r.taken_at,
    history: [...r.history, log(u.name, agent ? `Affectée à ${agent.name}` : "Affectation retirée")],
  });
  revalidatePath("/admin", "layout");
}

export async function addNote(id: string, fd: FormData) {
  const u = await requireUser();
  const text = String(fd.get("text") || "").trim().slice(0, 2000);
  const r = await db.get("requests", id);
  if (!r || !text) return;
  await db.update("requests", id, { notes: [...r.notes, log(u.name, text)] });
  revalidatePath(`/admin/demandes/${id}`);
}

export async function deleteRequest(id: string) {
  const u = await requireUser(["admin"]);
  const r = await db.get("requests", id);
  if (!r) return;
  await db.remove("requests", id);
  await audit(u.email, "suppression demande", r.ref);
  redirect("/admin/demandes");
}

// ---------- Devis ----------
export async function createQuote(requestId: string) {
  const u = await requireUser();
  const r = await db.get("requests", requestId);
  if (!r) return;
  const q = await db.insert("quotes", {
    ref: await nextRef("DV"),
    request_id: r.id,
    token: randomBytes(24).toString("base64url"),
    items: [{ label: "", qty: 1, unit_price: 0, discount_pct: 0 }],
    validity_days: 15,
    conditions: "",
    delay: "",
    payment_terms: "Paiement par Wave Marchand : acompte à la commande, solde à la livraison.",
    deposit_mode: "percent",
    deposit_value: 50,
    total: 0,
    deposit: 0,
    status: "brouillon",
    sent_at: null,
    decided_at: null,
    created_by: u.name,
  });
  if (r.status === "nouvelle") await setRequestStatus(r, "en_traitement", u.name, { assigned_to: r.assigned_to || u.id });
  await audit(u.email, "création devis", q.ref);
  redirect(`/admin/devis/${q.id}`);
}

const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Chaque ligne doit avoir une désignation").max(300),
        qty: z.coerce.number().positive("Quantité invalide").max(1_000_000),
        unit_price: z.coerce.number().min(0).max(1_000_000_000),
        discount_pct: z.coerce.number().min(0).max(100).default(0),
      })
    )
    .min(1, "Ajoutez au moins une ligne")
    .max(60),
  validity_days: z.coerce.number().int().min(1).max(365),
  conditions: z.string().max(4000).default(""),
  delay: z.string().max(300).default(""),
  payment_terms: z.string().max(1000).default(""),
  deposit_mode: z.enum(["percent", "amount"]),
  deposit_value: z.coerce.number().min(0).max(1_000_000_000),
});

export async function saveQuote(id: string, payload: unknown): Promise<{ ok: boolean; error?: string }> {
  const u = await requireUser();
  const q = await db.get("quotes", id);
  if (!q) return { ok: false, error: "Devis introuvable." };
  if (q.status === "accepte" || q.status === "refuse") return { ok: false, error: "Un devis décidé ne peut plus être modifié." };
  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.deposit_mode === "percent" && d.deposit_value > 100) return { ok: false, error: "Le pourcentage d'acompte ne peut dépasser 100." };
  const { total, deposit } = computeQuote(d.items as QuoteLine[], d.deposit_mode, d.deposit_value);
  await db.update("quotes", id, { ...d, items: d.items as QuoteLine[], total, deposit });
  await audit(u.email, q.status === "envoye" ? "modification devis envoyé" : "modification devis", q.ref);
  revalidatePath(`/admin/devis/${id}`);
  return { ok: true };
}

export async function sendQuote(id: string) {
  const u = await requireUser();
  const q = await db.get("quotes", id);
  const r = q && (await db.get("requests", q.request_id));
  if (!q || !r || q.status === "accepte" || q.status === "refuse") return;
  if (q.total <= 0) redirect(`/admin/devis/${id}?err=total`);
  const sent = await db.update("quotes", id, { status: "envoye", sent_at: new Date().toISOString() });
  const ok = await sendQuoteToClient(sent, r);
  await setRequestStatus(r, "devis_envoye", u.name, {
    history: [...r.history, log(u.name, `Devis ${q.ref} envoyé${ok ? "" : " (ÉCHEC e-mail : à renvoyer)"}`)],
  });
  await audit(u.email, "envoi devis", q.ref);
  redirect(`/admin/devis/${id}?sent=${ok ? 1 : 0}`);
}

export async function decideQuoteAdmin(id: string, accepted: boolean) {
  const u = await requireUser();
  const q = await db.get("quotes", id);
  const r = q && (await db.get("requests", q.request_id));
  if (!q || !r || q.status === "brouillon") return;
  await db.update("quotes", id, { status: accepted ? "accepte" : "refuse", decided_at: new Date().toISOString() });
  await setRequestStatus(r, accepted ? "devis_accepte" : "devis_refuse", u.name, {
    history: [...r.history, log(u.name, `Décision client enregistrée : ${accepted ? "accepté" : "refusé"}`)],
  });
  await audit(u.email, accepted ? "devis accepté" : "devis refusé", q.ref);
  revalidatePath("/admin", "layout");
}

export async function convertToOrder(quoteId: string) {
  const u = await requireUser();
  const q = await db.get("quotes", quoteId);
  const r = q && (await db.get("requests", q.request_id));
  if (!q || !r || q.status !== "accepte") return;
  const existing = await db.findOne("orders", { quote_id: q.id });
  if (existing) redirect(`/admin/commandes/${existing.id}`);
  const o = await db.insert("orders", {
    ref: await nextRef("CMD"),
    quote_id: q.id,
    request_id: r.id,
    status: "confirmee",
    history: [log(u.name, "Commande créée depuis le devis " + q.ref)],
  });
  await setRequestStatus(r, q.deposit > 0 ? "acompte_attente" : "commande_confirmee", u.name);
  await audit(u.email, "conversion en commande", o.ref);
  redirect(`/admin/commandes/${o.id}`);
}

// ---------- Commandes & paiements ----------
export async function setOrderStatus(orderId: string, status: "production" | "terminee" | "annulee" | "confirmee") {
  const u = await requireUser();
  const o = await db.get("orders", orderId);
  const r = o && (await db.get("requests", o.request_id));
  if (!o || !r || o.status === status) return;
  await db.update("orders", orderId, { status, history: [...o.history, log(u.name, `Statut commande : ${o.status} → ${status}`)] });
  const map = { production: "en_production", terminee: "terminee", annulee: "annulee", confirmee: "commande_confirmee" } as const;
  await setRequestStatus(r, map[status], u.name);
  if (status === "terminee") await notifyOrderDone(r, o).catch(() => {});
  await audit(u.email, `commande ${status}`, o.ref);
  revalidatePath("/admin", "layout");
}

async function afterPaymentChange(quoteId: string, userName: string) {
  const q = await db.get("quotes", quoteId);
  if (!q) return;
  const r = await db.get("requests", q.request_id);
  const paid = await paidTotal(q.id);
  if (r && r.status === "acompte_attente" && paid >= q.deposit) {
    await setRequestStatus(r, "commande_confirmee", userName, {
      history: [...r.history, log(userName, "Acompte reçu — commande confirmée")],
    });
  }
}

export async function confirmPayment(paymentId: string) {
  const u = await requireUser();
  const p = await db.get("payments", paymentId);
  if (!p || p.status === "confirme") return;
  const updated = await db.update("payments", paymentId, {
    status: "confirme",
    confirmed_by: u.name,
    history: [...p.history, log(u.name, "Paiement confirmé")],
  });
  const q = await db.get("quotes", p.quote_id);
  const r = q && (await db.get("requests", q.request_id));
  await afterPaymentChange(p.quote_id, u.name);
  if (q && r) await sendReceipt(q, r, updated).catch((e) => console.error("receipt", e));
  await audit(u.email, "paiement confirmé", `${q?.ref} ${p.amount}`);
  revalidatePath("/admin", "layout");
}

export async function rejectPayment(paymentId: string) {
  const u = await requireUser();
  const p = await db.get("payments", paymentId);
  if (!p || p.status === "rejete") return;
  await db.update("payments", paymentId, { status: "rejete", confirmed_by: u.name, history: [...p.history, log(u.name, "Paiement rejeté")] });
  await audit(u.email, "paiement rejeté", p.tx_ref);
  revalidatePath("/admin", "layout");
}

export async function recordPayment(quoteId: string, fd: FormData) {
  const u = await requireUser();
  const q = await db.get("quotes", quoteId);
  const r = q && (await db.get("requests", q.request_id));
  const amount = Math.round(Number(fd.get("amount")));
  const tx = String(fd.get("tx_ref") || "").trim().slice(0, 60);
  if (!q || !r || !(amount > 0)) return;
  const paid = await paidTotal(q.id);
  if (amount > q.total - paid) return;
  const p = await db.insert("payments", {
    quote_id: q.id,
    kind: paid < q.deposit ? "acompte" : "solde",
    amount,
    method: "wave",
    tx_ref: tx,
    proof_path: null,
    status: "confirme",
    paid_at: new Date().toISOString(),
    confirmed_by: u.name,
    history: [log(u.name, "Paiement saisi et confirmé manuellement")],
  });
  await afterPaymentChange(q.id, u.name);
  await sendReceipt(q, r, p).catch(() => {});
  await audit(u.email, "paiement saisi", `${q.ref} ${amount}`);
  revalidatePath("/admin", "layout");
}

// ---------- Utilisateurs ----------
const pwSchema = z.string().min(10, "10 caractères minimum").max(100);

export async function createUser(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const u = await requireUser(["admin"]);
  const parsed = z
    .object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), role: z.enum(["admin", "agent"]), password: pwSchema })
    .safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await db.findOne("users", { email: parsed.data.email })) return { error: "Cet e-mail existe déjà." };
  await db.insert("users", { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, password_hash: hashPassword(parsed.data.password), active: true });
  await audit(u.email, "création utilisateur", parsed.data.email);
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function toggleUser(id: string) {
  const u = await requireUser(["admin"]);
  const t = await db.get("users", id);
  if (!t || t.id === u.id) return;
  await db.update("users", id, { active: !t.active });
  await audit(u.email, t.active ? "désactivation utilisateur" : "activation utilisateur", t.email);
  revalidatePath("/admin/utilisateurs");
}

export async function resetUserPassword(id: string, fd: FormData) {
  const u = await requireUser(["admin"]);
  const pw = pwSchema.safeParse(String(fd.get("password") || ""));
  const t = await db.get("users", id);
  if (!pw.success || !t) return;
  await db.update("users", id, { password_hash: hashPassword(pw.data) });
  await audit(u.email, "réinitialisation mot de passe", t.email);
  revalidatePath("/admin/utilisateurs");
}

export async function changeOwnPassword(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const u = await requireUser();
  const cur = String(fd.get("current") || "");
  const pw = pwSchema.safeParse(String(fd.get("password") || ""));
  if (!verifyPassword(cur, u.password_hash)) return { error: "Mot de passe actuel incorrect." };
  if (!pw.success) return { error: pw.error.issues[0].message };
  await db.update("users", u.id, { password_hash: hashPassword(pw.data) });
  await audit(u.email, "changement de mot de passe", u.email);
  return { ok: true };
}
