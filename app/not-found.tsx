import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24, background: "var(--bg-main)", color: "var(--ink)" }}>
      <div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 16 }}>
          Page not found
        </h1>
        <p style={{ marginBottom: 28, opacity: 0.7 }}>This page doesn&apos;t exist or was moved.</p>
        <Link href="/" className="btn">Back home</Link>
      </div>
    </main>
  );
}
