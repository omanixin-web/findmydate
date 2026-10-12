import { promises as fs } from "fs";
import path from "path";
import type { Answers } from "./questions";

export type Participant = { id: string; createdAt: string; answers: Answers };
export type MatchStatus = "suggested" | "approved" | "date_arranged" | "declined";
export type Match = { id: string; aId: string; bId: string; score: number; reasons: string[]; status: MatchStatus; note?: string; dateAt?: string; createdAt: string; updatedAt: string };
export type DB = { participants: Participant[]; matches: Match[] };

// File-based store. To use a real database, replace getDB/mutate only; nothing else touches storage.
const FILE = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<DB> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return { participants: [], matches: [] }; }
}
async function write(db: DB) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}
function run<T>(fn: (db: DB) => T | Promise<T>, save: boolean): Promise<T> {
  const p = queue.then(async () => { const db = await read(); const r = await fn(db); if (save) await write(db); return r; });
  queue = p.catch(() => undefined);
  return p;
}
export const getDB = () => run((db) => db, false);
export const mutate = <T,>(fn: (db: DB) => T | Promise<T>) => run(fn, true);
