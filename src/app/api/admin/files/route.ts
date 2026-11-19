import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Téléchargement authentifié des fichiers privés (pièces jointes, preuves de paiement). */
export async function GET(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const key = new URL(req.url).searchParams.get("path") || "";
  if (!/^(requests|payments)\/[\w.\-]+\/[\w.\-]+$/.test(key))
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  const buf = await getFile(key);
  if (!buf) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() || "";
  const types: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    png: "image/png",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  const name = key.split("/").pop()!.replace(/^[0-9a-f-]{36}-/, "");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": types[ext] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
