"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { log, notifyDecision, setRequestStatus } from "@/lib/workflow";

/** Décision du client sur son devis (le jeton non devinable fait office d'authentification). */
export async function decideQuote(token: string, accept: boolean) {
  const q = await db.findOne("quotes", { token });
  if (!q || q.status !== "envoye") return;
  const validUntil = new Date(q.sent_at || q.created_at).getTime() + q.validity_days * 86400000;
  if (validUntil < Date.now()) return;
  const r = await db.get("requests", q.request_id);
  if (!r) return;
  const updated = await db.update("quotes", q.id, { status: accept ? "accepte" : "refuse", decided_at: new Date().toISOString() });
  await setRequestStatus(r, accept ? "devis_accepte" : "devis_refuse", "Client", {
    history: [...r.history, log("Client", `Devis ${q.ref} ${accept ? "accepté" : "refusé"} en ligne`)],
  });
  await notifyDecision(updated, r, accept).catch(() => {});
  revalidatePath(`/proposition/${token}`);
}
