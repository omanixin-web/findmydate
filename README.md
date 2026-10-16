# FindMyDate: matchmaking site (Next.js 15, App Router, TypeScript)

Applicants fill a 12-step profile. A matching algorithm pairs them. Your team reviews pairs in a private admin portal and arranges the dates.

## Run it
    npm install
    cp .env.example .env.local     # then edit every value
    npm run dev                    # http://localhost:3000
    npm run build && npm start

## Admin portal
- The login page exists ONLY at the secret URL in `ADMIN_LOGIN_PATH` (e.g. http://localhost:3000/portal-your-secret). `/admin` and `/admin-login` return 404 to anyone not signed in.
- Set `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `SESSION_SECRET` (`openssl rand -hex 32`). In production the portal stays locked if these are missing.
- Sessions are signed, httpOnly, sameSite=strict cookies lasting 8 hours. Login is limited to 5 attempts per 15 minutes per IP.
- Without a `.env.local`, dev mode uses `/portal-dev`, user `admin`, password `findmydate-dev`. This never applies in production.
- Dashboard: submissions, last 7 days, gender, cities, intent, match status, average score. Participants: search, full answers, best candidates. Matches: review, approve, decline, schedule, CSV export.

## Matching (lib/matching.ts)
1. Hard filters: gender preferences both ways, age ranges both ways, city (or both happy to travel), children conflicts, every deal-breaker.
2. Weighted score from both sides, combined by geometric mean: goals 18%, values 20%, personality 15%, interests 15%, lifestyle 10%, connection 8%, logistics 9%, age fit 5%.
3. Global pairing: greedy by score, then 2-opt swaps until no re-pairing improves the total. Minimum score is 60.
Running matching only rebuilds "suggested" pairs. Approved or arranged pairs stay locked, and declined pairs are never suggested again.

## Database & Production Setup (Supabase)
The app is configured to store all participant submissions and matches in **Supabase** for zero-disk serverless persistence on Vercel or any cloud host.

1. **Create your Supabase tables:**
   - Go to your Supabase Project -> **SQL Editor**.
   - Copy the contents of [`supabase-schema.sql`](file:///d:/Web%20Development/findmydate/supabase-schema.sql) and click **Run**.
2. **Add Environment Variables:**
   - In `.env.local` (local development) and your **Vercel Project Settings -> Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (`https://<project-ref>.supabase.co`)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public `anon` key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret `service_role` key (recommended for server routes)
     - `ADMIN_LOGIN_PATH`: Secret path for admin login (e.g. `/sanchit`)
     - `ADMIN_USERNAME`: Admin login username
     - `ADMIN_PASSWORD`: Admin login password
     - `SESSION_SECRET`: 32-byte secret (`openssl rand -hex 32`)

When Supabase environment variables are provided, the system automatically uses Supabase for storing applications and managing matches without any file writes, ensuring 100% compatibility with Vercel serverless deployments. If running locally without Supabase variables, it automatically falls back to `./data/db.json`.

## Before you launch
- Rate limits are in memory, so they reset on restart and aren't shared across instances. Use Redis or Upstash if you scale out.
- The Privacy and Terms pages are templates. Get them reviewed by a lawyer, and review India's DPDP Act obligations, since you hold sensitive personal data.
- Add automated email or WhatsApp notifications if you want them (not included).
