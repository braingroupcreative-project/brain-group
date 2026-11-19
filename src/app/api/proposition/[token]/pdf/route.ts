import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildQuotePdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Le jeton (non devinable, 192 bits) est la clé d'accès du client à son devis. */
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = await db.findOne("quotes", { token });
  if (!q || q.status === "brouillon") return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const r = await db.get("requests", q.request_id);
  if (!r) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const pdf = await buildQuotePdf(q, r);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Devis-${q.ref}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
