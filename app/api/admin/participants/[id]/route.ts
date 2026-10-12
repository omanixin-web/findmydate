import { NextResponse } from "next/server";
import { mutate } from "@/lib/store";

export const runtime = "nodejs";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await mutate((db) => {
    db.participants = db.participants.filter((p) => p.id !== id);
    db.matches = db.matches.filter((m) => m.aId !== id && m.bId !== id);
  });
  return NextResponse.json({ ok: true });
}
