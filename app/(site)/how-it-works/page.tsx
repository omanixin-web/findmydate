import Link from "next/link";
export const metadata = { title: "How it works" };
export default function How() {
  return (
    <main className="page prose">
      <h1>How FindMyDate works</h1>
      <h2>1. You tell us who you are</h2>
      <p>Twelve short steps: the basics, who you'd like to meet, what you want, your daily life, your interests, personality, values, how you connect, your ideal first date, any deal-breakers, and a few words in your own voice.</p>
      <h2>2. We filter first</h2>
      <p>We never match anyone who falls outside your preferences. Gender, age range, city, children, and every deal-breaker you list are hard rules. If a pair breaks one, they are never considered, no matter how well they score otherwise.</p>
      <h2>3. We score real compatibility</h2>
      <p>Each remaining pair gets a score out of 100 from both sides, weighted like this:</p>
      <ul>
        <li><strong>Relationship goals and timeline (18%).</strong> Wanting the same thing matters most.</li>
        <li><strong>Values (20%).</strong> Children, faith and closeness with family.</li>
        <li><strong>Personality (15%).</strong> Social energy, spontaneity, adventure, ambition, and head versus heart.</li>
        <li><strong>Interests (15%).</strong> Shared things to talk about.</li>
        <li><strong>Lifestyle (10%).</strong> Food, drinking, smoking, rhythm and fitness.</li>
        <li><strong>Connection (8%).</strong> Love languages, conflict style, texting habits.</li>
        <li><strong>Logistics (9%).</strong> Free time, budget, travel and date style.</li>
        <li><strong>Age fit (5%).</strong> How well each person's age sits within the other's range.</li>
      </ul>
      <p>The final score combines both people's views so one-sided fits don't count. We then pair people across the whole pool to find the best overall set of matches, not just the best match for whoever applied first.</p>
      <h2>4. A human checks it</h2>
      <p>Our team reviews every suggested pair, reads both profiles, and approves only the ones that feel right.</p>
      <h2>5. We plan the date</h2>
      <p>We contact you both, agree a time and a comfortable public place, and share only your first name and interests until you've met.</p>
      <p><Link href="/apply" className="btn">Start my profile</Link></p>
    </main>
  );
}
