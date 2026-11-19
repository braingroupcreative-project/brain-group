import "server-only";
import { db } from "./db";
import { sendMail, mailLayout } from "./mail";
import { SITE, SERVICES, STATUS_LABELS, waLink } from "./site";
import { escapeHtml, fcfa, fmtDate, waNumber } from "./utils";
import { buildQuotePdf, buildReceiptPdf } from "./pdf";
import type { LogEntry, Quote, QuoteRequest, Payment, Order } from "./types";

export const log = (by: string, text: string): LogEntry => ({ at: new Date().toISOString(), by, text });

const adminUrl = (p: string) => `${SITE.url}${p}`;

// ---------- Demandes ----------
export async function notifyNewRequest(r: QuoteRequest) {
  const svc = SERVICES[r.service].label;
  await sendMail({
    to: SITE.email,
    replyTo: r.email,
    subject: `Nouvelle demande ${r.ref} — ${SERVICES[r.service].short}`,
    html: mailLayout(
      `Nouvelle demande de devis ${r.ref}`,
      `<p><b>Service :</b> ${escapeHtml(svc)}<br><b>Client :</b> ${escapeHtml(r.name)}${r.company ? " (" + escapeHtml(r.company) + ")" : ""}<br><b>Téléphone :</b> ${escapeHtml(r.phone)}<br><b>E-mail :</b> ${escapeHtml(r.email)}<br><b>Ville :</b> ${escapeHtml(r.city)}</p>
       ${r.message ? `<p><b>Message :</b><br>${escapeHtml(r.message).replace(/\n/g, "<br>")}</p>` : ""}
       <p>${r.attachments.length} pièce(s) jointe(s) — consultables dans l'administration.</p>`,
      { label: "Ouvrir la demande", url: adminUrl(`/admin/demandes/${r.id}`) }
    ),
  });
}

export async function acknowledgeRequest(r: QuoteRequest) {
  await sendMail({
    to: r.email,
    subject: `Brain Group — Demande ${r.ref} bien reçue`,
    html: mailLayout(
      "Nous avons bien reçu votre demande",
      `<p>Bonjour ${escapeHtml(r.name)},</p>
       <p>Merci de votre confiance. Votre demande de devis (<b>${SERVICES[r.service].label}</b>) a bien été enregistrée sous la référence :</p>
       <p style="font-size:22px;font-weight:700;color:#F28C28;margin:8px 0">${r.ref}</p>
       <p>Notre équipe l'étudie et revient vers vous très rapidement. Conservez cette référence pour tout échange.</p>`
    ),
  });
}

export async function remindStaleRequests(): Promise<{ checked: number; alerted: string[] }> {
  const open = await db.list("requests", { status: "nouvelle" });
  const limit = Date.now() - 72 * 3600 * 1000;
  const stale = open.filter((r) => !r.assigned_to && !r.taken_at && !r.reminder_sent_at && new Date(r.created_at).getTime() <= limit);
  if (stale.length) {
    await sendMail({
      to: SITE.email,
      subject: `⚠ ${stale.length} demande(s) non prise(s) en charge après 72 h`,
      html: mailLayout(
        "Demandes non prises en charge (72 h)",
        `<p>Les demandes suivantes n'ont toujours pas été prises en charge :</p><ul>${stale
          .map(
            (r) =>
              `<li><a href="${adminUrl(`/admin/demandes/${r.id}`)}"><b>${r.ref}</b></a> — ${escapeHtml(r.name)} (${escapeHtml(r.phone)}) — reçue le ${fmtDate(r.created_at, true)}</li>`
          )
          .join("")}</ul><p>Pensez à relancer le client (appel ou WhatsApp) depuis la fiche de la demande.</p>`,
        { label: "Ouvrir l'administration", url: adminUrl("/admin/demandes?filtre=retard") }
      ),
    });
    for (const r of stale) {
      await db.update("requests", r.id, {
        reminder_sent_at: new Date().toISOString(),
        history: [...r.history, log("Système", "Alerte 72 h envoyée à l'équipe")],
      });
    }
  }
  return { checked: open.length, alerted: stale.map((r) => r.ref) };
}

export async function setRequestStatus(r: QuoteRequest, status: string, by: string, extra: Partial<QuoteRequest> = {}) {
  // `extra.history` (si fourni) = ancien historique + nouvelles entrées : on n'en garde que les nouvelles.
  const { history: extraHistory, ...rest } = extra;
  const extraLogs = extraHistory ? extraHistory.slice(r.history.length) : [];
  const patch: Partial<QuoteRequest> = {
    ...rest,
    status,
    history: [
      ...r.history,
      ...(status !== r.status
        ? [log(by, `Statut : ${STATUS_LABELS[r.status] || r.status} → ${STATUS_LABELS[status] || status}`)]
        : []),
      ...extraLogs,
    ],
  };
  if (status !== "nouvelle" && !r.taken_at) patch.taken_at = new Date().toISOString(); // annule la relance 72 h
  return db.update("requests", r.id, patch);
}

// ---------- Devis ----------
export function proposalUrl(q: Quote) {
  return `${SITE.url}/proposition/${q.token}`;
}
export function paymentUrl(q: Quote) {
  return `${SITE.url}/paiement/${q.token}`;
}

export async function paidTotal(quoteId: string): Promise<number> {
  const p = await db.list("payments", { quote_id: quoteId });
  return p.filter((x) => x.status === "confirme").reduce((s, x) => s + Number(x.amount), 0);
}

export async function sendQuoteToClient(q: Quote, r: QuoteRequest) {
  const sent = { ...q, sent_at: q.sent_at || new Date().toISOString() };
  const pdf = await buildQuotePdf(sent, r);
  return sendMail({
    to: r.email,
    subject: `Brain Group — Votre devis ${q.ref}`,
    attachments: [{ filename: `Devis-${q.ref}.pdf`, content: pdf }],
    html: mailLayout(
      `Votre devis ${q.ref}`,
      `<p>Bonjour ${escapeHtml(r.name)},</p>
       <p>Suite à votre demande <b>${r.ref}</b>, veuillez trouver ci-joint notre proposition d'un montant de <b>${fcfa(q.total)}</b>${q.deposit ? ` (acompte : ${fcfa(q.deposit)})` : ""}.</p>
       <p>Vous pouvez la consulter, l'accepter ou la refuser en ligne depuis le bouton ci-dessous. Valable ${q.validity_days} jours.</p>`,
      { label: "Consulter et répondre au devis", url: proposalUrl(q) }
    ),
  });
}

export function whatsappQuoteLink(q: Quote, r: QuoteRequest) {
  const text = `Bonjour ${r.name}, voici votre devis Brain Group ${q.ref} (${fcfa(q.total)}). Consultez-le et répondez ici : ${proposalUrl(q)}`;
  return waLink(text, waNumber(r.phone));
}

export async function notifyDecision(q: Quote, r: QuoteRequest, accepted: boolean) {
  await sendMail({
    to: SITE.email,
    subject: `Devis ${q.ref} ${accepted ? "ACCEPTÉ" : "refusé"} par ${r.name}`,
    html: mailLayout(
      `Devis ${accepted ? "accepté" : "refusé"}`,
      `<p>Le client <b>${escapeHtml(r.name)}</b> (${escapeHtml(r.phone)}) a <b>${accepted ? "accepté" : "refusé"}</b> le devis <b>${q.ref}</b> (${fcfa(q.total)}).</p>${accepted ? "<p>Vous pouvez maintenant convertir le devis en commande.</p>" : ""}`,
      { label: "Ouvrir la demande", url: adminUrl(`/admin/demandes/${r.id}`) }
    ),
  });
}

// ---------- Paiements ----------
export async function notifyPaymentDeclared(q: Quote, r: QuoteRequest, p: Payment) {
  await sendMail({
    to: SITE.email,
    subject: `Paiement à vérifier — ${q.ref} (${fcfa(p.amount)})`,
    html: mailLayout(
      "Un paiement Wave est à vérifier",
      `<p><b>${escapeHtml(r.name)}</b> déclare avoir payé <b>${fcfa(p.amount)}</b> (${p.kind}) pour le devis <b>${q.ref}</b>.<br>Référence de transaction : <b>${escapeHtml(p.tx_ref || "non renseignée")}</b></p><p>Vérifiez dans votre espace Wave Marchand puis confirmez dans l'administration.</p>`,
      { label: "Vérifier le paiement", url: adminUrl("/admin/commandes") }
    ),
  });
}

export async function sendReceipt(q: Quote, r: QuoteRequest, p: Payment) {
  const total = await paidTotal(q.id);
  const pdf = await buildReceiptPdf(q, r, p, total);
  await sendMail({
    to: r.email,
    subject: `Brain Group — Paiement confirmé (${q.ref})`,
    attachments: [{ filename: `Recu-${q.ref}.pdf`, content: pdf }],
    html: mailLayout(
      "Paiement confirmé",
      `<p>Bonjour ${escapeHtml(r.name)},</p><p>Nous confirmons la réception de votre paiement de <b>${fcfa(p.amount)}</b> pour le devis <b>${q.ref}</b>. Solde restant : <b>${fcfa(Math.max(0, q.total - total))}</b>.</p><p>Votre reçu est joint à cet e-mail.</p>`
    ),
  });
}

// ---------- Commandes ----------
export async function notifyOrderDone(r: QuoteRequest, o: Order) {
  await sendMail({
    to: r.email,
    subject: `Brain Group — Votre commande ${o.ref} est terminée`,
    html: mailLayout(
      "Votre commande est prête",
      `<p>Bonjour ${escapeHtml(r.name)},</p><p>Votre commande <b>${o.ref}</b> (demande ${r.ref}) est terminée. Notre équipe vous contactera pour la remise ou la livraison.</p>`
    ),
  });
}
