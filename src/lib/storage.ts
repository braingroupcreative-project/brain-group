import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { hasSupabase, sb } from "./db";

/** Stockage privé : bucket Supabase non public, ou dossier local en dev. Aucune URL publique. */
const BUCKET = process.env.SUPABASE_BUCKET || "brain-private";
const LOCAL = path.join(process.cwd(), ".data", "uploads");

export async function putFile(folder: string, filename: string, data: Buffer, contentType: string) {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(-80);
  const key = `${folder}/${randomUUID()}-${safe}`;
  if (hasSupabase) {
    const { error } = await sb().storage.from(BUCKET).upload(key, data, { contentType, upsert: false });
    if (error) throw new Error(`[storage] ${error.message}`);
  } else {
    const full = path.join(LOCAL, key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  }
  return key;
}

export async function getFile(key: string): Promise<Buffer | null> {
  if (key.includes("..")) return null;
  if (hasSupabase) {
    const { data, error } = await sb().storage.from(BUCKET).download(key);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  try {
    return await fs.readFile(path.join(LOCAL, key));
  } catch {
    return null;
  }
}
