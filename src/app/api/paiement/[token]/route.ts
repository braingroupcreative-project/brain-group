import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { putFile } from "@/lib/storage";
import { detectFile, MAX_FILE_BYTES } from "@/lib/uploads";
import { clientIp, rateLimit, sameOrigin } from "@/lib/ratelimit";
import { log, notifyPaymentDeclared, paidTotal } from "@/lib/workflow";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  tx_ref: z.string().trim().min(4, "Référence de transaction requise").max(60),
  amount: z.coerce.number().int().positive("Montant invalide").max(100_000_000),
});

/** Le client déclare son paiement Wave (référence + preuve facultative). Il est ensuite VÉRIFIÉ à la main par l'administrateur. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(req.headers)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  if (!rateLimit(`pay:${clientIp(req.headers)}`, 6, 10 * 60 * 1000))
    return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });

  const { token } = await params;
  const q = await db.findOne("quotes", { token });
  if (!q || q.status !== "accepte")
    return NextResponse.json({ error: "Devis introuvable ou non accepté." }, { status: 404 });
  const r = await db.get("requests", q.request_id);
  if (!r) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const form = await req.formData();
  const parsed = schema.safeParse({ tx_ref: form.get("tx_ref"), amount: form.get("amount") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const paid = await paidTotal(q.id);
  if (parsed.data.amount > q.total - paid)
    return NextResponse.json({ error: "Le montant dépasse le solde restant." }, { status: 400 });

  let proof_path: string | null = null;
  const file = form.get("proof");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES)
      return NextResponse.json({ error: "Preuve trop volumineuse (8 Mo max)." }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const kind = detectFile(buf, file.name);
    if (!kind || kind.ext === "docx")
      return NextResponse.json({ error: "Preuve : PDF, JPG ou PNG uniquement." }, { status: 400 });
    proof_path = await putFile(`payments/${q.ref}`, file.name, buf, kind.mime);
  }

  const kind = paid < q.deposit ? "acompte" : "solde";
  const p = await db.insert("payments", {
    quote_id: q.id,
    kind,
    amount: parsed.data.amount,
    method: "wave",
    tx_ref: parsed.data.tx_ref,
    proof_path,
    status: "a_verifier",
    paid_at: new Date().toISOString(),
    confirmed_by: null,
    history: [log("Client", `Paiement déclaré (${parsed.data.tx_ref})`)],
  });
  await notifyPaymentDeclared(q, r, p).catch(() => {});
  return NextResponse.json({ ok: true });
}
