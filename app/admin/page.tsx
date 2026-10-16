import { getDB } from "@/lib/store";
import Bars from "@/components/Bars";
import { RunMatching } from "@/components/admin/Actions";

const count = (xs: string[]) => Object.entries(xs.reduce<Record<string, number>>((a, x) => ((a[x] = (a[x] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]) as [string, number][];

export default async function Dashboard() {
  const { participants: P, matches: M } = await getDB();
  const week = P.filter((p) => Date.now() - +new Date(p.createdAt) < 7 * 864e5).length;
  const matched = new Set(M.filter((m) => m.status === "approved" || m.status === "date_arranged").flatMap((m) => [m.aId, m.bId]));
  const suggested = new Set(M.filter((m) => m.status === "suggested").flatMap((m) => [m.aId, m.bId]));
  const st = (s: string) => M.filter((m) => m.status === s).length;
  const live = M.filter((m) => m.status !== "declined");
  const avg = live.length ? Math.round(live.reduce((t, m) => t + m.score, 0) / live.length) : 0;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return [d.toLocaleDateString("en", { weekday: "short" }), P.filter((p) => new Date(p.createdAt).toDateString() === d.toDateString()).length] as [string, number]; });

  return (
    <>
      <h1 style={{ fontSize: "2.2rem" }}>Dashboard</h1>
      <div className="stats">
        <div className="stat"><b>{P.length}</b>Total submissions</div>
        <div className="stat"><b>{week}</b>Last 7 days</div>
        <div className="stat"><b>{suggested.size / 2}</b>Pairs awaiting review</div>
        <div className="stat"><b>{st("approved") + st("date_arranged")}</b>Approved or arranged</div>
        <div className="stat"><b>{P.filter((p) => !matched.has(p.id) && !suggested.has(p.id)).length}</b>Unmatched people</div>
        <div className="stat"><b>{avg}%</b>Average match score</div>
      </div>
      <div className="row" style={{ marginBottom: 32 }}><RunMatching /></div>
      <div className="cols">
        <div className="card"><h3>Submissions, last 7 days</h3><Bars data={days} /></div>
        <div className="card"><h3>Gender</h3><Bars data={count(P.map((p) => String(p.answers.gender)))} /></div>
        <div className="card"><h3>Top cities</h3><Bars data={count(P.map((p) => String(p.answers.city).trim()))} /></div>
        <div className="card"><h3>Looking to connect with</h3><Bars data={count(P.map((p) => String(p.answers.interestedIn || "Not set")))} /></div>
        <div className="card"><h3>Preferred date type</h3><Bars data={count(P.map((p) => String(p.answers.dateType || "Not set")))} /></div>
        <div className="card"><h3>Match status</h3><Bars data={[["Suggested", st("suggested")], ["Approved", st("approved")], ["Date arranged", st("date_arranged")], ["Declined", st("declined")]]} /></div>
      </div>
    </>
  );
}
