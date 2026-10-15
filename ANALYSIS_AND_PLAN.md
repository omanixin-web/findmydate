# FindMyDate Project Analysis & Implementation Plan

## 1. Executive Summary & Project Analysis

FindMyDate is a Next.js (App Router) matchmaking and blind date web platform with TypeScript.
The current application consists of:
- **Public Site** (`app/(site)`): Landing page, About, FAQ, How it Works, Privacy, Terms, and the Application Form (`/apply`).
- **Application Flow** (`components/ApplyForm.tsx` & `lib/questions.ts`): Multi-step form with local storage draft persistence, validation, and submission to `/api/apply`.
- **Matchmaking Engine** (`lib/matching.ts`): Two-stage matching pipeline:
  1. Hard filters (gender compatibility, age range, city match, dealbreakers, children preference).
  2. Multi-factor weighted compatibility scoring (intent, values, personality, interests, lifestyle, connection, logistics, age fit).
- **Admin Portal** (`app/admin`): Private review portal for participants, automated match generation, and date scheduling.
- **Data Store** (`lib/store.ts`): File-backed atomic JSON store (`data/db.json`).

---

## 2. Identified Changes & Requirements

### A. Branding & Visual Theme
1. **Logo Integration**:
   - Integrate the uploaded watercolor seal logo (`findmydate.in`) into the site navigation, header, and application form header.
   - Stored in `public/logo.png`.
2. **Off-White Theme Transformation**:
   - Replace the dark plum/night color scheme (`#2a0f24`) with an elegant, warm off-white palette (`#fcf9f6`, `#ffffff`, `#f5ede7`) accented with dusty rose (`#d64567`), romantic blush (`#faeaed`), and warm gold (`#c98836`).
   - Clean, high-contrast typography, refined form chips, card layouts, and polished micro-interactions.

---

### B. Form Restructuring & New Question Schema

The application form will be organized into **4 primary sections** plus a **confirmation & agreement step** (derived from user reference Image 1):

#### Section 1: Basic Details (Questions 1–7)
1. **Choose your city**: Mumbai, Pune (Options: `["Mumbai", "Pune"]`).
2. **Full name?**: Text box with placeholder `Your answer`.
3. **How old are you?**: Number input with placeholder `Enter number` (min 18).
4. **How do you identify your gender?**: Options `["Male", "Female", "Prefer not to say", "Other"]`.
5. **Which neighbourhood do you live in?**: Checkbox multi-select.
   - For Pune (Jumbled sequence): `["Kothrud", "Hinjewadi", "Baner", "Shivajinagar", "Viman nagar", "Balewadi", "Hadapsar", "PCMC", "Camp", "Other"]`.
   - For Mumbai: `["Bandra", "Andheri", "South Mumbai", "Powai", "Juhu", "Dadar", "Thane", "Navi Mumbai", "Borivali", "Other"]`.
   - Dynamically updates based on selected city.
6. **Whatsapp Number**: Tel/number input with placeholder `Enter Number`.
7. **Drop your Instagram handle 👇🏼**: Text box with placeholder `Your answer`.
   - Validation: Must start with `@` and have at least 4 characters.

#### Section 2: Dating Preferences (Questions 8–13)
8. **Who would you like to connect with?**: Options `["Male", "Female", "Other"]`.
9. **Suggest age range for your match**: Text box with placeholder `Your answer` (e.g., "24-28").
10. **Which days work best for a date?**: Options `["Weekend", "Weekday", "Both"]`.
11. **What time do you prefer for a date?**: Options `["Afternoon", "Evening", "Night", "Any works"]`.
12. **Which kind of date you enjoy most?**: Options `["Coffee date", "Dinner date", "Arcade date", "Sunset date"]`.
13. **What's the spending vibe for your date?**: Options `["0", "0-500", "500-1500", "1500-2000", "2000+"]`.

#### Section 3: Personality and Lifestyle (Questions 14–18)
14. **Whats your current occupation**: Text box with placeholder `Your answer`.
15. **Give us a few of your interests or hobbies**: Textarea with placeholder `Your answer`.
16. **What's your social vibe?**: 1 to 5 scale (1: Introvert, 5: Extrovert).
17. **Do you smoke?**: Options `["Yes", "No"]`.
18. **Do you drink alcohol?**: Options `["Yes", "No", "Occasionally"]`.

#### Section 4: Compatibility Insights (Questions 19–22)
19. **What's your vibe according to your friends?**: Text box/textarea with placeholder `Your answer`.
20. **What quality are you looking for in your person?**: Textarea with placeholder `Your answer (at least 10 words)`.
    - Validation: Minimum 10 words required, with live word count indicator.
21. **Whats a dealbreaker or red flag for you?**: Textarea with placeholder `Your answer (at least 10 words)`.
    - Validation: Minimum 10 words required, with live word count indicator.
22. **Would you date someone from other cast,religion or language?**: Options `["Yes", "No", "Maybe", "Other"]`.

#### Section 5: Understanding & Agreement (Image 1 Terms)
Confirmations (all checkboxes required):
- [x] I understand this is a blind date
- [x] I'm over 18 and legally allowed to date.
- [x] I agree to pay ₹499 (female)/ ₹999 (male) to book the experience when matched. Express date charges extra.
- [x] I'll be respectful and open-minded on the date.
- [x] I understand that refunds are not guaranteed.
- [x] I confirm that I am 18+ and I have read and agree to the Privacy Policy and consent to the collection and use of my personal information as described.

---

## 3. Implementation Steps

1. **Update `lib/questions.ts`**:
   - Define fields, steps, options, and custom validation (Instagram `@` check, word count >= 10, age range parsing, agreements).
2. **Update `components/ApplyForm.tsx`**:
   - Support dynamic city-dependent neighbourhoods (Pune jumbled sequence, Mumbai sequence).
   - Live word count counter for 10-word minimum questions.
   - Clean checkbox list for the agreement items.
3. **Update `app/globals.css`**:
   - Modern, aesthetic off-white design system with warm rosy accents, soft cards, elegant typography, and responsive form styling.
4. **Update `app/(site)/layout.tsx` & Home Page**:
   - Display the new logo in the navigation header.
5. **Update Matchmaking & API (`lib/matching.ts`, `app/api/apply/route.ts`)**:
   - Adapt matching logic to the new schema: city matching, gender & interest matching, neighbourhood proximity, age range parsing, date preferences, social vibe, smoking/drinking habits, and dealbreaker compatibility.
   - Adapt `api/apply` duplicate check to WhatsApp number/phone.
6. **Update Admin Views (`app/admin/...`)**:
   - Reflect new fields in participant lists and detail views.
7. **Verification & Build**:
   - Run type checks and verify the application builds without errors.
