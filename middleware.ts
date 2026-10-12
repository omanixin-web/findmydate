import { NextRequest, NextResponse } from "next/server";
import { COOKIE, adminPath, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = adminPath();
  const authed = await verifySession(req.cookies.get(COOKIE)?.value);
  const hide = () => NextResponse.rewrite(new URL("/not-found-404", req.url), { status: 404 });

  // The secret login URL is the ONLY way to reach the login page.
  if (slug && pathname === slug) {
    return authed ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.rewrite(new URL("/admin-login", req.url));
  }
  if (pathname.startsWith("/admin-login")) return hide();
  if (pathname === "/api/admin/login") return NextResponse.next();
  if (pathname.startsWith("/admin")) return authed ? NextResponse.next() : hide();
  if (pathname.startsWith("/api/admin")) return authed ? NextResponse.next() : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };
