"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  STEPS,
  validateStep,
  countWords,
  PUNE_NEIGHBOURHOODS,
  MUMBAI_NEIGHBOURHOODS,
  type Answers,
  type Answer,
  type Field,
} from "@/lib/questions";

const KEY = "findmydate-draft-v2";

function Input({
  f,
  v,
  set,
  err,
  answers,
}: {
  f: Field;
  v: Answer | undefined;
  set: (x: Answer) => void;
  err?: string;
  answers: Answers;
}) {
  const id = `f-${f.id}`;
  let body: React.ReactNode;

  // Dynamically resolve options for neighbourhood based on city
  let effectiveOptions = f.options;
  if (f.id === "neighbourhood") {
    const selectedCity = String(answers.city ?? "").toLowerCase();
    effectiveOptions = selectedCity.includes("mumbai") ? MUMBAI_NEIGHBOURHOODS : PUNE_NEIGHBOURHOODS;
  }

  if (f.type === "select") {
    body = (
      <div className="chips" role="radiogroup" aria-label={f.label}>
        {effectiveOptions?.map((o) => {
          const selected = v === o;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              aria-pressed={selected}
              key={o}
              className={`chip ${selected ? "active" : ""}`}
              onClick={() => set(o)}
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  } else if (f.type === "multi") {
    const cur = (Array.isArray(v) ? v : []) as string[];
    body = (
      <div className="checkbox-grid">
        {effectiveOptions?.map((o) => {
          const on = cur.includes(o);
          return (
            <label key={o} className={`checkbox-chip ${on ? "selected" : ""}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => {
                  const updated = on ? cur.filter((x) => x !== o) : [...cur, o];
                  set(updated);
                }}
              />
              <span>{o}</span>
            </label>
          );
        })}
      </div>
    );
  } else if (f.type === "scale") {
    body = (
      <div className="scale-container">
        <div className="scale">
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = v === n;
            return (
              <button
                type="button"
                key={n}
                aria-pressed={selected}
                aria-label={`${n} of 5`}
                className={`chip scale-chip ${selected ? "active" : ""}`}
                onClick={() => set(n)}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="scale-ends">
          <span>{f.lo}</span>
          <span>{f.hi}</span>
        </div>
      </div>
    );
  } else if (f.type === "textarea") {
    const textVal = String(v ?? "");
    const words = countWords(textVal);
    body = (
      <div className="textarea-wrapper">
        <textarea
          id={id}
          className="input"
          value={textVal}
          maxLength={f.maxLen}
          placeholder={f.placeholder}
          onChange={(e) => set(e.target.value)}
        />
        {f.minWords && (
          <div className="counter-row">
            <span className={`word-badge ${words >= f.minWords ? "ready" : ""}`}>
              {words} / {f.minWords} words minimum
            </span>
          </div>
        )}
      </div>
    );
  } else if (f.type === "consent") {
    return (
      <div className="field consent-field">
        <label className="agreement-card">
          <input
            type="checkbox"
            checked={v === true}
            onChange={(e) => set(e.target.checked)}
          />
          <span className="agreement-text">{f.label}</span>
        </label>
        {err && <p className="err">{err}</p>}
      </div>
    );
  } else {
    body = (
      <input
        id={id}
        className="input"
        type={f.type === "number" ? "number" : f.type === "tel" ? "tel" : "text"}
        inputMode={f.type === "number" ? "numeric" : f.type === "tel" ? "tel" : undefined}
        min={f.min}
        max={f.max}
        maxLength={f.maxLen}
        value={String(v ?? "")}
        placeholder={f.placeholder}
        onChange={(e) => set(f.type === "number" ? e.target.value : e.target.value)}
      />
    );
  }

  const grouped = f.type === "select" || f.type === "multi" || f.type === "scale";

  return (
    <div className="field">
      {grouped ? (
        <p className="lbl" id={`${id}-l`}>
          {f.label}
          {f.help ? <span className="help-block">{f.help}</span> : null}
        </p>
      ) : (
        <label className="lbl" htmlFor={id}>
          {f.label}
          {f.help ? <span className="help-block">{f.help}</span> : null}
        </label>
      )}
      {body}
      {err && (
        <p className="err" role="alert">
          {err}
        </p>
      )}
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
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d) {
        setA(d.a || {});
        setI(Math.min(d.i || 0, STEPS.length - 1));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ a, i }));
      } catch {}
    }
  }, [a, i, ready]);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const set = (id: string, v: Answer) => {
    setA((p) => ({ ...p, [id]: v }));
    setErrs((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };

  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });

  async function next() {
    const e = validateStep(step, a);
    setErrs(e);
    if (Object.keys(e).length > 0) return top();
    if (!last) {
      setI(i + 1);
      return top();
    }

    setBusy(true);
    setFatal("");
    try {
      const r = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: a,
          website: (document.getElementById("website") as HTMLInputElement | null)?.value || "",
        }),
      });
      const d = await r.json();
      if (r.ok) {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        router.push("/thanks");
        return;
      }
      if (d.errors) {
        setErrs(d.errors);
        const idx = STEPS.findIndex((s) => s.fields.some((f) => d.errors[f.id]));
        if (idx >= 0) setI(idx);
      }
      setFatal(d.message || "Please check your answers.");
      top();
    } catch {
      setFatal("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="apply">
      {/* Brand logo header */}
      <div className="form-brand-header">
        <Image
          src="/logo.png"
          alt="findmydate.in"
          width={84}
          height={84}
          className="form-logo"
          priority
        />
        <div className="form-brand-sub">findmydate.in</div>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={i + 1}
      >
        <i style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="stepmeta">
        <span>
          Step {i + 1} of {STEPS.length} · <strong>{step.title}</strong>
        </span>
        <span className="saved-indicator">Auto-saved</span>
      </div>

      <h1 className="step-heading">{step.title}</h1>
      <p className="step-blurb">{step.blurb}</p>

      {fatal && (
        <p className="err err-fatal" role="alert">
          {fatal}
        </p>
      )}

      <div className="fields-stack">
        {step.fields.map((f) => (
          <Input
            key={f.id}
            f={f}
            v={a[f.id]}
            set={(x) => set(f.id, x)}
            err={errs[f.id]}
            answers={a}
          />
        ))}
      </div>

      <input
        id="website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />

      <div className="nav-row">
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setI(Math.max(0, i - 1));
            top();
          }}
          disabled={i === 0}
          style={{ opacity: i === 0 ? 0.35 : 1 }}
        >
          ← Back
        </button>
        <button type="button" className="btn" onClick={next} disabled={busy}>
          {busy ? "Submitting…" : last ? "Submit my profile" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
