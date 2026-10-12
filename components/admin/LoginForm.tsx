"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u, password: p, slug }) });
    if (r.ok) { router.push("/admin"); router.refresh(); return; }
    setErr((await r.json().catch(() => ({}))).error || "Sign-in failed."); setBusy(false);
  }
  return (
    <form onSubmit={go} className="card" style={{ maxWidth: 380, margin: "20vh auto 0" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 16 }}>Team sign-in</h1>
      <div className="field"><label className="lbl" htmlFor="u">Username</label><input id="u" className="input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required /></div>
      <div className="field"><label className="lbl" htmlFor="p">Password</label><input id="p" className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></div>
      {err && <p className="err" role="alert" style={{ marginBottom: 12 }}>{err}</p>}
      <button className="btn" disabled={busy} style={{ width: "100%" }}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
