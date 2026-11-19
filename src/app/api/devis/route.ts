import { NextResponse } from "next/server";
import { z } from "zod";
import { db, nextRef } from "@/lib/db";
import { putFile } from "@/lib/storage";
import { detectFile, MAX_FILE_BYTES, MAX_FILES } from "@/lib/uploads";
import { clientIp, rateLimit, sameOrigin } from "@/lib/ratelimit";
import { SERVICE_FIELDS } from "@/lib/form";
import { acknowledgeRequest, log, notifyNewRequest } from "@/lib/workflow";
import type { Attachment, QuoteRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const base = z.object({
  service: z.enum(["evenementiel", "imprimerie", "informatique"]),
  name: z.string().trim().min(2, "Nom requis").max(120),
  phone: z.string().trim().min(8, "Téléphone invalide").max(30).regex(/^[\d+\s().-]+$/, "Téléphone invalide"),
  email: z.string().trim().email("E-mail invalide").max(160),
  company: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2, "Ville / commune requise").max(120),
  message: z.string().trim().max(4000).optional().default(""),
  consent: z.literal("true", { message: "Votre consentement est requis" }),
});

export async function POST(req: Request) {
  if (!sameOrigin(req.headers)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const ip = clientIp(req.headers);
  if (!rateLimit(`devis:${ip}`, 5, 10 * 60 * 1000))
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Anti-spam : champ piège + délai minimal de remplissage
  if (String(form.get("website") || "") !== "") return NextResponse.json({ ok: true, ref: "BG-0000-0000" });
  const started = Number(form.get("t") || 0);
  if (started && Date.now() - started < 4000)
    return NextResponse.json({ error: "Envoi trop rapide, veuillez réessayer." }, { status: 429 });

  const parsed = base.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fields[String(i.path[0])] = i.message));
    return NextResponse.json({ error: "Veuillez corriger le formulaire.", fields }, { status: 400 });
  }
  const d = parsed.data;

  // Champs conditionnels : on ne conserve QUE ceux du service choisi
  const defs = SERVICE_FIELDS[d.service];
  const details: Record<string, string> = {};
  const fields: Record<string, string> = {};
  for (const f of defs) {
    let v = f.type === "multi" ? form.getAll(f.name).map(String).join(", ") : String(form.get(f.name) ?? "").trim();
    v = v.slice(0, 1500);
    if (f.required && !v) fields[f.name] = "Champ requis";
    if (f.type === "select" && v && !f.options!.includes(v)) fields[f.name] = "Valeur invalide";
    if (f.type === "number" && v && !/^\d{1,7}$/.test(v)) fields[f.name] = "Nombre invalide";
    if (v) details[f.name] = v;
  }
  if (Object.keys(fields).length) return NextResponse.json({ error: "Veuillez corriger le formulaire.", fields }, { status: 400 });

  // Pièces jointes : type réel, taille, nombre
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return NextResponse.json({ error: `${MAX_FILES} fichiers maximum.` }, { status: 400 });
  const refreshed: { buf: Buffer; name: string; mime: string }[] = [];
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES)
      return NextResponse.json({ error: `« ${f.name} » dépasse 8 Mo.` }, { status: 400 });
    const buf = Buffer.from(await f.arrayBuffer());
    const kind = detectFile(buf, f.name);
    if (!kind)
      return NextResponse.json({ error: `« ${f.name} » : format non autorisé (PDF, JPG, PNG, DOCX uniquement).` }, { status: 400 });
    refreshed.push({ buf, name: f.name, mime: kind.mime });
  }

  const ref = await nextRef("BG");
  const attachments: Attachment[] = [];
  for (const f of refreshed) {
    const path = await putFile(`requests/${ref}`, f.name, f.buf, f.mime);
    attachments.push({ path, name: f.name.slice(0, 120), size: f.buf.length, type: f.mime });
  }

  const row = await db.insert("requests", {
    ref,
    service: d.service,
    details,
    name: d.name,
    phone: d.phone,
    email: d.email.toLowerCase(),
    company: d.company,
    city: d.city,
    message: d.message,
    consent: true,
    status: "nouvelle",
    assigned_to: null,
    attachments,
    notes: [],
    history: [log("Client", "Demande reçue via le site")],
    taken_at: null,
    reminder_sent_at: null,
  } as Omit<QuoteRequest, "id" | "created_at">);

  // Les e-mails ne doivent jamais faire échouer l'enregistrement
  await Promise.allSettled([notifyNewRequest(row), acknowledgeRequest(row)]);

  return NextResponse.json({ ok: true, ref: row.ref, service: row.service });
}
