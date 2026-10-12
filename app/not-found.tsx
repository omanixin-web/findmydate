import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div><h1 style={{ fontSize: "3rem" }}>Page not found</h1><p style={{ margin: "12px 0 24px", opacity: 0.8 }}>This page doesn't exist.</p><Link href="/" className="btn">Back home</Link></div>
    </main>
  );
}
