import { NextResponse } from "next/server";
import { getFile } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Sert UNIQUEMENT les images de réalisations (dossier realisations/) ; tout le reste du stockage reste privé. */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("path") || "";
  if (!/^realisations\/[\w.\-]+$/.test(key)) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const buf = await getFile(key);
  if (!buf) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const type = TYPES[key.split(".").pop()?.toLowerCase() || ""];
  if (!type) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
