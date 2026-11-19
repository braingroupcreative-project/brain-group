import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { SITE } from "./site";
import { escapeHtml } from "./utils";

interface MailInput {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
  replyTo?: string;
}

export function mailLayout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Helvetica,Arial,sans-serif;color:#101B36">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#101B36;padding:20px 28px"><span style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-weight:800;font-size:20px;color:#fff;letter-spacing:.5px">BRAIN <span style="color:#F28C28">GROUP</span></span></td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:20px;margin:0 0 16px;color:#101B36">${escapeHtml(title)}</h1>
<div style="font-size:15px;line-height:1.6">${bodyHtml}</div>
${cta ? `<p style="margin:24px 0 0"><a href="${cta.url}" style="background:#F28C28;color:#101B36;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block">${escapeHtml(cta.label)}</a></p>` : ""}
</td></tr>
<tr><td style="background:#F5F6F8;padding:16px 28px;font-size:12px;color:#5b6478">Brain Group — ${escapeHtml(SITE.tagline)}<br>${escapeHtml(SITE.email)}${SITE.phone ? " · " + escapeHtml(SITE.phone) : ""}</td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendMail(m: MailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Brain Group <onboarding@resend.dev>";
  if (!key) {
    // Mode local : on garde une trace plutôt que d'échouer.
    console.log(`[mail:dev] -> ${[m.to].flat().join(", ")} | ${m.subject}`);
    try {
      const f = path.join(process.cwd(), ".data", "outbox.jsonl");
      await fs.mkdir(path.dirname(f), { recursive: true });
      await fs.appendFile(
        f,
        JSON.stringify({
          at: new Date().toISOString(),
          to: m.to,
          subject: m.subject,
          html: m.html,
          attachments: m.attachments?.map((a) => a.filename),
        }) + "\n"
      );
    } catch {}
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [m.to].flat(),
        subject: m.subject,
        html: m.html,
        reply_to: m.replyTo,
        attachments: m.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      }),
    });
    if (!res.ok) {
      console.error("[mail] Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mail] failed", e);
    return false;
  }
}
