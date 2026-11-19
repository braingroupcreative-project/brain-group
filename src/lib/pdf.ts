import "server-only";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { SITE } from "./site";
import { fcfa, fmtDate, lineTotal } from "./utils";
import type { Quote, QuoteRequest, Payment } from "./types";

const ORANGE = rgb(0xf2 / 255, 0x8c / 255, 0x28 / 255);
const NAVY = rgb(0x10 / 255, 0x1b / 255, 0x36 / 255);
const GREY = rgb(0.4, 0.43, 0.5);
const LIGHT = rgb(0.96, 0.965, 0.973);

/** Helvetica standard = encodage WinAnsi : on remplace les caractères non encodables. */
function clean(s: string): string {
  return String(s ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[  ]/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E¡-ÿ€Œœ]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split(/\r?\n/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

async function loadLogo(doc: PDFDocument) {
  for (const f of ["logo.png", "logo.jpg"]) {
    try {
      const buf = await fs.readFile(path.join(process.cwd(), "public", f));
      return f.endsWith("png") ? await doc.embedPng(buf) : await doc.embedJpg(buf);
    } catch {}
  }
  return null;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

const W = 595.28;
const H = 841.89;
const M = 44;

async function header(c: Ctx, title: string, ref: string, date: string) {
  const { page, bold, font } = c;
  page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: NAVY });
  const logo = await loadLogo(c.doc);
  if (logo) {
    const d = logo.scale(1);
    const h = 48;
    page.drawImage(logo, { x: M, y: H - 72, width: (d.width / d.height) * h, height: h });
  } else {
    page.drawText("BRAIN", { x: M, y: H - 62, size: 24, font: bold, color: rgb(1, 1, 1) });
    page.drawText("GROUP", { x: M + bold.widthOfTextAtSize("BRAIN ", 24), y: H - 62, size: 24, font: bold, color: ORANGE });
    page.drawText(clean(SITE.tagline), { x: M, y: H - 80, size: 8, font, color: rgb(0.8, 0.83, 0.9) });
  }
  const t = clean(title.toUpperCase());
  page.drawText(t, { x: W - M - bold.widthOfTextAtSize(t, 18), y: H - 50, size: 18, font: bold, color: rgb(1, 1, 1) });
  const r = clean(`Réf. ${ref}`);
  page.drawText(r, { x: W - M - font.widthOfTextAtSize(r, 10), y: H - 68, size: 10, font, color: ORANGE });
  const d = clean(`Date : ${date}`);
  page.drawText(d, { x: W - M - font.widthOfTextAtSize(d, 9), y: H - 82, size: 9, font, color: rgb(0.8, 0.83, 0.9) });
  page.drawRectangle({ x: 0, y: H - 100, width: W, height: 4, color: ORANGE });
  c.y = H - 130;
}

function footer(c: Ctx) {
  const pages = c.doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.6, color: rgb(0.85, 0.87, 0.9) });
    const left = clean(`Brain Group - ${SITE.email}${SITE.phone ? " - " + SITE.phone : ""}${SITE.address ? " - " + SITE.address : ""}`);
    p.drawText(left, { x: M, y: 32, size: 7.5, font: c.font, color: GREY });
    const r = `Page ${i + 1}/${pages.length}`;
    p.drawText(r, { x: W - M - c.font.widthOfTextAtSize(r, 7.5), y: 32, size: 7.5, font: c.font, color: GREY });
  });
}

function ensure(c: Ctx, need: number) {
  if (c.y - need < 64) {
    c.page = c.doc.addPage([W, H]);
    c.y = H - 50;
  }
}

function block(c: Ctx, label: string, lines: string[], x: number, w: number) {
  c.page.drawText(clean(label.toUpperCase()), { x, y: c.y, size: 8, font: c.bold, color: ORANGE });
  let y = c.y - 14;
  lines.filter(Boolean).forEach((l, i) => {
    for (const seg of wrap(l, i === 0 ? c.bold : c.font, 10, w)) {
      c.page.drawText(seg, { x, y, size: 10, font: i === 0 ? c.bold : c.font, color: NAVY });
      y -= 13;
    }
  });
  return y;
}

async function base(title: string, ref: string, date: string): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([W, H]);
  const c: Ctx = { doc, page, font, bold, y: 0 };
  await header(c, title, ref, date);
  return c;
}

function clientBlock(c: Ctx, r: QuoteRequest, extraRight?: { label: string; lines: string[] }) {
  const colW = (W - 2 * M - 20) / 2;
  const y1 = block(
    c,
    "Client",
    [r.name, r.company, r.phone, r.email, r.city],
    M,
    colW
  );
  let y2 = c.y;
  if (extraRight) y2 = block(c, extraRight.label, extraRight.lines, M + colW + 20, colW);
  c.y = Math.min(y1, y2) - 10;
}

export async function buildQuotePdf(q: Quote, r: QuoteRequest): Promise<Buffer> {
  const c = await base("Devis", q.ref, fmtDate(q.sent_at || q.created_at));
  const valid = new Date(new Date(q.sent_at || q.created_at).getTime() + q.validity_days * 86400000).toISOString();
  clientBlock(c, r, {
    label: "Objet",
    lines: [
      { evenementiel: "Couverture événementielle", imprimerie: "Imprimerie & communication visuelle", informatique: "Matériel informatique" }[r.service],
      `Demande ${r.ref}`,
      `Valable jusqu'au ${fmtDate(valid)}`,
    ],
  });

  // Tableau des lignes
  const cols = { label: M + 8, qty: 330, pu: 380, rem: 438, tot: W - M - 8 };
  ensure(c, 40);
  c.page.drawRectangle({ x: M, y: c.y - 6, width: W - 2 * M, height: 22, color: NAVY });
  const th = (t: string, x: number, right = false) =>
    c.page.drawText(t, { x: right ? x - c.bold.widthOfTextAtSize(t, 8.5) : x, y: c.y, size: 8.5, font: c.bold, color: rgb(1, 1, 1) });
  th("DÉSIGNATION", cols.label);
  th("QTÉ", cols.qty + 20, true);
  th("PRIX UNIT.", cols.pu + 50, true);
  th("REMISE", cols.rem + 30, true);
  th("TOTAL", cols.tot, true);
  c.y -= 26;

  q.items.forEach((it, i) => {
    const lines = wrap(it.label, c.font, 9.5, 250);
    const h = lines.length * 12 + 10;
    ensure(c, h);
    if (i % 2 === 0) c.page.drawRectangle({ x: M, y: c.y - h + 12, width: W - 2 * M, height: h, color: LIGHT });
    lines.forEach((l, k) => c.page.drawText(l, { x: cols.label, y: c.y - k * 12, size: 9.5, font: c.font, color: NAVY }));
    const num = (t: string, x: number) =>
      c.page.drawText(clean(t), { x: x - c.font.widthOfTextAtSize(clean(t), 9.5), y: c.y, size: 9.5, font: c.font, color: NAVY });
    num(String(it.qty), cols.qty + 20);
    num(fcfa(it.unit_price), cols.pu + 50);
    num(it.discount_pct ? `${it.discount_pct}%` : "-", cols.rem + 30);
    c.page.drawText(clean(fcfa(lineTotal(it))), {
      x: cols.tot - c.bold.widthOfTextAtSize(clean(fcfa(lineTotal(it))), 9.5),
      y: c.y,
      size: 9.5,
      font: c.bold,
      color: NAVY,
    });
    c.y -= h;
  });

  // Totaux
  ensure(c, 110);
  c.y -= 10;
  const bx = W - M - 230;
  const row = (label: string, value: string, strong = false) => {
    c.page.drawText(clean(label), { x: bx, y: c.y, size: strong ? 11 : 9.5, font: strong ? c.bold : c.font, color: NAVY });
    const v = clean(value);
    const f = strong ? c.bold : c.font;
    c.page.drawText(v, { x: W - M - f.widthOfTextAtSize(v, strong ? 11 : 9.5), y: c.y, size: strong ? 11 : 9.5, font: f, color: NAVY });
    c.y -= strong ? 20 : 16;
  };
  c.page.drawRectangle({ x: bx - 10, y: c.y - 62, width: 240, height: 76, color: LIGHT });
  row("Total", fcfa(q.total), true);
  row(`Acompte${q.deposit_mode === "percent" ? ` (${q.deposit_value}%)` : ""}`, fcfa(q.deposit));
  row("Solde à la livraison", fcfa(q.total - q.deposit));
  c.y -= 20;

  const info = (label: string, text: string) => {
    if (!text?.trim()) return;
    const lines = wrap(text, c.font, 9.5, W - 2 * M);
    ensure(c, 20 + lines.length * 12);
    c.page.drawText(clean(label.toUpperCase()), { x: M, y: c.y, size: 8, font: c.bold, color: ORANGE });
    c.y -= 13;
    lines.forEach((l) => {
      c.page.drawText(l, { x: M, y: c.y, size: 9.5, font: c.font, color: NAVY });
      c.y -= 12;
    });
    c.y -= 8;
  };
  info("Délai estimatif", q.delay);
  info("Modalités de paiement", q.payment_terms || "Paiement par Wave Marchand : acompte à la commande, solde à la livraison.");
  info("Conditions", q.conditions);
  info("Validité", `Ce devis est valable ${q.validity_days} jours à compter de sa date d'émission.`);

  footer(c);
  return Buffer.from(await c.doc.save());
}

export async function buildReceiptPdf(q: Quote, r: QuoteRequest, p: Payment, paidTotal: number): Promise<Buffer> {
  const c = await base("Reçu de paiement", `${q.ref}-${p.id.slice(0, 6).toUpperCase()}`, fmtDate(p.paid_at));
  clientBlock(c, r, { label: "Devis concerné", lines: [q.ref, `Demande ${r.ref}`] });
  c.y -= 6;
  c.page.drawRectangle({ x: M, y: c.y - 120, width: W - 2 * M, height: 130, color: LIGHT });
  const line = (l: string, v: string, strong = false) => {
    c.page.drawText(clean(l), { x: M + 16, y: c.y, size: 10, font: c.font, color: GREY });
    const f = strong ? c.bold : c.font;
    const t = clean(v);
    c.page.drawText(t, { x: W - M - 16 - f.widthOfTextAtSize(t, strong ? 14 : 10), y: c.y, size: strong ? 14 : 10, font: f, color: NAVY });
    c.y -= strong ? 26 : 20;
  };
  c.y -= 14;
  line("Montant reçu", fcfa(p.amount), true);
  line("Nature", p.kind === "acompte" ? "Acompte" : p.kind === "solde" ? "Solde" : "Paiement");
  line("Mode de paiement", "Wave Marchand");
  line("Référence de transaction", p.tx_ref || "-");
  line("Total du devis", fcfa(q.total));
  c.y -= 24;
  line("Total payé à ce jour", fcfa(paidTotal), true);
  line("Solde restant", fcfa(Math.max(0, q.total - paidTotal)), true);
  c.y -= 20;
  c.page.drawText(clean("Merci pour votre confiance. Ce reçu atteste de la réception du paiement indiqué ci-dessus."), {
    x: M,
    y: c.y,
    size: 9,
    font: c.font,
    color: GREY,
  });
  footer(c);
  return Buffer.from(await c.doc.save());
}
