import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutate } from "@/lib/store";
import { runMatching } from "@/lib/matching";

export const runtime = "nodejs";
export async function POST() {
  const count = await mutate((db) => {
    const locked = new Set<string>(), blocked = new Set<string>();
    for (const m of db.matches) {
      if (m.status === "approved" || m.status === "date_arranged") { locked.add(m.aId); locked.add(m.bId); }
      if (m.status === "declined") blocked.add([m.aId, m.bId].sort().join("|"));
    }
    db.matches = db.matches.filter((m) => m.status !== "suggested");
    const now = new Date().toISOString();
    const pairs = runMatching(db.participants, locked, blocked);
    for (const p of pairs) db.matches.push({ id: randomUUID(), ...p, status: "suggested", createdAt: now, updatedAt: now });
    return pairs.length;
  });
  return NextResponse.json({ count });
}
