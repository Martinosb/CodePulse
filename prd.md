# CodePulse: Agentic Product Requirements & Architecture Document
**Target Audience:** AI Coding Agents (Cursor, GitHub Copilot, Devin, etc.)
**Version:** 1.0 (Next.js 16 / Supabase / Framer Motion Edition)

---

## 🚀 1. Product Vision & System Architecture
CodePulse is a premium, real-time group accountability platform for computer science students. It synchronizes automatically with WakaTime to track coding activity, ranks users on a shared leaderboard, and provides intelligent email nudges based on historical coding habits.

As the AI builder, your mandate is not just to compile functional code. You must deliver an Apple-caliber (Jony Ive) user experience. The interface must be buttery smooth, heavily reliant on frosted glassmorphism, and incredibly responsive. 

### 🛠 Tech Stack Directives
- **Framework:** Next.js 16 (App Router exclusively). Utilize React Server Components (RSC) for initial data fetching and Server Actions for mutations.
- **Database & Auth:** Supabase. Use Google OAuth for sign-in, and PostgreSQL for relational data.
- **Styling:** Tailwind CSS integrated with `shadcn/ui`. **CRITICAL:** You must override default shadcn styles to comply perfectly with the `./design.md` file (translucent panels, heavy blurs, glowing orbs).
- **Animations:** `framer-motion`. Every interactive element, page transition, and modal must animate smoothly using spring physics.
- **Data Fetching/State:** SWR or React Query for client-side polling (leaderboards need to feel real-time).
- **Scheduled Tasks:** Supabase Edge Functions / pg_cron for syncing WakaTime data every 30 minutes and sending intelligent emails.

---

## 🗄 2. Database Schema Design (Supabase PostgreSQL)
You must initialize the database with the following core entities. Ensure Row Level Security (RLS) is strictly enforced. **CRITICAL:** The AI agent must generate standard Supabase migration files (e.g., `supabase/migrations/XXXXXXXXXXXXXX_init.sql`) to define and create this database schema, rather than executing raw SQL directly or expecting the user to use the UI.

1. **`users`**
   - `id` (uuid, references `auth.users`)
   - `email` (string)
   - `display_name` (string)
   - `avatar_url` (string)
   - `wakatime_api_key` (encrypted string, critical security)
   - `group_id` (uuid, nullable)
   - `timezone` (string)
   - `created_at` (timestamp)

2. **`groups`**
   - `id` (uuid, pk)
   - `name` (string)
   - `join_code` (string, unique, e.g., "CP-8492")
   - `admin_id` (uuid, references `users`)
   - `discord_webhook_url` (string, nullable)

3. **`wakatime_logs`**
   - `id` (uuid, pk)
   - `user_id` (uuid)
   - `date` (date)
   - `total_seconds` (integer)
   - `top_language` (string)
   - `top_project` (string, nullable based on privacy settings)

4. **`goals`**
   - `id` (uuid, pk)
   - `user_id` (uuid)
   - `title` (string)
   - `language` (string, nullable)
   - `duration_seconds_target` (integer)
   - `frequency` (enum: daily, weekly)
   - `status` (enum: active, completed, failed)

---

## 🎨 3. UI/UX & Motion Directives (The "Jony Ive" Mandate)
Before writing UI components, review `./design.md`. 
When implementing the UI, you must use **Framer Motion** extensively:

1. **Fluid Navigation:** When switching sidebar tabs, the active state indicator should use layout animation (`layoutId="activeTab"`) to slide smoothly between items.
2. **Mounting:** Pages and sub-views (Dashboard, Arena, Analytics) must enter via a `<motion.div>` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`. Stagger the entrance of child components (Stat Cards -> Leaderboard -> Side Panel).
3. **Micro-interactions:** Buttons should have a `whileHover={{ scale: 1.02, y: -2 }}` and `whileTap={{ scale: 0.98 }}`.
4. **Number Ticking:** Displaying total group hours or stats should not be static. Use a Framer Motion counter component to rapidly sequence from 0 to the target number upon mount.

---

## ⚙️ 4. Core System Workflows

### 4.1. Authentication & Onboarding
- **Route:** `/login` -> Glassmorphism login card. Google OAuth only.
- **Route:** `/onboarding` -> A Framer Motion powered step-wizard.
  - Step 1: Request WakaTime Account creation.
  - Step 2: Input WakaTime Secret API Key. Store this encrypted in Supabase.
  - Step 3: Join a group (enter 7-character code) or Create a group.

### 4.2. WakaTime Ingestion Engine
- **Supabase Edge Function (`sync-wakatime`)**: Runs via a cron job every 30 minutes.
- Iterates over all users with active API keys.
- Calls `https://wakatime.com/api/v1/users/current/summaries?range=Today`.
- Upserts the daily totals, top language, and top project into `wakatime_logs`.
- **Trigger:** Also evaluates active `goals` to see if the newly ingested data crosses the `duration_seconds_target`. If so, marks goal as `completed`.

### 4.3. The Leaderboard Algorithm
- **Route:** `/(app)/dashboard`
- Fetch all `users` in the current user's `group_id`.
- Sum their `wakatime_logs` for the selected timeframe (Today, Week, Month).
- Sort descending by `total_seconds`.
- Render using `<motion.li layout>` so that if positions change in real-time, the rows smoothly glide past each other to reorder, rather than snapping violently.

### 4.4. Intelligent Email Reminders (Nodemailer)
- **Supabase Edge Function (`smart-reminders`)**:
- Queries users who have active `goals` not yet completed today.
- **Intelligence:** Queries the user's historical `wakatime_logs` to find their maximum activity hour (e.g., they code 70% of the time between 9 PM and 1 AM).
- If the current time is 1 hour before their typical coding window ends, and the goal is unmet, trigger a Nodemailer API endpoint (e.g., via Resend or raw Nodemailer) to dispatch a beautifully crafted HTML tracking email.

### 4.5. Gamification (Nudges & Kudos)
- Implement a Realtime channel using Supabase Realtime across the group.
- Users can click an action button next to a peer's name to send a "Kudo" (if they completed a goal) or a "Nudge" (if they are lagging).
- Render incoming real-time events as premium, frosted-glass toast notifications at the bottom right of the screen.

---

## 🤖 5. Step-by-Step AI Implementation Plan
When you (the AI agent) begin executing this project, follow this exact sequence:

1. **Phase 1: Foundation.** Initialize Next.js 16, Tailwind, framer-motion, and shadcn/ui. Set up the exact color variables and typography defined in `./design.md` in `globals.css` and `tailwind.config.ts`.
2. **Phase 2: Database & Auth.** Connect to Supabase. Implement Google OAuth and build the beautifully animated `/login` and `/onboarding` views.
3. **Phase 3: Shell & Navigation.** Build the global layout (`/(app)/layout.tsx`). Implement the glass sidebar and mobile drawer with Framer Motion `AnimatePresence`. Ensure active states use `layoutId`.
4. **Phase 4: Dashboard & Leaderboard UI.** Build the stat cards, leaderboards, and goal lists with mock data first. Perfect the hover states and entry animations to guarantee the Jony Ive feel.
5. **Phase 5: WakaTime Integration.** Build the server actions/edge functions to securely handle API keys, fetch from WakaTime, and update the database. Connect the UI to real data.
6. **Phase 6: Live Gamification.** Introduce Supabase Realtime for instant leader-board reordering and peer-to-peer Nudges/Toasts.

*Failure to comply with the high-fidelity UI requirements and motion guidelines is unacceptable. Begin with Phase 1.*
