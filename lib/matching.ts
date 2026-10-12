import type { Answers } from "./questions";
import { INTENT, TIMELINE, DRINK, SMOKE, TEXTING, BUDGET, TRAVEL, CONFLICT } from "./questions";
import type { Participant } from "./store";

const s = (a: Answers, k: string) => String(a[k] ?? "");
const n = (a: Answers, k: string) => Number(a[k] ?? 0);
const m = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : []);
const norm = (x: string) => x.trim().toLowerCase();
const G: Record<string, string> = { Woman: "Women", Man: "Men", "Non-binary": "Non-binary people" };
const sim = (x: number, y: number, range = 4) => 1 - Math.abs(x - y) / range;
const ord = (list: string[], x: string, y: string) => list.indexOf(x) < 0 || list.indexOf(y) < 0 ? 0.5 : Math.max(0, 1 - Math.abs(list.indexOf(x) - list.indexOf(y)) / (list.length - 1));
const overlap = (x: string[], y: string[]) => x.filter((v) => y.includes(v));
const key = (a: string, b: string) => [a, b].sort().join("|");

const sameReligion = (A: Answers, B: Answers) => s(A, "religion") === s(B, "religion") || s(A, "religion") === "Prefer not to say" || s(B, "religion") === "Prefer not to say";

// Does B break any of A's deal-breakers?
function breaks(A: Answers, B: Answers) {
  const d = m(A, "dealbreakers");
  return (
    (d.includes("Smokes") && s(B, "smoking") !== "Never") ||
    (d.includes("Drinks heavily") && s(B, "drinking") === "Often") ||
    (d.includes("Doesn't want children") && s(B, "kids") === "No") ||
    (d.includes("Wants children") && s(B, "kids") === "Yes") ||
    (d.includes("Practises a different religion") && !sameReligion(A, B)) ||
    (d.includes("Eats non-vegetarian food") && s(B, "diet") === "Non-vegetarian")
  );
}

/** Stage 1: hard filters. Anything failing here is never matched, regardless of score. */
export function eligible(A: Answers, B: Answers) {
  if (!m(A, "interestedIn").includes(G[s(B, "gender")]) || !m(B, "interestedIn").includes(G[s(A, "gender")])) return false;
  const aa = n(A, "age"), ba = n(B, "age");
  if (ba < n(A, "ageMin") || ba > n(A, "ageMax") || aa < n(B, "ageMin") || aa > n(B, "ageMax")) return false;
  const sameCity = norm(s(A, "city")) === norm(s(B, "city"));
  if (!sameCity && !(s(A, "travel") === "Happy to travel" && s(B, "travel") === "Happy to travel")) return false;
  if ((s(A, "kids") === "Yes" && s(B, "kids") === "No") || (s(A, "kids") === "No" && s(B, "kids") === "Yes")) return false;
  return !breaks(A, B) && !breaks(B, A);
}

const KID: Record<string, number> = { "Yes|Yes": 1, "No|No": 1, "Open to it|Open to it": 1, "Open to it|Yes": 0.75, "No|Open to it": 0.6 };
const kid = (x: string, y: string) => KID[`${x}|${y}`] ?? KID[`${y}|${x}`] ?? 0.5;
function dietFit(x: string, y: string) {
  if (x === y) return 1;
  if (x === "Flexible" || y === "Flexible") return 0.85;
  const set = [x, y].sort().join("|");
  return set === "Vegan|Vegetarian" ? 0.8 : set === "Non-vegetarian|Vegetarian" ? 0.3 : 0.2;
}

const W = { intent: 0.18, values: 0.2, personality: 0.15, interests: 0.15, lifestyle: 0.1, connection: 0.08, logistics: 0.09, ageFit: 0.05 };

/** Stage 2: weighted compatibility of B for A, each part in 0..1. */
function parts(A: Answers, B: Answers) {
  const intent = 0.8 * ord(INTENT, s(A, "intent"), s(B, "intent")) + 0.2 * ord(TIMELINE, s(A, "timeline"), s(B, "timeline"));

  const rel = Math.max(n(A, "religionImportance"), n(B, "religionImportance")) <= 2 ? 0.9
    : sameReligion(A, B) ? sim(n(A, "religionImportance"), n(B, "religionImportance")) : 0.5 * sim(n(A, "religionImportance"), n(B, "religionImportance"));
  const values = 0.4 * kid(s(A, "kids"), s(B, "kids")) + 0.3 * rel + 0.3 * sim(n(A, "familyCloseness"), n(B, "familyCloseness"));

  const planning = 1 - Math.max(0, Math.abs(n(A, "planning") - n(B, "planning")) - 1) / 3; // differences of 1 are fine
  const personality = (sim(n(A, "socialEnergy"), n(B, "socialEnergy")) + sim(n(A, "adventure"), n(B, "adventure")) + sim(n(A, "ambition"), n(B, "ambition")) + sim(n(A, "emotional"), n(B, "emotional")) + planning) / 5;

  const shared = overlap(m(A, "interests"), m(B, "interests"));
  const interests = Math.min(1, (shared.length / Math.sqrt(m(A, "interests").length * m(B, "interests").length || 1)) * 1.8);

  const rhythm = s(A, "rhythm") === s(B, "rhythm") ? 1 : s(A, "rhythm") === "Somewhere in between" || s(B, "rhythm") === "Somewhere in between" ? 0.8 : 0.4;
  const lifestyle = 0.25 * dietFit(s(A, "diet"), s(B, "diet")) + 0.2 * ord(DRINK, s(A, "drinking"), s(B, "drinking")) + 0.25 * ord(SMOKE, s(A, "smoking"), s(B, "smoking")) + 0.15 * rhythm + 0.15 * sim(n(A, "fitness"), n(B, "fitness"));

  const love = overlap(m(A, "loveLanguages"), m(B, "loveLanguages")).length ? 1 : 0.4;
  const conflict = s(A, "conflict") === s(B, "conflict") ? 1 : s(A, "conflict") === CONFLICT[3] || s(B, "conflict") === CONFLICT[3] ? 0.3 : 0.7;
  const connection = 0.4 * love + 0.35 * conflict + 0.25 * ord(TEXTING, s(A, "texting"), s(B, "texting"));

  const slots = overlap(m(A, "availability"), m(B, "availability")).length;
  const logistics = 0.5 * (slots >= 2 ? 1 : slots === 1 ? 0.6 : 0) + 0.2 * ord(BUDGET, s(A, "budget"), s(B, "budget")) + 0.15 * ord(TRAVEL, s(A, "travel"), s(B, "travel")) + 0.15 * (overlap(m(A, "dateIdeas"), m(B, "dateIdeas")).length ? 1 : 0.5);

  const half = (n(A, "ageMax") - n(A, "ageMin")) / 2 || 1;
  const ageFit = 1 - 0.6 * Math.min(1, Math.abs(n(B, "age") - (n(A, "ageMin") + n(A, "ageMax")) / 2) / half);

  return { intent, values, personality, interests, lifestyle, connection, logistics, ageFit, shared };
}

const directional = (p: ReturnType<typeof parts>) => (Object.keys(W) as (keyof typeof W)[]).reduce((t, k) => t + W[k] * p[k], 0);

/** Mutual score 0..100 (geometric mean, so a one-sided fit can't carry a pair) plus human-readable reasons. */
export function scorePair(A: Answers, B: Answers): { score: number; reasons: string[] } | null {
  if (!eligible(A, B)) return null;
  const p = parts(A, B), q = parts(B, A);
  const score = Math.round(Math.sqrt(directional(p) * directional(q)) * 100);
  const r: string[] = [];
  if (p.intent >= 0.85) r.push("Want the same kind of relationship, on a similar timeline");
  if (p.values >= 0.8) r.push("Closely aligned on children, faith and family");
  if (p.shared.length) r.push(`Shared interests: ${p.shared.slice(0, 4).join(", ")}`);
  if (p.personality >= 0.8) r.push("Similar social energy and outlook");
  if (p.lifestyle >= 0.8) r.push("Compatible everyday habits");
  if (p.connection >= 0.8) r.push("Compatible ways of showing and handling love");
  if (p.logistics >= 0.8) r.push("Easy to schedule: free time overlaps and date style fits");
  return { score, reasons: r };
}

export function rankFor(p: Participant, all: Participant[], limit = 5) {
  return all.filter((o) => o.id !== p.id)
    .map((o) => ({ other: o, res: scorePair(p.answers, o.answers) }))
    .filter((x): x is { other: Participant; res: { score: number; reasons: string[] } } => !!x.res)
    .sort((a, b) => b.res.score - a.res.score).slice(0, limit);
}

/**
 * Stage 3: global pairing. Greedy by score gives a strong start, then 2-opt swaps
 * (re-pair any two pairs if the total improves) until stable. Pairs below `min` are never made.
 */
export function runMatching(people: Participant[], locked: Set<string>, blocked: Set<string>, min = 60) {
  const pool = people.filter((p) => !locked.has(p.id));
  const w = new Map<string, { score: number; reasons: string[] }>();
  const edges: [string, string, number][] = [];
  for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
    const k = key(pool[i].id, pool[j].id);
    if (blocked.has(k)) continue;
    const r = scorePair(pool[i].answers, pool[j].answers);
    if (r && r.score >= min) { w.set(k, r); edges.push([pool[i].id, pool[j].id, r.score]); }
  }
  edges.sort((x, y) => y[2] - x[2]);
  const used = new Set<string>();
  const pairs: [string, string][] = [];
  for (const [a, b] of edges) if (!used.has(a) && !used.has(b)) { used.add(a); used.add(b); pairs.push([a, b]); }

  const wt = (a: string, b: string) => w.get(key(a, b))?.score;
  for (let pass = 0; pass < 25; pass++) {
    let improved = false;
    for (let i = 0; i < pairs.length; i++) for (let j = i + 1; j < pairs.length; j++) {
      const [a, b] = pairs[i], [c, d] = pairs[j];
      const cur = wt(a, b)! + wt(c, d)!;
      const o1 = wt(a, c) !== undefined && wt(b, d) !== undefined ? wt(a, c)! + wt(b, d)! : -1;
      const o2 = wt(a, d) !== undefined && wt(b, c) !== undefined ? wt(a, d)! + wt(b, c)! : -1;
      if (Math.max(o1, o2) > cur) { if (o1 >= o2) { pairs[i] = [a, c]; pairs[j] = [b, d]; } else { pairs[i] = [a, d]; pairs[j] = [b, c]; } improved = true; }
    }
    if (!improved) break;
  }
  return pairs.map(([a, b]) => ({ aId: a, bId: b, ...w.get(key(a, b))! })).sort((x, y) => y.score - x.score);
}
