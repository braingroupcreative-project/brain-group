import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Tables, TableName } from "./types";

/**
 * Couche d'accès aux données.
 *  - Production : PostgreSQL managé (Supabase) via la clé service (serveur uniquement).
 *  - Développement local sans variables : fichier JSON dans .data/ (non persistant sur Vercel).
 */

export const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let _sb: SupabaseClient | null = null;
export function sb(): SupabaseClient {
  if (!_sb) {
    _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _sb;
}

type Where<T> = Partial<T>;

// ---------- Adaptateur fichier (dev) ----------
const FILE = path.join(process.cwd(), ".data", "db.json");
type FileDb = { tables: Record<string, any[]>; counters: Record<string, number> };
let lock: Promise<unknown> = Promise.resolve();

async function readFileDb(): Promise<FileDb> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { tables: {}, counters: {} };
  }
}
async function writeFileDb(d: FileDb) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(d, null, 2));
}
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.catch(() => undefined);
  return run;
}

function matches(row: any, where?: Where<any>) {
  if (!where) return true;
  return Object.entries(where).every(([k, v]) => row[k] === v);
}

function fail(table: string, error: { message: string } | null) {
  if (error) throw new Error(`[db:${table}] ${error.message}`);
}

export const db = {
  async insert<K extends TableName>(
    table: K,
    data: Omit<Tables[K], "id" | "created_at">
  ): Promise<Tables[K]> {
    const row = { id: randomUUID(), created_at: new Date().toISOString(), ...data } as unknown as Tables[K];
    if (hasSupabase) {
      const { error } = await sb().from(table).insert(row as any);
      fail(table, error);
      return row;
    }
    return withLock(async () => {
      const d = await readFileDb();
      (d.tables[table] ||= []).push(row);
      await writeFileDb(d);
      return row;
    });
  },

  async list<K extends TableName>(table: K, where?: Where<Tables[K]>): Promise<Tables[K][]> {
    let rows: Tables[K][];
    if (hasSupabase) {
      let q = sb().from(table).select("*").order("created_at", { ascending: false }).limit(5000);
      for (const [k, v] of Object.entries(where || {})) q = q.eq(k, v as any);
      const { data, error } = await q;
      fail(table, error);
      rows = (data || []) as Tables[K][];
    } else {
      const d = await readFileDb();
      rows = (d.tables[table] || []).filter((r) => matches(r, where as any));
      rows.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1));
    }
    return rows;
  },

  async get<K extends TableName>(table: K, id: string): Promise<Tables[K] | null> {
    if (!id) return null;
    if (hasSupabase) {
      const { data, error } = await sb().from(table).select("*").eq("id", id).maybeSingle();
      if (error && !/invalid input syntax/.test(error.message)) fail(table, error);
      return (data as Tables[K]) || null;
    }
    const d = await readFileDb();
    return (d.tables[table] || []).find((r) => r.id === id) || null;
  },

  async findOne<K extends TableName>(table: K, where: Where<Tables[K]>): Promise<Tables[K] | null> {
    const rows = await this.list(table, where);
    return rows[0] || null;
  },

  async update<K extends TableName>(table: K, id: string, patch: Partial<Tables[K]>): Promise<Tables[K]> {
    if (hasSupabase) {
      const { data, error } = await sb().from(table).update(patch as any).eq("id", id).select("*").single();
      fail(table, error);
      return data as Tables[K];
    }
    return withLock(async () => {
      const d = await readFileDb();
      const rows = d.tables[table] || [];
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) throw new Error(`[db:${table}] introuvable`);
      rows[i] = { ...rows[i], ...patch };
      await writeFileDb(d);
      return rows[i];
    });
  },

  async remove(table: TableName, id: string) {
    if (hasSupabase) {
      const { error } = await sb().from(table).delete().eq("id", id);
      fail(table, error);
      return;
    }
    await withLock(async () => {
      const d = await readFileDb();
      d.tables[table] = (d.tables[table] || []).filter((r) => r.id !== id);
      await writeFileDb(d);
    });
  },

  /** Compteur atomique (références BG-2026-0001). */
  async counter(key: string): Promise<number> {
    if (hasSupabase) {
      const { data, error } = await sb().rpc("next_counter", { counter_key: key });
      fail("counter", error);
      return Number(data);
    }
    return withLock(async () => {
      const d = await readFileDb();
      d.counters[key] = (d.counters[key] || 0) + 1;
      await writeFileDb(d);
      return d.counters[key];
    });
  },
};

export async function nextRef(prefix: "BG" | "DV" | "CMD"): Promise<string> {
  const year = new Date().getFullYear();
  const n = await db.counter(`${prefix}-${year}`);
  return `${prefix}-${year}-${String(n).padStart(4, "0")}`;
}

export async function audit(user: string, action: string, target: string) {
  try {
    await db.insert("audit", { at: new Date().toISOString(), user, action, target });
  } catch (e) {
    console.error("audit failed", e);
  }
}
