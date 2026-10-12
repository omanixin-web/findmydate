export type Answer = string | string[] | number | boolean;
export type Answers = Record<string, Answer>;
export type Field = {
  id: string; label: string;
  type: "text" | "email" | "tel" | "number" | "handle" | "select" | "multi" | "scale" | "textarea" | "consent";
  options?: string[]; min?: number; max?: number; maxSelect?: number; optional?: boolean;
  placeholder?: string; help?: string; lo?: string; hi?: string; maxLen?: number;
};
export type Step = { id: string; title: string; blurb: string; fields: Field[] };

export const GENDER = ["Woman", "Man", "Non-binary"];
export const INTEREST_IN = ["Women", "Men", "Non-binary people"];
export const INTENT = ["Friendship first, then see", "Dating to see where it goes", "A serious, long-term relationship", "Marriage within a few years"];
export const TIMELINE = ["As soon as possible", "20 to 40 days", "No rush"];
export const DIET = ["Vegetarian", "Vegan", "Non-vegetarian", "Flexible"];
export const DRINK = ["Never", "Socially", "Often"];
export const SMOKE = ["Never", "Occasionally", "Regularly"];
export const RHYTHM = ["Early bird", "Somewhere in between", "Night owl"];
export const HOBBIES = ["Travel", "Music", "Movies & series", "Books", "Cooking", "Fitness", "Gaming", "Art & design", "Photography", "Trekking & outdoors", "Dancing", "Tech", "Pets", "Spirituality", "Sports", "Food hunting", "Volunteering", "Fashion"];
export const KIDS = ["Yes", "Open to it", "No"];
export const RELIGION = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Spiritual, not religious", "Not religious", "Other", "Prefer not to say"];
export const LOVE = ["Words of affirmation", "Quality time", "Thoughtful gifts", "Acts of service", "Physical affection"];
export const CONFLICT = ["Talk it out straight away", "Take space, then talk", "Write my thoughts down first", "I tend to avoid it"];
export const TEXTING = ["Constantly", "Daily", "A few times a week"];
export const DATE_IDEAS = ["Coffee", "Dinner", "A walk by the beach or park", "Museum or gallery", "Live music", "Board-game café", "Bookstore", "Street-food crawl"];
export const BUDGET = ["Casual", "Moderate", "Splurge"];
export const AVAIL = ["Weekday evenings", "Saturday daytime", "Saturday evening", "Sunday daytime", "Sunday evening"];
export const TRAVEL = ["Nearby only", "Anywhere in my city", "Happy to travel"];
export const DEALBREAKERS = ["Smokes", "Drinks heavily", "Doesn't want children", "Wants children", "Practises a different religion", "Eats non-vegetarian food"];

/** Accepts "@name", "name" or a pasted instagram.com link; returns the bare lowercase username. */
export const normHandle = (v: unknown) => String(v ?? "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").replace(/^@/, "").toLowerCase();

const sel = (id: string, label: string, options: string[], x: Partial<Field> = {}): Field => ({ id, label, type: "select", options, ...x });
const multi = (id: string, label: string, options: string[], x: Partial<Field> = {}): Field => ({ id, label, type: "multi", options, ...x });
const scale = (id: string, label: string, lo: string, hi: string): Field => ({ id, label, type: "scale", lo, hi });

export const STEPS: Step[] = [
  { id: "about", title: "About you", blurb: "The basics, so we can introduce you properly.", fields: [
    { id: "name", label: "Your full name", type: "text", maxLen: 60 },
    { id: "age", label: "Age", type: "number", min: 18, max: 70 },
    sel("gender", "I am a", GENDER),
    { id: "city", label: "City you live in", type: "text", placeholder: "Chennai", maxLen: 50 },
    { id: "email", label: "Email", type: "email", help: "Only our team sees your contact details." },
    { id: "phone", label: "Phone / WhatsApp", type: "tel", placeholder: "+91 98765 43210" },
    { id: "instagram", label: "Instagram username", type: "handle", placeholder: "your_username", help: "Only our team sees this." } ] },
  { id: "prefs", title: "Who you'd like to meet", blurb: "This is a hard filter. We will never match outside it.", fields: [
    multi("interestedIn", "I'd like to meet", INTEREST_IN),
    { id: "ageMin", label: "Youngest age", type: "number", min: 18, max: 70 },
    { id: "ageMax", label: "Oldest age", type: "number", min: 18, max: 80 } ] },
  { id: "intent", title: "What you're looking for", blurb: "Matching goals matters more than matching hobbies.", fields: [
    sel("intent", "The relationship I want", INTENT), sel("timeline", "How soon do you hope to find them?", TIMELINE) ] },
  { id: "life", title: "Everyday life", blurb: "Small habits decide whether two people feel at home together.", fields: [
    sel("diet", "Food", DIET), sel("drinking", "Drinking", DRINK), sel("smoking", "Smoking", SMOKE),
    sel("rhythm", "Daily rhythm", RHYTHM), scale("fitness", "How central is fitness to your life?", "Not a priority", "Central to my life") ] },
  { id: "love", title: "What you love", blurb: "Pick up to 8 things you genuinely enjoy.", fields: [
    multi("interests", "Interests", HOBBIES, { maxSelect: 8 }) ] },
  { id: "personality", title: "Your personality", blurb: "There are no right answers. Go with your gut.", fields: [
    scale("socialEnergy", "Social energy", "Quiet evenings", "Life of the party"),
    scale("planning", "Planning style", "I plan everything", "I go with the flow"),
    scale("adventure", "Weekends", "Homebody", "Adventurer"),
    scale("emotional", "Decisions", "Head over heart", "Heart over head"),
    scale("ambition", "Career", "Relaxed about it", "Driven") ] },
  { id: "values", title: "Values", blurb: "The big questions, answered honestly, save heartbreak later.", fields: [
    sel("kids", "Do you want children?", KIDS), sel("religion", "Faith or belief", RELIGION),
    scale("religionImportance", "How important is faith in your life?", "Not at all", "Very important"),
    scale("familyCloseness", "Closeness with family", "Independent", "Very close") ] },
  { id: "connection", title: "How you connect", blurb: "How you give and receive affection.", fields: [
    multi("loveLanguages", "Your love languages (up to 2)", LOVE, { maxSelect: 2 }),
    sel("conflict", "When there's a disagreement, I", CONFLICT), sel("texting", "Texting style", TEXTING) ] },
  { id: "date", title: "Your first date", blurb: "We'll plan it around you, so tell us what feels comfortable.", fields: [
    multi("dateIdeas", "Ideal first dates", DATE_IDEAS), sel("budget", "Budget style", BUDGET),
    multi("availability", "When are you usually free?", AVAIL), sel("travel", "How far will you travel?", TRAVEL) ] },
  { id: "dealbreakers", title: "Deal-breakers", blurb: "Optional. Anything you pick here is strictly respected.", fields: [
    multi("dealbreakers", "I'd rather not meet someone who…", DEALBREAKERS, { optional: true }) ] },
  { id: "words", title: "In your words", blurb: "Our team reads these when arranging dates.", fields: [
    { id: "bio", label: "Tell us about yourself", type: "textarea", maxLen: 600, placeholder: "What should your match know about you?" },
    { id: "idealSunday", label: "Your perfect Sunday", type: "textarea", maxLen: 400 },
    { id: "laughAt", label: "What makes you laugh?", type: "textarea", maxLen: 300, optional: true } ] },
  { id: "finish", title: "Almost there", blurb: "One last thing, and then we get to work.", fields: [
    sel("howHeard", "How did you hear about us?", ["Instagram", "A friend", "Search", "Other"], { optional: true }),
    { id: "consent", label: "I agree to the Terms and Privacy Policy, and I'm happy for FindMyDate to share my first name and interests with a match once we both agree to meet.", type: "consent" } ] },
];

export const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

function check(f: Field, v: unknown): string | null {
  const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
  if (empty) return f.optional ? null : "This one is required.";
  switch (f.type) {
    case "text": case "textarea": return typeof v === "string" && v.trim().length <= (f.maxLen ?? 80) ? null : `Keep it under ${f.maxLen ?? 80} characters.`;
    case "email": return typeof v === "string" && /^\S+@\S+\.\S+$/.test(v.trim()) && v.length <= 120 ? null : "Enter a valid email.";
    case "handle": return /^[a-z0-9._]{1,30}$/.test(normHandle(v)) ? null : "Enter a valid Instagram username (letters, numbers, . and _).";
    case "tel": return typeof v === "string" && /^[+()\d\s-]{7,18}$/.test(v.trim()) ? null : "Enter a valid phone number.";
    case "number": { const x = Number(v); return Number.isInteger(x) && x >= (f.min ?? 0) && x <= (f.max ?? 120) ? null : `Enter a number from ${f.min} to ${f.max}.`; }
    case "select": return typeof v === "string" && f.options!.includes(v) ? null : "Choose one option.";
    case "multi": return Array.isArray(v) && v.every((x) => f.options!.includes(String(x))) && v.length <= (f.maxSelect ?? 99) ? null : `Choose up to ${f.maxSelect ?? 99}.`;
    case "scale": { const x = Number(v); return Number.isInteger(x) && x >= 1 && x <= 5 ? null : "Pick a point on the scale."; }
    case "consent": return v === true ? null : "Please accept to continue.";
  }
}

export function validateStep(step: Step, a: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of step.fields) { const e = check(f, a[f.id]); if (e) errors[f.id] = e; }
  if (step.id === "prefs" && !errors.ageMin && !errors.ageMax && Number(a.ageMax) < Number(a.ageMin)) errors.ageMax = "Must be at least the youngest age.";
  return errors;
}

export function validateAll(a: Answers) {
  const errors: Record<string, string> = {};
  for (const s of STEPS) Object.assign(errors, validateStep(s, a));
  const clean: Answers = {};
  for (const f of ALL_FIELDS) {
    const v = a[f.id];
    if (v === undefined || v === "" || errors[f.id]) continue;
    clean[f.id] = f.type === "number" || f.type === "scale" ? Number(v) : f.type === "handle" ? normHandle(v) : typeof v === "string" ? v.trim() : v;
  }
  return { errors, clean };
}
