import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutate } from "@/lib/store";
import {
  ALL_FIELDS,
  GENDER_OPTIONS,
  CITIES,
  PUNE_NEIGHBOURHOODS,
  MUMBAI_NEIGHBOURHOODS,
  type Answers,
} from "@/lib/questions";

export const runtime = "nodejs";
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const FEM = ["Ananya", "Divya", "Meera", "Kavya", "Priya", "Nisha", "Sneha", "Ishita", "Pooja", "Rhea", "Tanvi", "Sanya"];
const MALE = ["Arjun", "Rohit", "Karthik", "Vikram", "Aditya", "Naveen", "Rahul", "Dev", "Siddharth", "Varun", "Kabir", "Aman"];
const LAST = ["Sharma", "Kulkarni", "Patil", "Deshmukh", "Joshi", "Mehta", "Iyer", "Nair", "Verma", "Kapoor"];

// Demo data only. Disabled in production.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  const made: Answers[] = [];
  for (let i = 0; i < 30; i++) {
    const gender = rnd(GENDER_OPTIONS.slice(0, 2)); // Male or Female
    const age = 22 + Math.floor(Math.random() * 12);
    const city = rnd(CITIES);
    const hoods = city === "Pune" ? PUNE_NEIGHBOURHOODS : MUMBAI_NEIGHBOURHOODS;
    const a: Answers = {};

    for (const f of ALL_FIELDS) {
      if (f.type === "select") a[f.id] = rnd(f.options || ["Option"]);
      else if (f.type === "scale") a[f.id] = 1 + Math.floor(Math.random() * 5);
      else if (f.type === "multi") a[f.id] = [rnd(hoods), rnd(hoods)].filter((v, idx, arr) => arr.indexOf(v) === idx);
      else if (f.type === "textarea") {
        if (f.minWords) {
          a[f.id] = "I value honesty, deep emotional intelligence, genuine laughter, kindness towards people, and someone passionate about what they do.";
        } else {
          a[f.id] = "Coffee enthusiast, loves weekend road trips, indie cinema, and lively board game nights.";
        }
      } else if (f.type === "consent") {
        a[f.id] = true;
      }
    }

    Object.assign(a, {
      name: `${rnd(gender === "Female" ? FEM : MALE)} ${rnd(LAST)}`,
      age,
      gender,
      city,
      neighbourhood: [rnd(hoods)],
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      instagram: `@${gender.toLowerCase()}_${rnd(LAST).toLowerCase()}_${i}`,
      interestedIn: gender === "Female" ? "Male" : "Female",
      ageRange: `${Math.max(18, age - 3)}-${age + 4}`,
      occupation: rnd(["Software Engineer", "Product Designer", "Architect", "Consultant", "Doctor", "Founder", "Marketer"]),
      interests: "Reading, specialty coffee, long drives, live gigs, badminton, cinema",
      socialVibe: 1 + Math.floor(Math.random() * 5),
      smoke: rnd(["Yes", "No"]),
      drink: rnd(["Yes", "No", "Occasionally"]),
      friendsVibe: "Warm, witty, dependable and always up for spontaneous plans.",
      personQuality: "Looking for an emotionally mature person with warmth, ambition, curiosity, kindness, and someone who appreciates meaningful conversations.",
      dealbreaker: "Disrespect towards others, dishonesty, extreme rigidity, lack of communication, and someone who refuses to empathize.",
      interDiversity: rnd(["Yes", "Maybe", "Other"]),
      agree_blind_date: true,
      agree_over_18: true,
      agree_fee: true,
      agree_respect: true,
      agree_refunds: true,
      agree_privacy: true,
    });

    made.push(a);
  }

  try {
    await mutate((db) => {
      for (const a of made) {
        db.participants.push({
          id: randomUUID(),
          createdAt: new Date(Date.now() - Math.random() * 6 * 864e5).toISOString(),
          answers: a,
        });
      }
    });

    return NextResponse.json({ added: made.length });
  } catch (err: any) {
    console.error("[admin] Seed error:", err);
    return NextResponse.json({ error: err?.message || "Failed to seed demo data" }, { status: 500 });
  }
}
