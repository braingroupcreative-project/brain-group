import { NextResponse } from "next/server";
import { remindStaleRequests } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Appelé par Vercel Cron (voir vercel.json). Vercel envoie "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await remindStaleRequests();
  return NextResponse.json({ ok: true, ...result });
}
