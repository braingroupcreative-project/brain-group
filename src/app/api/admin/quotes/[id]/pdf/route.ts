import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildQuotePdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await apiUser())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const q = await db.get("quotes", id);
  const r = q && (await db.get("requests", q.request_id));
  if (!q || !r) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const pdf = await buildQuotePdf(q, r);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Devis-${q.ref}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
