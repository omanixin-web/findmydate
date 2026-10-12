import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { COOKIE, verifySession } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/Actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await verifySession((await cookies()).get(COOKIE)?.value))) notFound(); // defence in depth behind middleware
  return (
    <div className="adm">
      <aside>
        <p className="brand" style={{ marginBottom: 24 }}><span className="flame" aria-hidden="true" />FindMyDate</p>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/participants">Participants</Link>
        <Link href="/admin/matches">Matches</Link>
        <a href="/api/admin/export">Export CSV</a>
        <LogoutButton />
      </aside>
      <main>{children}</main>
    </div>
  );
}
