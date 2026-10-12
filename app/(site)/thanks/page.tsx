import Link from "next/link";
export const metadata = { title: "You're in" };
export default function Thanks() {
  return (
    <main className="page prose" style={{ textAlign: "center" }}>
      <h1>Thank you. You're on our list.</h1>
      <p>Our team will review your profile and look for someone compatible. When we find a good fit, we'll contact you by email or WhatsApp to arrange your first date.</p>
      <p>Matching usually takes a few days. Some profiles take longer while we wait for the right person.</p>
      <p><Link href="/" className="btn">Back to home</Link></p>
    </main>
  );
}
