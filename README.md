# CodePulse

CodePulse is a premium group coding-accountability platform designed for computer science students and developer teams. Connect your WakaTime account, track real coding metrics, challenge peers in a shared global Arena, manage personal goals, and earn streaks and badges for consistent coding habits.

Built with a gorgeous, high-end warm-cream editorial design aesthetic inspired by [DESIGN.md](DESIGN.md).

## 🚀 Features

- **Personal Goals Tracker**: Create daily or weekly targets (e.g., "Code 2 hours of Rust weekly") and track progress automatically via WakaTime.
- **Shared Group Leaderboard**: Track daily/weekly/monthly coding duration, top languages, and top active projects among group mates.
- **Realtime Nudges & Kudos**: Send quick accountability nudges or congratulatory kudos to teammates with realtime notifications.
- **The Arena**: Opt-in global leaderboards where groups compete against other groups based on aggregated weekly coding time.
- **Interactive Analytics**: View a GitHub-style coding heatmap, timezone-aware productivity-by-hour charts, and earned badges.
- **Smart Accountability Reminders**: Email reminders triggered prior to your peak daily coding hour if goals are not yet met.

---

## 🛠️ Stack & Technologies

- **Frontend**: Next.js 15.1.3 (App Router), React 19, TypeScript (Strict).
- **Styling & Animations**: Tailwind CSS 3.4 (custom light/dark token system), Framer Motion 11.
- **Database & Realtime**: Supabase (@supabase/ssr ^0.10.3 and @supabase/supabase-js ^2.106.2).
- **Automation / Backend**: Supabase Edge Functions (Deno), `pg_cron` & `pg_net` database extensions.

---

## 📋 Getting Started

### 1. Prerequisites
Ensure you have `Node.js` (v18+ recommended) and `npm` installed.

### 2. Configure Local Environment
Copy the example environment file and fill in the missing keys:
```bash
cp .env.example .env.local
```

Ensure `.env.local` contains the following:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gtbmqetpqjjqfcwfwvie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mMBbvrweaGuz3p5Z0JHztw_s4sghRMn
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only secrets
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
CRON_SECRET=pulse_cron_secret_2026_x92y
WAKATIME_ENC_KEY=yLhXfDh10XeQaWytW3ExNkHdZvKcT3HfntCvPmtZmYg=
```

> [!IMPORTANT]
> The `WAKATIME_ENC_KEY` is a 32-byte Base64 key used to encrypt user API keys. It must be identical in your local environment and in your Supabase Edge Function secrets.

### 3. Install & Run Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚡ Supabase Deployments & Edge Functions

The application runs on a live Supabase project `gtbmqetpqjjqfcwfwvie` (WORKHORSE).

### Edge Functions
Two Deno edge functions are located in `supabase/functions/`:
1. **`sync-wakatime`**: Syncs active users' summaries from the WakaTime API, calculates hourly coding habits, recomputes streaks, and updates goals.
2. **`smart-reminders`**: Checks for users with active daily goals who are approaching their historical peak coding hour, and notifies them via Resend.

To configure secrets for the remote Edge functions, run:
```bash
supabase secrets set --project-ref gtbmqetpqjjqfcwfwvie \
  WAKATIME_ENC_KEY=yLhXfDh10XeQaWytW3ExNkHdZvKcT3HfntCvPmtZmYg= \
  CRON_SECRET=pulse_cron_secret_2026_x92y \
  RESEND_API_KEY=your_resend_api_key \
  RESEND_FROM="CodePulse <pulse@yourdomain.com>"
```

Deploy the functions via:
```bash
supabase functions deploy sync-wakatime --project-ref gtbmqetpqjjqfcwfwvie --no-verify-jwt
supabase functions deploy smart-reminders --project-ref gtbmqetpqjjqfcwfwvie --no-verify-jwt
```

### Automation & Database Cron Jobs
Cron automation is scheduled directly in the PostgreSQL database using `pg_cron` and `pg_net` (see `supabase/migrations/20260530120500_cron_jobs.sql`). The synchronization and reminder tasks run automatically every 30 minutes.

---

## 🎨 Design System

We adhere strictly to [DESIGN.md](DESIGN.md)'s Cursor-inspired cream-editorial aesthetic:
- **Canvas Colors**: Light Canvas `#f7f7f4`, Warm Ink text `#26251e`, and Accent Voltage Orange `#f54e00`.
- **Borders & Shadows**: Hairline borders (`border border-hairline`), strict flat UI design with no deep drop shadows.
- **Micro-Interactions**: Framer motion transitions, active layout animations, staggered mounts, and numeric counts ticking.
