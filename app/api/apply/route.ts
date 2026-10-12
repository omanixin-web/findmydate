import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { validateAll } from "@/lib/questions";
import { mutate } from "@/lib/store";

export const runtime = "nodejs";
const hits = new Map<string, { n: number; reset: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (h && h.reset > now && h.n >= 8) return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  hits.set(ip, { n: h && h.reset > now ? h.n + 1 : 1, reset: h && h.reset > now ? h.reset : now + 3600_000 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.answers !== "object") return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  if (body.website) return NextResponse.json({ ok: true }); // honeypot: bots fill hidden fields

  const { errors, clean } = validateAll(body.answers);
  if (Object.keys(errors).length) return NextResponse.json({ message: "Some answers need attention.", errors }, { status: 400 });

  const email = String(clean.email).toLowerCase();
  const dup = await mutate((db) => {
    if (db.participants.some((p) => String(p.answers.email).toLowerCase() === email)) return true;
    db.participants.push({ id: randomUUID(), createdAt: new Date().toISOString(), answers: clean });
    return false;
  });
  if (dup) return NextResponse.json({ message: "This email has already applied. We'll be in touch soon." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
