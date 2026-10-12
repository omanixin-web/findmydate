import Link from "next/link";
import { getDB } from "@/lib/store";

export default async function Participants({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { participants, matches } = await getDB();
  const ql = q.toLowerCase();
  const list = participants.filter((p) => !ql || [p.answers.name, p.answers.email, p.answers.city].join(" ").toLowerCase().includes(ql)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const status = (id: string) => { const m = matches.filter((x) => (x.aId === id || x.bId === id) && x.status !== "declined").sort((a, b) => b.score - a.score)[0]; return m ? m.status.replace("_", " ") : "unmatched"; };
  return (
    <>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 16 }}>Participants ({list.length})</h1>
      <form className="row" style={{ marginBottom: 20 }}><input className="input" name="q" defaultValue={q} placeholder="Search name, email or city" style={{ maxWidth: 360 }} aria-label="Search" /><button className="btn small">Search</button></form>
      <table>
        <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>City</th><th>Wants</th><th>Submitted</th><th>Status</th></tr></thead>
        <tbody>{list.map((p) => (
          <tr key={p.id}>
            <td><Link href={`/admin/participants/${p.id}`}>{String(p.answers.name)}</Link></td><td>{String(p.answers.age)}</td><td>{String(p.answers.gender)}</td>
            <td>{String(p.answers.city)}</td><td>{String(p.answers.intent)}</td><td>{new Date(p.createdAt).toLocaleDateString()}</td><td><span className="tag">{status(p.id)}</span></td>
          </tr>))}</tbody>
      </table>
    </>
  );
}
