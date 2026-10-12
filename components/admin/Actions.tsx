"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return <button className="link" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/"); router.refresh(); }}>Sign out</button>;
}

export function RunMatching() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  return <div className="row"><button className="btn" disabled={busy} onClick={async () => {
    setBusy(true); const r = await fetch("/api/admin/matches/run", { method: "POST" }); const d = await r.json();
    setMsg(`${d.count} suggested pairs generated.`); setBusy(false); router.refresh();
  }}>{busy ? "Matching…" : "Run matching"}</button><span style={{ opacity: 0.8 }}>{msg}</span></div>;
}

export function SeedButton() {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button className="btn ghost small" disabled={busy} onClick={async () => { setBusy(true); await fetch("/api/admin/seed", { method: "POST" }); setBusy(false); router.refresh(); }}>{busy ? "Adding…" : "Add 30 demo people (dev only)"}</button>;
}

export function DeleteParticipant({ id }: { id: string }) {
  const router = useRouter();
  return <button className="btn danger small" onClick={async () => {
    if (!confirm("Permanently delete this person and their matches?")) return;
    await fetch(`/api/admin/participants/${id}`, { method: "DELETE" }); router.push("/admin/participants"); router.refresh();
  }}>Delete person</button>;
}

export function MatchActions({ id, status, note, dateAt }: { id: string; status: string; note?: string; dateAt?: string }) {
  const router = useRouter(); const [n, setN] = useState(note || ""); const [d, setD] = useState(dateAt || ""); const [busy, setBusy] = useState(false);
  async function set(st: string) {
    setBusy(true); await fetch(`/api/admin/matches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st, note: n, dateAt: d }) });
    setBusy(false); router.refresh();
  }
  return (
    <div style={{ marginTop: 14 }}>
      <div className="two">
        <input className="input" type="datetime-local" value={d} onChange={(e) => setD(e.target.value)} aria-label="Date and time" />
        <input className="input" placeholder="Place / note (e.g. Cafe at Besant Nagar, 6pm)" value={n} maxLength={500} onChange={(e) => setN(e.target.value)} aria-label="Note" />
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn small" disabled={busy || status === "approved"} onClick={() => set("approved")}>Approve</button>
        <button className="btn small ghost" disabled={busy} onClick={() => set("date_arranged")}>Date arranged</button>
        <button className="btn small danger" disabled={busy} onClick={() => set("declined")}>Decline</button>
        {status !== "suggested" && <button className="btn small ghost" disabled={busy} onClick={() => set("suggested")}>Reset</button>}
      </div>
    </div>
  );
}
