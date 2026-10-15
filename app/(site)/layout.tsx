import Link from "next/link";
import Image from "next/image";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <Image
            src="/logo.png"
            alt="findmydate.in logo"
            width={42}
            height={42}
            className="brand-logo-img"
            priority
          />
          <span>findmydate.in</span>
        </Link>
        <nav>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/apply" className="btn small">Find my match</Link>
        </nav>
      </header>
      {children}
      <footer>
        <p><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/faq">FAQ</Link></p>
        <p style={{ marginTop: 8 }}>© {new Date().getFullYear()} FindMyDate (findmydate.in). Made for people who'd rather meet well than swipe more.</p>
      </footer>
    </>
  );
}
