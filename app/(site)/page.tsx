import Link from "next/link";

const steps = [
  { t: "Tell us who you are", p: "Twelve short, thoughtful steps: what you want, how you live, what you love. About eight minutes, and you can pause and come back." },
  { t: "We find your match", p: "Our matching process filters for the basics you set, then scores real compatibility across values, lifestyle, personality and more." },
  { t: "We plan the date", p: "When you and your match are a fit, our team contacts you both and arranges a comfortable first meeting. You just show up." },
];
const looks = [
  ["Intent", "Same relationship goals and timeline"],
  ["Values", "Children, faith and family"],
  ["Personality", "Social energy, spontaneity, ambition"],
  ["Interests", "Shared passions to talk about"],
  ["Lifestyle", "Food, habits, daily rhythm"],
  ["Connection", "Love languages and conflict style"],
  ["Logistics", "City, free time, first-date style"],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1>Skip the swiping. <em>We'll plan the date.</em></h1>
          <p className="lede">Tell us who you are in a few thoughtful steps. FindMyDate finds someone genuinely compatible, then arranges your first meeting.</p>
          <div className="cta-row">
            <Link href="/apply" className="btn">Find my match</Link>
            <Link href="/how-it-works" className="btn ghost">How it works</Link>
          </div>
        </div>
        <div className="demo" aria-label="Example of a compatibility result">
          <p style={{ fontSize: ".85rem", opacity: 0.7 }}>Example match</p>
          <p className="score" style={{ fontSize: "4rem", margin: "4px 0" }}>92%</p>
          <p style={{ marginBottom: 14 }}>Aarthi &amp; Karthik, Chennai</p>
          <ul className="reasons">
            <li>Both want a serious, long-term relationship</li>
            <li>Shared interests: Travel, Music, Cooking</li>
            <li>Closely aligned on children, faith and family</li>
            <li>Free on Saturday evenings, both love a coffee first date</li>
          </ul>
        </div>
      </section>

      <section className="section" id="how">
        <h2>Three steps to a first date</h2>
        <ol className="acts">{steps.map((a) => <li key={a.t}><h3>{a.t}</h3><p>{a.p}</p></li>)}</ol>
      </section>

      <section className="section promise">
        <h2>What we look at</h2>
        <div className="promise-grid">{looks.map(([t, p]) => <p key={t}><strong>{t}</strong>{p}</p>)}</div>
      </section>

      <section className="section join">
        <h2>Ready when you are</h2>
        <p>It's free to apply. Your details are only seen by our small matchmaking team.</p>
        <Link href="/apply" className="btn">Start my profile</Link>
      </section>
    </main>
  );
}
