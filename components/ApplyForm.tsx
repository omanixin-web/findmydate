"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STEPS, validateStep, type Answers, type Answer, type Field } from "@/lib/questions";

const KEY = "findmydate-draft-v1";

function Input({ f, v, set, err }: { f: Field; v: Answer | undefined; set: (x: Answer) => void; err?: string }) {
  const id = `f-${f.id}`;
  let body: React.ReactNode;
  if (f.type === "select") {
    body = <div className="chips" role="radiogroup" aria-label={f.label}>{f.options!.map((o) => (
      <button type="button" role="radio" aria-checked={v === o} aria-pressed={v === o} key={o} className="chip" onClick={() => set(o)}>{o}</button>))}</div>;
  } else if (f.type === "multi") {
    const cur = (Array.isArray(v) ? v : []) as string[];
    body = <div className="chips">{f.options!.map((o) => {
      const on = cur.includes(o);
      return <button type="button" key={o} aria-pressed={on} className="chip" onClick={() => set(on ? cur.filter((x) => x !== o) : cur.length < (f.maxSelect ?? 99) ? [...cur, o] : cur)}>{o}</button>;
    })}</div>;
  } else if (f.type === "scale") {
    body = <><div className="scale">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} aria-pressed={v === n} aria-label={`${n} of 5`} className="chip" onClick={() => set(n)}>{n}</button>)}</div>
      <div className="scale-ends"><span>{f.lo}</span><span>{f.hi}</span></div></>;
  } else if (f.type === "textarea") {
    body = <textarea id={id} className="input" value={String(v ?? "")} maxLength={f.maxLen} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />;
  } else if (f.type === "consent") {
    return <div className="field"><label className="consent"><input type="checkbox" checked={v === true} onChange={(e) => set(e.target.checked)} /> <span>{f.label}</span></label>{err && <p className="err">{err}</p>}</div>;
  } else {
    body = <input id={id} className="input" type={f.type === "number" ? "number" : f.type === "handle" ? "text" : f.type} inputMode={f.type === "number" ? "numeric" : undefined} min={f.min} max={f.max} maxLength={f.maxLen}
      value={String(v ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.type === "number" ? e.target.value : e.target.value)} />;
  }
  const grouped = f.type === "select" || f.type === "multi" || f.type === "scale";
  return (
    <div className="field">
      {grouped ? <p className="lbl" id={`${id}-l`}>{f.label}{f.maxSelect ? <span className="help"> (up to {f.maxSelect})</span> : null}</p> : <label className="lbl" htmlFor={id}>{f.label}{f.optional ? <span className="help"> (optional)</span> : null}</label>}
      {f.help && <p className="help">{f.help}</p>}
      {body}
      {err && <p className="err" role="alert">{err}</p>}
    </div>
  );
}

export default function ApplyForm() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d) { setA(d.a || {}); setI(Math.min(d.i || 0, STEPS.length - 1)); } } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify({ a, i })); } catch {} }, [a, i, ready]);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const set = (id: string, v: Answer) => { setA((p) => ({ ...p, [id]: v })); setErrs((p) => { const n = { ...p }; delete n[id]; return n; }); };
  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });

  async function next() {
    const e = validateStep(step, a);
    setErrs(e);
    if (Object.keys(e).length) return top();
    if (!last) { setI(i + 1); return top(); }
    setBusy(true); setFatal("");
    try {
      const r = await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: a, website: (document.getElementById("website") as HTMLInputElement | null)?.value || "" }) });
      const d = await r.json();
      if (r.ok) { try { localStorage.removeItem(KEY); } catch {} router.push("/thanks"); return; }
      if (d.errors) { setErrs(d.errors); const idx = STEPS.findIndex((s) => s.fields.some((f) => d.errors[f.id])); if (idx >= 0) setI(idx); }
      setFatal(d.message || "Please check your answers."); top();
    } catch { setFatal("Network problem. Please try again."); } finally { setBusy(false); }
  }

  return (
    <div className="apply">
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1}><i style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
      <div className="stepmeta"><span>Step {i + 1} of {STEPS.length}</span><span>Saved on this device</span></div>
      <h1 style={{ fontSize: "2.2rem" }}>{step.title}</h1>
      <p style={{ opacity: 0.8, margin: "8px 0 28px" }}>{step.blurb}</p>
      {fatal && <p className="err" role="alert" style={{ marginBottom: 16 }}>{fatal}</p>}
      <div className={step.id === "prefs" ? "" : ""}>
        {step.fields.map((f) => <Input key={f.id} f={f} v={a[f.id]} set={(x) => set(f.id, x)} err={errs[f.id]} />)}
      </div>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <div className="nav-row">
        <button type="button" className="btn ghost" onClick={() => { setI(Math.max(0, i - 1)); top(); }} disabled={i === 0} style={{ opacity: i === 0 ? 0.4 : 1 }}>Back</button>
        <button type="button" className="btn" onClick={next} disabled={busy}>{busy ? "Submitting…" : last ? "Submit my profile" : "Continue"}</button>
      </div>
    </div>
  );
}
