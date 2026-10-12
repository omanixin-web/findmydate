export const metadata = { title: "FAQ" };
const qa = [
  ["Is it free?", "Applying is free. We'll tell you clearly about any fees before you agree to a match."],
  ["How long does matching take?", "Usually a few days, though it can take longer when we're waiting for the right person to join."],
  ["Who sees my information?", "Only our small matchmaking team. Your match sees your first name and interests, and only after you both agree to meet."],
  ["What if I don't like my match?", "Tell us. You can decline without giving a reason, and we'll never suggest that pairing again."],
  ["Is the first date safe?", "We choose public, comfortable places and share plans with both of you in advance. Tell a friend where you're going."],
  ["Can I delete my data?", "Yes. Email us and we'll remove your profile and any matches linked to it."],
  ["Can I edit my answers later?", "Not yet. If something changes, contact us and we'll update it for you."],
];
export default function FAQ() {
  return (
    <main className="page prose">
      <h1>Frequently asked questions</h1>
      {qa.map(([q, a]) => <div key={q}><h2>{q}</h2><p>{a}</p></div>)}
    </main>
  );
}
