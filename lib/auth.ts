// Signed-cookie sessions using Web Crypto, so this works in both middleware (edge) and route handlers (node).
export const COOKIE = "cl_admin";
const prod = process.env.NODE_ENV === "production";
export const adminPath = () => {
  const p = process.env.ADMIN_LOGIN_PATH;
  if (!p) return prod ? "" : "/portal-dev";
  return p.startsWith("/") ? p : `/${p}`;
};
const secret = () => process.env.SESSION_SECRET || (prod ? "" : "dev-secret-change-me-0123456789abcdef");
const enc = new TextEncoder();

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export const SESSION_HOURS = 8;
export async function createSession() {
  const exp = String(Date.now() + SESSION_HOURS * 3600_000);
  return `${exp}.${await hmac(exp)}`;
}
export async function verifySession(token?: string) {
  if (!token || !secret()) return false; // fails closed when SESSION_SECRET is unset in production
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = await hmac(exp);
  if (good.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
