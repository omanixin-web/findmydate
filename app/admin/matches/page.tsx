import Link from "next/link";
import { getDB, type Match } from "@/lib/store";
import { RunMatching, MatchActions } from "@/components/admin/Actions";

const GROUPS: [string, string][] = [["suggested", "Awaiting your review"], ["approved", "Approved"], ["date_arranged", "Date arranged"], ["declined", "Declined"]];

export default async function Matches() {
  const db = await getDB();
  const by = (id: string) => db.participants.find((p) => p.id === id);
  const card = (m: Match) => {
    const a = by(m.aId), b = by(m.bId);
    if (!a || !b) return null;
    return (
      <div className="card" key={m.id}>
        <div className="pair">
          <div><h3><Link href={`/admin/participants/${a.id}`}>{String(a.answers.name)}</Link> ({String(a.answers.age)}) &amp; <Link href={`/admin/participants/${b.id}`}>{String(b.answers.name)}</Link> ({String(b.answers.age)})</h3>
            <p style={{ opacity: 0.75, fontSize: ".9rem" }}>{String(a.answers.city)} · {String(a.answers.email)} / {String(a.answers.phone)}{a.answers.instagram ? <> / <a href={`https://instagram.com/${a.answers.instagram}`} target="_blank" rel="noopener noreferrer">@{String(a.answers.instagram)}</a></> : null} · {String(b.answers.email)} / {String(b.answers.phone)}{b.answers.instagram ? <> / <a href={`https://instagram.com/${b.answers.instagram}`} target="_blank" rel="noopener noreferrer">@{String(b.answers.instagram)}</a></> : null}</p></div>
          <p className="score">{m.score}%</p>
        </div>
        <ul className="reasons">{m.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        {m.dateAt && <p style={{ marginTop: 8 }}>Date: {new Date(m.dateAt).toLocaleString()}{m.note ? ` · ${m.note}` : ""}</p>}
        <MatchActions id={m.id} status={m.status} note={m.note} dateAt={m.dateAt} />
      </div>
    );
  };
  return (
    <>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 16 }}>Matches</h1>
      <RunMatching />
      <p style={{ opacity: 0.7, margin: "12px 0 28px", maxWidth: 640 }}>Running matching rebuilds only the "awaiting review" list. Approved and arranged pairs stay locked, and declined pairs are never suggested again.</p>
      {GROUPS.map(([s, label]) => { const list = db.matches.filter((m) => m.status === s).sort((a, b) => b.score - a.score); return (
        <section key={s} style={{ marginBottom: 32 }}><h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>{label} ({list.length})</h2>{list.length ? list.map(card) : <p style={{ opacity: 0.6 }}>Nothing here.</p>}</section>); })}
    </>
  );
}
