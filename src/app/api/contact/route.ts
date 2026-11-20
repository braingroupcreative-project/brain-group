import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit, sameOrigin } from "@/lib/ratelimit";
import { mailLayout, sendMail } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { escapeHtml } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(10).max(3000),
  consent: z.literal("true"),
});

async function handle(req: Request) {
  if (!sameOrigin(req.headers)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  if (!rateLimit(`contact:${clientIp(req.headers)}`, 4, 10 * 60 * 1000))
    return NextResponse.json({ error: "Trop de messages. Réessayez plus tard." }, { status: 429 });
  const form = await req.formData();
  if (String(form.get("website") || "")) return NextResponse.json({ ok: true });
  const t = Number(form.get("t") || 0);
  if (t && Date.now() - t < 3000) return NextResponse.json({ error: "Envoi trop rapide." }, { status: 429 });
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ error: "Veuillez vérifier les champs du formulaire." }, { status: 400 });
  const d = parsed.data;
  await sendMail({
    to: SITE.email,
    replyTo: d.email,
    subject: `Message du site — ${d.name}`,
    html: mailLayout(
      "Nouveau message depuis le formulaire de contact",
      `<p><b>${escapeHtml(d.name)}</b><br>${escapeHtml(d.email)}${d.phone ? "<br>" + escapeHtml(d.phone) : ""}</p><p>${escapeHtml(d.message).replace(/\n/g, "<br>")}</p>`
    ),
  });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("[api] erreur", e);
    return NextResponse.json(
      { error: "Une erreur est survenue côté serveur. Réessayez dans un instant ou contactez-nous par WhatsApp." },
      { status: 500 }
    );
  }
}
