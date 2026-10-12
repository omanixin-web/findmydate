import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/store";
import { rankFor } from "@/lib/matching";
import { STEPS } from "@/lib/questions";
import { DeleteParticipant } from "@/components/admin/Actions";

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const p = db.participants.find((x) => x.id === id);
  if (!p) notFound();
  const name = (pid: string) => String(db.participants.find((x) => x.id === pid)?.answers.name ?? "Deleted");
  const mine = db.matches.filter((m) => m.aId === id || m.bId === id);
  const top = rankFor(p, db.participants, 5);
  const show = (v: unknown) => (Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v ?? "-"));
  return (
    <>
      <p><Link href="/admin/participants">← All participants</Link></p>
      <div className="pair" style={{ margin: "12px 0 24px" }}>
        <div><h1 style={{ fontSize: "2.2rem" }}>{String(p.answers.name)}</h1><p style={{ opacity: 0.8 }}>{String(p.answers.email)} · {String(p.answers.phone)} · {p.answers.instagram ? <a href={`https://instagram.com/${p.answers.instagram}`} target="_blank" rel="noopener noreferrer">@{String(p.answers.instagram)}</a> : "no Instagram"} · applied {new Date(p.createdAt).toLocaleString()}</p></div>
        <DeleteParticipant id={p.id} />
      </div>

      <div className="card"><h3>Current matches</h3>
        {mine.length === 0 ? <p style={{ opacity: 0.7 }}>None yet. Run matching from the dashboard.</p> : mine.map((m) => { const o = m.aId === id ? m.bId : m.aId; return <p key={m.id}><Link href={`/admin/participants/${o}`}>{name(o)}</Link> · {m.score}% · <span className="tag">{m.status.replace("_", " ")}</span></p>; })}
      </div>
      <div className="card"><h3>Best candidates right now</h3>
        {top.length === 0 ? <p style={{ opacity: 0.7 }}>Nobody eligible yet. Preferences, city or deal-breakers don't line up with anyone in the pool.</p> : top.map(({ other, res }) => (
          <div key={other.id} style={{ marginBottom: 12 }}><Link href={`/admin/participants/${other.id}`}>{String(other.answers.name)}</Link>, {String(other.answers.age)} · <span className="score" style={{ fontSize: "1.2rem" }}>{res.score}%</span>
            <ul className="reasons">{res.reasons.map((r) => <li key={r}>{r}</li>)}</ul></div>))}
      </div>
      {STEPS.map((s) => (
        <div className="card" key={s.id}><h3 style={{ marginBottom: 10 }}>{s.title}</h3>
          <dl className="dl">{s.fields.map((f) => <><dt key={f.id + "t"}>{f.label.length > 40 ? f.label.slice(0, 40) + "…" : f.label}</dt><dd key={f.id}>{show(p.answers[f.id])}</dd></>)}</dl></div>
      ))}
    </>
  );
}
