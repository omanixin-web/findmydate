import Link from "next/link";

const steps = [
  {
    t: "Tell us who you are",
    p: "Four structured sections covering your basic details, dating preferences, lifestyle and compatibility insights. Quick and auto-saved as you go.",
  },
  {
    t: "We find your match",
    p: "Our matchmaking engine pairs you within your city (Mumbai or Pune), cross-referencing your preferred neighbourhoods, vibe, timing, and personality.",
  },
  {
    t: "We plan the date",
    p: "When we find a mutual match, our team connects with you both to arrange a comfortable first meeting in your city. You just show up and enjoy.",
  },
];

const looks = [
  ["City & Neighbourhood", "Living or hanging out in matching zones in Mumbai & Pune"],
  ["Dating Preferences", "Age range, preferred date type, spending vibe and days"],
  ["Lifestyle & Habits", "Smoking, drinking and everyday social tempo"],
  ["Personality & Vibe", "Introvert vs. extrovert scale and friend-group vibe"],
  ["Core Qualities", "What you're really looking for in a partner"],
  ["Openness", "Intercultural and community openness"],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1>
            Skip the swiping. <em>We'll plan the date.</em>
          </h1>
          <p className="lede">
            Tell us who you are in a few thoughtful steps. FindMyDate finds someone genuinely compatible in Mumbai &amp; Pune, then arranges your first meeting.
          </p>
          <div className="cta-row">
            <Link href="/apply" className="btn">
              Find my match
            </Link>
            <Link href="/how-it-works" className="btn ghost">
              How it works
            </Link>
          </div>
        </div>
        <div className="demo" aria-label="Example of a compatibility result">
          <p style={{ fontSize: ".85rem", opacity: 0.7 }}>Example match</p>
          <p className="score" style={{ fontSize: "4rem", margin: "4px 0" }}>
            94%
          </p>
          <p style={{ marginBottom: 14 }}>Rhea &amp; Siddharth, Pune</p>
          <ul className="reasons">
            <li>Nearby neighbourhoods: Kothrud &amp; Baner</li>
            <li>Both enjoy: Coffee date on weekend afternoons</li>
            <li>Harmonious social energy and introvert/extrovert balance</li>
            <li>Aligned lifestyle habits and dating preferences</li>
          </ul>
        </div>
      </section>

      <section className="section" id="how">
        <h2>Three steps to a first date</h2>
        <ol className="acts">
          {steps.map((a) => (
            <li key={a.t}>
              <h3>{a.t}</h3>
              <p>{a.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section promise">
        <h2>What we look at</h2>
        <div className="promise-grid">
          {looks.map(([t, p]) => (
            <p key={t}>
              <strong>{t}</strong>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="section join">
        <h2>Ready when you are</h2>
        <p>Apply in minutes. Your details are private and only reviewed by our team.</p>
        <Link href="/apply" className="btn">
          Start my profile
        </Link>
      </section>
    </main>
  );
}
