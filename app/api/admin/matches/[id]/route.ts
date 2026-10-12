import { NextResponse } from "next/server";
import { mutate, type MatchStatus } from "@/lib/store";

export const runtime = "nodejs";
const OK: MatchStatus[] = ["suggested", "approved", "date_arranged", "declined"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  if (!OK.includes(b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const found = await mutate((db) => {
    const m = db.matches.find((x) => x.id === id);
    if (!m) return false;
    m.status = b.status;
    m.note = typeof b.note === "string" ? b.note.slice(0, 500) : m.note;
    m.dateAt = typeof b.dateAt === "string" && b.dateAt ? b.dateAt.slice(0, 40) : m.dateAt;
    m.updatedAt = new Date().toISOString();
    return true;
  });
  return found ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
