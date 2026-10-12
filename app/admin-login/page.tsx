import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { adminPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Team sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AdminLogin() { return <main style={{ padding: 20 }}><LoginForm slug={adminPath()} /></main>; }
