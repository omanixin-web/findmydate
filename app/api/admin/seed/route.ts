import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutate } from "@/lib/store";
import { ALL_FIELDS, GENDER, type Answers } from "@/lib/questions";

export const runtime = "nodejs";
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const FEM = ["Ananya", "Divya", "Meera", "Kavya", "Priya", "Nisha", "Sneha", "Ishita", "Lakshmi", "Aarthi", "Pooja", "Harini"];
const MALE = ["Arjun", "Rohit", "Karthik", "Vikram", "Aditya", "Naveen", "Sanjay", "Rahul", "Dev", "Manoj", "Siddharth", "Varun"];
const LAST = ["Iyer", "Nair", "Reddy", "Menon", "Kumar", "Sharma", "Pillai", "Rao"];

// Demo data only. Disabled in production.
export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  const made: Answers[] = [];
  for (let i = 0; i < 30; i++) {
    const gender = rnd(GENDER.slice(0, 2));
    const age = 23 + Math.floor(Math.random() * 13);
    const a: Answers = {};
    for (const f of ALL_FIELDS) {
      if (f.type === "select") a[f.id] = rnd(f.options!);
      else if (f.type === "scale") a[f.id] = 1 + Math.floor(Math.random() * 5);
      else if (f.type === "multi") a[f.id] = [...f.options!].sort(() => Math.random() - 0.5).slice(0, f.id === "dealbreakers" ? Math.floor(Math.random() * 2) : Math.min(f.maxSelect ?? 4, 2 + Math.floor(Math.random() * 3)));
      else if (f.type === "textarea") a[f.id] = "Curious, kind and always up for a good conversation over filter coffee.";
    }
    Object.assign(a, {
      name: `${rnd(gender === "Woman" ? FEM : MALE)} ${rnd(LAST)}`, age, gender,
      city: Math.random() < 0.8 ? "Chennai" : "Bengaluru",
      email: `demo${Date.now()}${i}@example.com`, instagram: `demo_user_${i}`, phone: "+91 90000 00000",
      interestedIn: [gender === "Woman" ? "Men" : "Women"], ageMin: Math.max(18, age - 5), ageMax: age + 6, consent: true,
    });
    if (Math.random() < 0.6) a.availability = ["Saturday evening", "Sunday daytime"];
    made.push(a);
  }
  await mutate((db) => { for (const a of made) db.participants.push({ id: randomUUID(), createdAt: new Date(Date.now() - Math.random() * 6 * 864e5).toISOString(), answers: a }); });
  return NextResponse.json({ added: made.length });
}
