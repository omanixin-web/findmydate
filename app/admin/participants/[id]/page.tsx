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

  const show = (v: unknown) =>
    Array.isArray(v)
      ? v.join(", ")
      : typeof v === "boolean"
      ? v
        ? "Agreed / Yes"
        : "No"
      : String(v ?? "-");

  return (
    <>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin/participants">← All participants</Link>
      </p>
      <div className="pair" style={{ margin: "12px 0 24px" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem" }}>{String(p.answers.name || "Anonymous")}</h1>
          <p style={{ opacity: 0.8, marginTop: 4 }}>
            City: <strong>{String(p.answers.city || "-")}</strong> · WhatsApp:{" "}
            <strong>{String(p.answers.phone || "-")}</strong> ·{" "}
            {p.answers.instagram ? (
              <a
                href={`https://instagram.com/${String(p.answers.instagram).replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {String(p.answers.instagram)}
              </a>
            ) : (
              "no Instagram"
            )}{" "}
            · applied {new Date(p.createdAt).toLocaleString()}
          </p>
        </div>
        <DeleteParticipant id={p.id} />
      </div>

      <div className="card">
        <h3>Current matches</h3>
        {mine.length === 0 ? (
          <p style={{ opacity: 0.7 }}>None yet. Run matching from the dashboard.</p>
        ) : (
          mine.map((m) => {
            const o = m.aId === id ? m.bId : m.aId;
            return (
              <p key={m.id} style={{ marginBottom: 8 }}>
                <Link href={`/admin/participants/${o}`}>
                  <strong>{name(o)}</strong>
                </Link>{" "}
                · {m.score}% match · <span className="tag">{m.status.replace("_", " ")}</span>
              </p>
            );
          })
        )}
      </div>

      <div className="card">
        <h3>Best candidates right now</h3>
        {top.length === 0 ? (
          <p style={{ opacity: 0.7 }}>
            Nobody eligible yet. City, age range or gender preferences don't align with anyone in the pool.
          </p>
        ) : (
          top.map(({ other, res }) => (
            <div key={other.id} style={{ marginBottom: 16 }}>
              <Link href={`/admin/participants/${other.id}`}>
                <strong>{String(other.answers.name || "Participant")}</strong>
              </Link>
              , {String(other.answers.age)} yrs ({String(other.answers.city)}) ·{" "}
              <span className="score" style={{ fontSize: "1.2rem" }}>
                {res.score}%
              </span>
              <ul className="reasons" style={{ marginTop: 4 }}>
                {res.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {STEPS.map((s) => (
        <div className="card" key={s.id}>
          <h3 style={{ marginBottom: 12 }}>{s.title}</h3>
          <dl className="dl">
            {s.fields.map((f) => (
              <span key={f.id} style={{ display: "contents" }}>
                <dt>{f.label}</dt>
                <dd>{show(p.answers[f.id])}</dd>
              </span>
            ))}
          </dl>
        </div>
      ))}
    </>
  );
}
