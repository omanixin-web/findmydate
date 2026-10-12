import type { Metadata } from "next";
import ApplyForm from "@/components/ApplyForm";
export const metadata: Metadata = { title: "Create your profile" };
export default function Apply() { return <main><ApplyForm /></main>; }
