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
- Dashboard: submissions, last 7 days, gender, cities, intent, match status, average score. Participants: search, full answers, best candidates. Matches: review, approve, decline, schedule, CSV export. The dashboard has a dev-only button to add 30 demo people.

## Matching (lib/matching.ts)
1. Hard filters: gender preferences both ways, age ranges both ways, city (or both happy to travel), children conflicts, every deal-breaker.
2. Weighted score from both sides, combined by geometric mean: goals 18%, values 20%, personality 15%, interests 15%, lifestyle 10%, connection 8%, logistics 9%, age fit 5%.
3. Global pairing: greedy by score, then 2-opt swaps until no re-pairing improves the total. Minimum score is 60.
Running matching only rebuilds "suggested" pairs. Approved or arranged pairs stay locked, and declined pairs are never suggested again.

## Before you launch
- Storage is a JSON file at `DATA_DIR/db.json`. It needs a persistent disk (VPS, Render or Railway with a volume). It will NOT persist on Vercel. To use a database, replace `getDB`/`mutate` in `lib/store.ts`.
- Rate limits are in memory, so they reset on restart and aren't shared across instances. Use Redis or similar if you scale out.
- The Privacy and Terms pages are templates. Get them reviewed by a lawyer, and review India's DPDP Act obligations, since you hold sensitive personal data.
- Add automated email or WhatsApp notifications if you want them (not included).
