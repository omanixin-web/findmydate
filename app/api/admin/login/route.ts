import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { COOKIE, SESSION_HOURS, adminPath, createSession } from "@/lib/auth";

export const runtime = "nodejs";
const attempts = new Map<string, { n: number; reset: number }>();
const h = (v: unknown) => createHash("sha256").update(String(v ?? "")).digest();
const prod = process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.reset > now && rec.n >= 5) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const pw = process.env.ADMIN_PASSWORD || (prod ? "" : "findmydate-dev");
  const user = process.env.ADMIN_USERNAME || "admin";
  const slug = adminPath();
  const ok = !!slug && !!pw && body.slug === slug && timingSafeEqual(h(body.password), h(pw)) && timingSafeEqual(h(body.username), h(user));

  if (!ok) {
    attempts.set(ip, { n: rec && rec.reset > now ? rec.n + 1 : 1, reset: rec && rec.reset > now ? rec.reset : now + 15 * 60_000 });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), { httpOnly: true, sameSite: "strict", secure: prod, path: "/", maxAge: SESSION_HOURS * 3600 });
  return res;
}
