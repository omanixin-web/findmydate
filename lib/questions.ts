export type Answer = string | string[] | number | boolean;
export type Answers = Record<string, Answer>;

export type Field = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "handle" | "select" | "multi" | "scale" | "textarea" | "consent";
  options?: string[];
  min?: number;
  max?: number;
  maxSelect?: number;
  optional?: boolean;
  placeholder?: string;
  help?: string;
  lo?: string;
  hi?: string;
  maxLen?: number;
  minWords?: number;
};

export type Step = {
  id: string;
  title: string;
  blurb: string;
  fields: Field[];
};

export const CITIES = ["Mumbai", "Pune"];
export const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say", "Other"];

// Jumbled sequence as requested: (Shivajinagar, Kothrud, Hadapsar, Camp, Hinjewadi, Viman nagar, Baner, PCMC, Balewadi, Other)
export const PUNE_NEIGHBOURHOODS = [
  "Kothrud",
  "Hinjewadi",
  "Baner",
  "Shivajinagar",
  "Viman nagar",
  "Balewadi",
  "Hadapsar",
  "PCMC",
  "Camp",
  "Other",
];

export const MUMBAI_NEIGHBOURHOODS = [
  "Bandra",
  "Andheri",
  "South Mumbai",
  "Powai",
  "Juhu",
  "Dadar",
  "Thane",
  "Navi Mumbai",
  "Borivali",
  "Other",
];

export const CONNECT_OPTIONS = ["Male", "Female", "Other"];
export const DATE_DAYS = ["Weekend", "Weekday", "Both"];
export const DATE_TIMES = ["Afternoon", "Evening", "Night", "Any works"];
export const DATE_TYPES = ["Coffee date", "Dinner date", "Arcade date", "Sunset date"];
export const SPENDING_VIBES = ["0", "0-500", "500-1500", "1500-2000", "2000+"];
export const SMOKE_OPTIONS = ["Yes", "No"];
export const DRINK_OPTIONS = ["Yes", "No", "Occasionally"];
export const INTER_DIVERSITY = ["Yes", "No", "Maybe", "Other"];

export const AGREEMENT_ITEMS: { id: string; label: string }[] = [
  { id: "agree_blind_date", label: "I understand this is a blind date" },
  { id: "agree_over_18", label: "I'm over 18 and legally allowed to date." },
  { id: "agree_fee", label: "I agree to pay ₹499 (female)/ ₹999 (male) to book the experience when matched. Express date charges extra." },
  { id: "agree_respect", label: "I'll be respectful and open-minded on the date." },
  { id: "agree_refunds", label: "I understand that refunds are not guaranteed." },
  { id: "agree_privacy", label: "I confirm that I am 18+ and I have read and agree to the Privacy Policy and consent to the collection and use of my personal information as described." },
];

/** Accepts "@name", "name" or a pasted instagram.com link; returns the bare lowercase username. */
export const normHandle = (v: unknown) =>
  String(v ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?].*$/, "")
    .replace(/^@/, "")
    .toLowerCase();

export function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

const sel = (id: string, label: string, options: string[], x: Partial<Field> = {}): Field => ({
  id,
  label,
  type: "select",
  options,
  ...x,
});

const multi = (id: string, label: string, options: string[], x: Partial<Field> = {}): Field => ({
  id,
  label,
  type: "multi",
  options,
  ...x,
});

export const STEPS: Step[] = [
  {
    id: "basic_details",
    title: "Basic Details",
    blurb: "Let's start with who you are and where you're based.",
    fields: [
      sel("city", "1. Choose your city", CITIES),
      { id: "name", label: "2. Full name?", type: "text", placeholder: "Your answer", maxLen: 70 },
      { id: "age", label: "3. How old are you?", type: "number", placeholder: "Enter number", min: 18, max: 99 },
      sel("gender", "4. How do you identify your gender?", GENDER_OPTIONS),
      multi("neighbourhood", "5. Which neighbourhood do you live in?", PUNE_NEIGHBOURHOODS, {
        help: "Select all that apply around where you live or spend time.",
      }),
      { id: "phone", label: "6. Whatsapp Number", type: "tel", placeholder: "Enter Number" },
      {
        id: "instagram",
        label: "7. Drop your Instagram handle 👇🏼",
        type: "handle",
        placeholder: "Your answer",
        help: "Must start with @ and be 4+ characters (e.g. @yourhandle).",
      },
    ],
  },
  {
    id: "dating_preferences",
    title: "Dating Preferences",
    blurb: "Tell us who you're excited to meet and how your ideal dates look.",
    fields: [
      sel("interestedIn", "8. Who would you like to connect with?", CONNECT_OPTIONS),
      { id: "ageRange", label: "9. Suggest age range for your match", type: "text", placeholder: "Your answer (e.g. 23-27)" },
      sel("dateDays", "10. Which days work best for a date?", DATE_DAYS),
      sel("dateTime", "11. What time do you prefer for a date?", DATE_TIMES),
      sel("dateType", "12. Which kind of date you enjoy most?", DATE_TYPES),
      sel("dateSpend", "13. What's the spending vibe for your date?", SPENDING_VIBES),
    ],
  },
  {
    id: "personality_lifestyle",
    title: "Personality and Lifestyle",
    blurb: "A glimpse into your daily rhythm, hobbies and social energy.",
    fields: [
      { id: "occupation", label: "14. Whats your current occupation", type: "text", placeholder: "Your answer" },
      { id: "interests", label: "15. Give us a few of your interests or hobbies", type: "textarea", placeholder: "Your answer", maxLen: 500 },
      {
        id: "socialVibe",
        label: "16. What's your social vibe?",
        type: "scale",
        lo: "1 - Introvert",
        hi: "5 - Extrovert",
      },
      sel("smoke", "17. Do you smoke?", SMOKE_OPTIONS),
      sel("drink", "18. Do you drink alcohol?", DRINK_OPTIONS),
    ],
  },
  {
    id: "compatibility_insights",
    title: "Compatibility Insights",
    blurb: "The deeper things that make or break real chemistry.",
    fields: [
      { id: "friendsVibe", label: "19. What's your vibe according to your friends?", type: "textarea", placeholder: "Your answer", maxLen: 500 },
      {
        id: "personQuality",
        label: "20. What quality are you looking for in your person?",
        type: "textarea",
        placeholder: "Your answer (at least 10 words)",
        minWords: 10,
        maxLen: 800,
      },
      {
        id: "dealbreaker",
        label: "21. Whats a dealbreaker or red flag for you?",
        type: "textarea",
        placeholder: "Your answer (at least 10 words)",
        minWords: 10,
        maxLen: 800,
      },
      sel("interDiversity", "22. Would you date someone from other cast,religion or language?", INTER_DIVERSITY),
    ],
  },
  {
    id: "agreement",
    title: "Please confirm your understanding and agreement",
    blurb: "Please review and accept our guidelines before we find your match.",
    fields: AGREEMENT_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      type: "consent" as const,
    })),
  },
];

export const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

export function checkField(f: Field, v: unknown): string | null {
  const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
  if (empty) return f.optional ? null : "This field is required.";

  switch (f.type) {
    case "text":
    case "textarea": {
      if (typeof v !== "string") return "Please enter valid text.";
      const trimmed = v.trim();
      if (f.minWords && countWords(trimmed) < f.minWords) {
        const curWords = countWords(trimmed);
        return `Please write at least ${f.minWords} words (currently ${curWords} word${curWords === 1 ? "" : "s"}).`;
      }
      if (f.maxLen && trimmed.length > f.maxLen) {
        return `Keep it under ${f.maxLen} characters.`;
      }
      return null;
    }
    case "handle": {
      if (typeof v !== "string") return "Enter your Instagram handle.";
      const trimmed = v.trim();
      if (!trimmed.startsWith("@")) {
        return "Instagram handle must start with @";
      }
      if (trimmed.length < 4) {
        return "Instagram handle must be at least 4 characters long (e.g. @name).";
      }
      return null;
    }
    case "tel": {
      if (typeof v !== "string") return "Enter a valid phone number.";
      const cleaned = v.trim().replace(/[\s\-()]/g, "");
      return /^\+?[0-9]{7,15}$/.test(cleaned) ? null : "Enter a valid WhatsApp phone number.";
    }
    case "number": {
      const x = Number(v);
      return Number.isInteger(x) && x >= (f.min ?? 0) && x <= (f.max ?? 120)
        ? null
        : `Enter a number between ${f.min ?? 0} and ${f.max ?? 120}.`;
    }
    case "select": {
      return typeof v === "string" && f.options?.includes(v) ? null : "Please select an option.";
    }
    case "multi": {
      return Array.isArray(v) && v.length > 0 ? null : "Please select at least one option.";
    }
    case "scale": {
      const x = Number(v);
      return Number.isInteger(x) && x >= 1 && x <= 5 ? null : "Pick a point on the scale.";
    }
    case "consent": {
      return v === true ? null : "Please confirm your agreement to continue.";
    }
    default:
      return null;
  }
}

export function validateStep(step: Step, a: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of step.fields) {
    const e = checkField(f, a[f.id]);
    if (e) errors[f.id] = e;
  }
  return errors;
}

export function validateAll(a: Answers) {
  const errors: Record<string, string> = {};
  for (const s of STEPS) {
    Object.assign(errors, validateStep(s, a));
  }

  const clean: Answers = {};
  for (const f of ALL_FIELDS) {
    const v = a[f.id];
    if (v === undefined || v === "" || errors[f.id]) continue;
    clean[f.id] =
      f.type === "number" || f.type === "scale"
        ? Number(v)
        : f.type === "handle"
        ? String(v).trim()
        : typeof v === "string"
        ? v.trim()
        : v;
  }
  return { errors, clean };
}
