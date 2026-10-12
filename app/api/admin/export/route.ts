import { getDB } from "@/lib/store";
import { ALL_FIELDS } from "@/lib/questions";

export const runtime = "nodejs";
const cell = (v: unknown) => {
  let t = Array.isArray(v) ? v.join("; ") : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // block CSV/formula injection
  return `"${t.replace(/"/g, '""')}"`;
};
export async function GET() {
  const db = await getDB();
  const head = ["id", "submitted", ...ALL_FIELDS.map((f) => f.id)];
  const rows = db.participants.map((p) => [p.id, p.createdAt, ...ALL_FIELDS.map((f) => p.answers[f.id])].map(cell).join(","));
  return new Response([head.join(","), ...rows].join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="findmydate-participants.csv"' } });
}
