import type { Answers } from "./questions";
import type { Participant } from "./store";

const s = (a: Answers, k: string) => String(a[k] ?? "");
const n = (a: Answers, k: string) => Number(a[k] ?? 0);
const m = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : []);
const norm = (x: string) => x.trim().toLowerCase();

export function parseAgeRange(text: string, fallbackAge = 25): [number, number] {
  const matches = text.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return [Math.max(18, fallbackAge - 4), fallbackAge + 4];
  }
  if (matches.length === 1) {
    const val = Number(matches[0]);
    return [Math.max(18, val - 3), val + 3];
  }
  const low = Math.min(Number(matches[0]), Number(matches[1]));
  const high = Math.max(Number(matches[0]), Number(matches[1]));
  return [Math.max(18, low), Math.min(99, high)];
}

/** Stage 1: Hard eligibility filters */
export function eligible(A: Answers, B: Answers): boolean {
  // Gender match: A's interest matches B's gender, and B's interest matches A's gender
  const aInt = s(A, "interestedIn");
  const bInt = s(B, "interestedIn");
  const aGen = s(A, "gender");
  const bGen = s(B, "gender");

  if (aInt && bGen && aInt !== "Other" && aInt !== bGen) return false;
  if (bInt && aGen && bInt !== "Other" && bInt !== aGen) return false;

  // City match: Both must be in the same city (Mumbai / Pune)
  const aCity = norm(s(A, "city"));
  const bCity = norm(s(B, "city"));
  if (aCity && bCity && aCity !== bCity) return false;

  // Age match against requested age ranges
  const aAge = n(A, "age") || 25;
  const bAge = n(B, "age") || 25;
  const [aMin, aMax] = parseAgeRange(s(A, "ageRange"), aAge);
  const [bMin, bMax] = parseAgeRange(s(B, "ageRange"), bAge);

  if (bAge < aMin || bAge > aMax) return false;
  if (aAge < bMin || aAge > bMax) return false;

  return true;
}

const sim = (x: number, y: number, range = 4) => Math.max(0, 1 - Math.abs(x - y) / range);

function overlapWords(textA: string, textB: string): string[] {
  const wordsA = new Set(norm(textA).split(/\W+/).filter((w) => w.length > 3));
  const wordsB = new Set(norm(textB).split(/\W+/).filter((w) => w.length > 3));
  const stopWords = new Set(["with", "have", "from", "that", "this", "they", "some", "like", "love", "your", "good"]);
  const common: string[] = [];
  for (const w of wordsA) {
    if (wordsB.has(w) && !stopWords.has(w)) common.push(w);
  }
  return common;
}

/** Stage 2: Compatibility scoring */
export function scorePair(A: Answers, B: Answers): { score: number; reasons: string[] } | null {
  if (!eligible(A, B)) return null;

  const reasons: string[] = [];
  let totalWeight = 0;
  let totalScore = 0;

  // 1. City & Neighbourhood fit (Weight: 20)
  totalWeight += 20;
  const aHoods = m(A, "neighbourhood");
  const bHoods = m(B, "neighbourhood");
  const hoodOverlap = aHoods.filter((h) => bHoods.includes(h) && h !== "Other");
  if (hoodOverlap.length > 0) {
    totalScore += 20;
    reasons.push(`Nearby neighbourhoods: ${hoodOverlap.join(", ")}`);
  } else {
    totalScore += 12; // Same city already verified in eligible()
  }

  // 2. Date schedule & timing (Weight: 15)
  totalWeight += 15;
  const aDays = s(A, "dateDays");
  const bDays = s(B, "dateDays");
  const daysMatch = aDays === "Both" || bDays === "Both" || aDays === bDays;

  const aTime = s(A, "dateTime");
  const bTime = s(B, "dateTime");
  const timeMatch = aTime === "Any works" || bTime === "Any works" || aTime === bTime;

  if (daysMatch && timeMatch) {
    totalScore += 15;
    reasons.push("Compatible date schedule and preferred times");
  } else if (daysMatch || timeMatch) {
    totalScore += 10;
  } else {
    totalScore += 4;
  }

  // 3. Date style & spending vibe (Weight: 15)
  totalWeight += 15;
  const aDateType = s(A, "dateType");
  const bDateType = s(B, "dateType");
  if (aDateType === bDateType && aDateType) {
    totalScore += 8;
    reasons.push(`Both enjoy: ${aDateType}`);
  } else {
    totalScore += 4;
  }

  const aSpend = s(A, "dateSpend");
  const bSpend = s(B, "dateSpend");
  if (aSpend === bSpend && aSpend) {
    totalScore += 7;
  } else {
    totalScore += 4;
  }

  // 4. Social Vibe scale 1-5 (Weight: 15)
  totalWeight += 15;
  const aVibe = n(A, "socialVibe") || 3;
  const bVibe = n(B, "socialVibe") || 3;
  const vibeSim = sim(aVibe, bVibe, 4);
  totalScore += 15 * vibeSim;
  if (vibeSim >= 0.75) {
    reasons.push("Harmonious social energy and introvert/extrovert balance");
  }

  // 5. Habits (Smoke & Drink) (Weight: 15)
  totalWeight += 15;
  const aSmoke = s(A, "smoke");
  const bSmoke = s(B, "smoke");
  const smokeFit = aSmoke === bSmoke ? 1 : 0.4;

  const aDrink = s(A, "drink");
  const bDrink = s(B, "drink");
  const drinkFit = aDrink === bDrink ? 1 : (aDrink === "Occasionally" || bDrink === "Occasionally") ? 0.8 : 0.4;

  const habitScore = 8 * smokeFit + 7 * drinkFit;
  totalScore += habitScore;
  if (smokeFit === 1 && drinkFit >= 0.8) {
    reasons.push("Aligned lifestyle habits on smoking and drinking");
  }

  // 6. Shared interests & values (Weight: 10)
  totalWeight += 10;
  const commonInterests = overlapWords(s(A, "interests"), s(B, "interests"));
  if (commonInterests.length > 0) {
    totalScore += 10;
    reasons.push(`Common interests: ${commonInterests.slice(0, 3).join(", ")}`);
  } else {
    totalScore += 5;
  }

  // 7. Inter-diversity openness (Weight: 10)
  totalWeight += 10;
  const aDiv = s(A, "interDiversity");
  const bDiv = s(B, "interDiversity");
  if (aDiv === "Yes" && bDiv === "Yes") {
    totalScore += 10;
    reasons.push("Open to intercultural connections");
  } else if (aDiv === "No" || bDiv === "No") {
    totalScore += 4;
  } else {
    totalScore += 7;
  }

  const finalScore = Math.min(99, Math.max(50, Math.round((totalScore / totalWeight) * 100)));
  return { score: finalScore, reasons };
}

export function rankFor(p: Participant, all: Participant[], limit = 5) {
  const ranked: { other: Participant; res: { score: number; reasons: string[] } }[] = [];
  for (const o of all) {
    if (o.id === p.id) continue;
    const r = scorePair(p.answers, o.answers);
    if (r) ranked.push({ other: o, res: r });
  }
  ranked.sort((a, b) => b.res.score - a.res.score);
  return ranked.slice(0, limit);
}

export function runMatching(
  all: Participant[],
  locked: Set<string> = new Set(),
  blocked: Set<string> = new Set()
) {
  const pairs: { aId: string; bId: string; score: number; reasons: string[] }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const A = all[i];
      const B = all[j];
      if (locked.has(A.id) || locked.has(B.id)) continue;

      const key = [A.id, B.id].sort().join("|");
      if (seen.has(key) || blocked.has(key)) continue;
      seen.add(key);

      const res = scorePair(A.answers, B.answers);
      if (res && res.score >= 55) {
        pairs.push({
          aId: A.id,
          bId: B.id,
          score: res.score,
          reasons: res.reasons,
        });
      }
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  return pairs;
}
