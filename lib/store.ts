import { promises as fs } from "fs";
import path from "path";
import type { Answers } from "./questions";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type Participant = { id: string; createdAt: string; answers: Answers };
export type MatchStatus = "suggested" | "approved" | "date_arranged" | "declined";
export type Match = {
  id: string;
  aId: string;
  bId: string;
  score: number;
  reasons: string[];
  status: MatchStatus;
  note?: string;
  dateAt?: string;
  createdAt: string;
  updatedAt: string;
};
export type DB = { participants: Participant[]; matches: Match[] };

const FILE = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function readFileStore(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { participants: [], matches: [] };
  }
}

async function writeFileStore(db: DB) {
  // Never attempt to write to local filesystem on Vercel or read-only serverless environments
  if (process.env.VERCEL) {
    return;
  }
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, FILE);
  } catch (err) {
    console.warn("[store] Could not write to local file store:", err);
  }
}

async function readSupabase(): Promise<DB> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [pRes, mRes] = await Promise.all([
    supabase.from("participants").select("*").order("created_at", { ascending: false }),
    supabase.from("matches").select("*").order("created_at", { ascending: false }),
  ]);

  if (pRes.error) {
    console.error("[store] Error fetching participants from Supabase:", pRes.error);
    throw new Error(`Supabase participants fetch error: ${pRes.error.message}`);
  }
  if (mRes.error) {
    console.error("[store] Error fetching matches from Supabase:", mRes.error);
    throw new Error(`Supabase matches fetch error: ${mRes.error.message}`);
  }

  const participants: Participant[] = (pRes.data || []).map((row: any) => ({
    id: String(row.id),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    answers: row.answers || {},
  }));

  const matches: Match[] = (mRes.data || []).map((row: any) => ({
    id: String(row.id),
    aId: String(row.a_id || row.aId),
    bId: String(row.b_id || row.bId),
    score: Number(row.score) || 0,
    reasons: Array.isArray(row.reasons) ? row.reasons : [],
    status: (row.status || "suggested") as MatchStatus,
    note: row.note ?? undefined,
    dateAt: row.date_at || row.dateAt || undefined,
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.updatedAt || new Date().toISOString()),
  }));

  // Auto-seed Supabase from local db.json if Supabase is completely empty and local file exists
  if (participants.length === 0 && matches.length === 0 && !process.env.VERCEL) {
    try {
      const local = await readFileStore();
      if (local.participants.length > 0 || local.matches.length > 0) {
        console.log(`[store] Initializing Supabase with ${local.participants.length} local participants...`);
        await writeSupabase({ participants: [], matches: [] }, local);
        return local;
      }
    } catch {
      // Ignore local read errors during initial seed
    }
  }

  return { participants, matches };
}

async function writeSupabase(oldDB: DB, newDB: DB) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const oldPIds = new Set(oldDB.participants.map((p) => p.id));
  const newPIds = new Set(newDB.participants.map((p) => p.id));
  const deletedPIds = oldDB.participants.filter((p) => !newPIds.has(p.id)).map((p) => p.id);

  const participantsToUpsert = newDB.participants.filter((p) => {
    const old = oldDB.participants.find((x) => x.id === p.id);
    return !old || JSON.stringify(old) !== JSON.stringify(p);
  });

  const oldMIds = new Set(oldDB.matches.map((m) => m.id));
  const newMIds = new Set(newDB.matches.map((m) => m.id));
  const deletedMIds = oldDB.matches.filter((m) => !newMIds.has(m.id)).map((m) => m.id);

  const matchesToUpsert = newDB.matches.filter((m) => {
    const old = oldDB.matches.find((x) => x.id === m.id);
    return !old || JSON.stringify(old) !== JSON.stringify(m);
  });

  if (deletedPIds.length > 0) {
    const { error } = await supabase.from("participants").delete().in("id", deletedPIds);
    if (error) {
      console.error("[store] Error deleting participants in Supabase:", error);
      throw new Error(`Failed to delete participants in Supabase: ${error.message}`);
    }
  }

  if (participantsToUpsert.length > 0) {
    const rows = participantsToUpsert.map((p) => ({
      id: p.id,
      created_at: p.createdAt,
      answers: p.answers,
    }));
    const { error } = await supabase.from("participants").upsert(rows);
    if (error) {
      console.error("[store] Error upserting participants in Supabase:", error);
      throw new Error(`Failed to save participants in Supabase: ${error.message}`);
    }
  }

  if (deletedMIds.length > 0) {
    const { error } = await supabase.from("matches").delete().in("id", deletedMIds);
    if (error) {
      console.error("[store] Error deleting matches in Supabase:", error);
      throw new Error(`Failed to delete matches in Supabase: ${error.message}`);
    }
  }

  if (matchesToUpsert.length > 0) {
    const rows = matchesToUpsert.map((m) => ({
      id: m.id,
      a_id: m.aId,
      b_id: m.bId,
      score: m.score,
      reasons: m.reasons,
      status: m.status,
      note: m.note ?? null,
      date_at: m.dateAt ?? null,
      created_at: m.createdAt,
      updated_at: m.updatedAt,
    }));
    const { error } = await supabase.from("matches").upsert(rows);
    if (error) {
      console.error("[store] Error upserting matches in Supabase:", error);
      throw new Error(`Failed to save matches in Supabase: ${error.message}`);
    }
  }
}

async function read(): Promise<DB> {
  if (isSupabaseConfigured()) {
    try {
      return await readSupabase();
    } catch (err) {
      console.error("[store] Supabase read failed:", err);
      if (process.env.VERCEL) {
        throw err;
      }
      console.warn("[store] Falling back to local file store for read.");
      return await readFileStore();
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Supabase is not configured on Vercel. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel Project Settings."
    );
  }

  return await readFileStore();
}

async function write(oldDB: DB, newDB: DB) {
  if (isSupabaseConfigured()) {
    await writeSupabase(oldDB, newDB);
    if (!process.env.VERCEL) {
      await writeFileStore(newDB);
    }
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Supabase is not configured on Vercel. Form submissions cannot be stored on a read-only serverless disk."
    );
  }

  await writeFileStore(newDB);
}

function run<T>(fn: (db: DB) => T | Promise<T>, save: boolean): Promise<T> {
  const p = queue.then(async () => {
    const db = await read();
    const oldDB = structuredClone(db);
    const r = await fn(db);
    if (save) {
      await write(oldDB, db);
    }
    return r;
  });
  queue = p.catch(() => undefined);
  return p;
}

export const getDB = () => run((db) => db, false);
export const mutate = <T>(fn: (db: DB) => T | Promise<T>) => run(fn, true);
