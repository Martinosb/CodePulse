# CodePulse — Build Handoff

> For the next AI agent continuing this build. Read this top-to-bottom before touching anything.
> The app is ~80% done. There is **one missing file that breaks the build** (fix it first), then
> edge functions + cron, then build verification.

---

## 0. TL;DR — do these in order

1. **Create `src/components/settings/settings-client.tsx`** — it's imported by
   `src/app/(app)/settings/page.tsx` but was never written (build fails without it).
   Full ready-to-paste code is in **Section 6** below.
2. **Get the Supabase service-role key** from the user and put it in `.env.local`
   as `SUPABASE_SERVICE_ROLE_KEY=` (without it, "Connect WakaTime" can't store the encrypted key).
3. **Write + deploy the two edge functions** (`sync-wakatime`, `smart-reminders`) — Section 7.
4. **Schedule cron** (Section 8).
5. **`npm run build`**, fix any stragglers, then `npm run dev` and smoke-test (Section 9).
6. Write a short `README.md` (Section 10).

---

## 1. What this app is

CodePulse — a group coding-accountability platform for CS students. Connect WakaTime → real coding
data → shared group leaderboard, self-checking goals, intelligent email reminders, streaks/badges,
nudges/kudos (realtime), a global "Arena", and a GitHub-style analytics heatmap.

**Source-of-truth docs in repo:** `prd.md` (detailed agentic PRD — authoritative), `CodePulse_PRD.md`
(high-level), `DESIGN.md` (the design system to use).

### Critical design decision (already made — keep it)
`prd.md` mentions "dark glassmorphism / glowing orbs", but that referenced an **older deleted**
`design.md`. The current **`DESIGN.md`** is the **Cursor warm-cream editorial** system (light canvas
`#f7f7f4`, warm ink, single orange accent `#f54e00`, hairline borders, NO drop shadows, display
weight 400). **We built to `DESIGN.md`** + added a tasteful dark mode + framer-motion micro-interactions
(the motion directives from `prd.md` §3 were honored: `layoutId` active nav, staggered mounts,
`whileHover`/`whileTap`, number ticking). Do not switch to glassmorphism.

---

## 2. Stack & versions (already installed, do not "fix")

- **Next.js 15.1.3** App Router, React 19, TypeScript strict.
- **Tailwind CSS 3.4** (CSS-var token system — see `tailwind.config.ts` + `src/app/globals.css`).
- **framer-motion 11**, **swr 2**, **lucide-react**, **clsx + tailwind-merge**.
- **@supabase/ssr `^0.10.3`** + **@supabase/supabase-js `^2.106.2`**.

### ⚠️ Version gotcha (already solved — don't regress)
`@supabase/ssr@0.5.x` imports types from `@supabase/supabase-js/dist/module/lib/types`, a path that
**no longer exists** in supabase-js 2.106 → makes every `.from()/.rpc()` resolve to `never`/`any` and
cookie callbacks become implicit-`any`. **Fix already applied:** bumped ssr to `^0.10.3`. If you ever
see "Argument of type X is not assignable to parameter of type 'never'" across Supabase calls, this
version mismatch is why.

---

## 3. Supabase project (LIVE — schema already applied)

- **Project ref:** `gtbmqetpqjjqfcwfwvie` (org "WORKHORSE"), linked in `supabase/.temp`.
- **URL:** `https://gtbmqetpqjjqfcwfwvie.supabase.co`
- **Anon (publishable) key:** `sb_publishable_mMBbvrweaGuz3p5Z0JHztw_s4sghRMn`
- Use the Supabase MCP tools (`apply_migration`, `deploy_edge_function`, `execute_sql`,
  `get_advisors`, `generate_typescript_types`) against this `project_id`.

### Schema (already migrated & live — files in `supabase/migrations/`)
Tables: `groups`, `profiles` (1:1 auth.users, holds `group_id`, privacy flags `show_projects/
show_languages/show_total`, `reminders_enabled`, `wakatime_connected`, `current_streak`,
`longest_streak`, `theme`, `timezone`, `onboarded`), `wakatime_credentials` (RLS-locked, service-role
only — stores AES-encrypted key + `key_preview`), `wakatime_logs` (daily; `total_seconds`,
`top_language`, `top_project`, `languages` jsonb `[{name,total_seconds}]`, `projects` jsonb, `hourly`
jsonb 24-slot seconds), `goals`, `interactions` (nudges/kudos, realtime), `badges` (seeded 9),
`user_badges`, `reminders_sent` (dedupe).

RPCs (SECURITY DEFINER, granted to `authenticated`): `create_group(group_name)`, `join_group(code)`,
`leave_group()`, `remove_member(member)`, `get_group_leaderboard(p_range)` (today/week/month, applies
privacy + ranks), `get_arena_leaderboard()`, `get_my_goals()` (live computed progress),
plus internal helpers `auth_group_id()`, `is_group_admin()`, `recompute_streak(target)`,
`goal_period_seconds()`, `generate_join_code()`, `handle_new_user` trigger.

RLS: strict, group-scoped. `wakatime_credentials` and `reminders_sent` intentionally have **no
policies** (service-role only) — the advisor INFO note about that is expected, leave it.

TypeScript DB types: `src/lib/database.types.ts` (generated verbatim; regenerate via MCP
`generate_typescript_types` if you change schema).

---

## 4. Environment (`.env.local` — partially filled)

Already set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
`WAKATIME_ENC_KEY` (a real 32-byte base64 key: `yLhXfDh10XeQaWytW3ExNkHdZvKcT3HfntCvPmtZmYg=`).

**Still needed (ask the user / set before those features work):**
- `SUPABASE_SERVICE_ROLE_KEY=` — Dashboard → Project Settings → API → `service_role`. Required for
  connecting WakaTime (server action writes the encrypted key with the service client) and for the
  settings key-preview read.
- `CRON_SECRET=` — pick any random string; must match the edge-function secret of the same name.

Edge-function secrets to set (Section 7): `WAKATIME_ENC_KEY` (SAME value as `.env.local`),
`RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`.

---

## 5. What's DONE (don't rebuild)

**Foundation:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
`.eslintrc.json`, `tailwind.config.ts`, `src/app/globals.css` (light+dark tokens, scrollbars,
reduced-motion), `src/app/layout.tsx` (Inter + JetBrains Mono fonts, ThemeProvider, ToastProvider,
no-flash theme script).

**Lib:** `src/lib/supabase/{client,server,middleware}.ts` (+ `createServiceClient`), root
`middleware.ts` (session refresh + route guard), `src/lib/auth.ts` (`getSessionProfile`,
`requireOnboardedProfile`), `utils.ts` (cn, avatarGradient, initials), `format.ts` (duration/hours),
`constants.ts` (NAV_ITEMS, POPULAR_LANGUAGES, RANGES, TONE_CLASS), `crypto.ts` (AES-256-GCM
encrypt/decrypt + keyPreview), `wakatime.ts` (`validateWakatimeKey`), `database.types.ts`.

**Server actions** (`src/lib/actions/`): `auth.ts` (signUp/signIn/signOut), `groups.ts`
(create/join/leave/removeMember/updateGroup), `wakatime.ts` (connect/disconnect/setTimezone),
`goals.ts` (create/delete), `profile.ts` (updateProfile — strips protected fields),
`interactions.ts` (sendInteraction/markRead).

**UI primitives** (`src/components/ui/`): button, card, input (+Label/FieldHint/FieldError), badge,
toast (ToastProvider/useToast), dialog (portal+AnimatePresence), avatar, skeleton, progress, switch,
segmented (layoutId), bar-chart, empty-state. Plus `brand.tsx` (Logo), `theme-provider.tsx`,
`layout/theme-toggle.tsx`, `motion/animated-number.tsx`, `motion/stagger.tsx` (Stagger/StaggerItem/
PageReveal).

**Pages:** landing (`app/page.tsx` + `components/marketing/landing.tsx`), `login`, `signup`,
`auth/callback/route.ts`, `onboarding` (`page.tsx` + `components/onboarding/wizard.tsx` — 3-step
framer wizard: welcome → connect WakaTime → join/create group), auth shell + login/signup forms.

**App shell:** `components/layout/app-shell.tsx` (desktop sidebar with `layoutId="nav-active"`,
mobile drawer, user card, sign-out, theme toggle), `layout/realtime-listener.tsx` (nudge/kudo toasts
+ live leaderboard refresh), `app/(app)/layout.tsx`.

**Feature pages (all DONE):**
- Dashboard: `components/dashboard/{stat-card,leaderboard,dashboard-client,connect-banner}.tsx`,
  `app/(app)/dashboard/page.tsx`. SWR polls `get_group_leaderboard` every 30s; animated reordering
  leaderboard with nudge/kudo buttons; stat cards with number ticking; relative-time bar chart.
- Goals: `components/goals/goals-client.tsx`, `app/(app)/goals/page.tsx`. Composer dialog
  (title/language/target preset/frequency), progress bars, delete.
- Arena: `components/arena/arena-client.tsx`, `app/(app)/arena/page.tsx`. Admin opt-in switch,
  ranked groups.
- Analytics: `components/analytics/analytics-client.tsx`, `app/(app)/analytics/page.tsx`.
  Contribution heatmap, productivity-by-hour bars, top languages, badges grid (server aggregates
  `wakatime_logs`).
- Settings: `app/(app)/settings/page.tsx` is DONE but its client component is **missing** → Section 6.

---

## 6. ⛔ IMMEDIATE BLOCKER — create `src/components/settings/settings-client.tsx`

`settings/page.tsx` does `import { SettingsClient, type Member } from "@/components/settings/settings-client"`.
Create that file. It must export `SettingsClient` and a `Member` type. Props the page passes:

```ts
profile: Profile (from "@/lib/auth")
group: Tables<"groups"> | null
members: Member[]            // { id, display_name, avatar_url, wakatime_connected, current_streak }
isAdmin: boolean
keyPreview: string | null
```

Sections to render (all wired to existing actions):
- **Profile** — edit `display_name` (→ `updateProfile`), theme via `<ThemeToggle/>`, timezone select
  (→ `updateProfile({timezone})`; default `Intl.DateTimeFormat().resolvedOptions().timeZone`, offer a
  "use my browser timezone" button).
- **WakaTime** — show connected state + `keyPreview`; if not connected, an input + `connectWakatime`;
  if connected, `disconnectWakatime` + a **"Sync now"** button that calls
  `createClient().functions.invoke("sync-wakatime")` (browser client auto-sends the user JWT) then
  `router.refresh()`.
- **Privacy** — three `<Switch>`: `show_total`, `show_languages`, `show_projects` (→ `updateProfile`).
- **Reminders** — `<Switch>` for `reminders_enabled` (→ `updateProfile`).
- **Group** — copy `join_code`; if `isAdmin`: edit name + Discord webhook (→ `updateGroup`), members
  list with remove buttons (→ `removeMember`, hide for self/admin); **Leave group** (→ `leaveGroup`
  then `router.replace("/onboarding")`).

Use `Card/CardContent`, `Switch`, `Button`, `Input/Label`, `useToast`, `Avatar`, `Stagger`. Keep the
editorial look (section header + hairline cards). Reference `goals-client.tsx` / `arena-client.tsx`
for the established patterns (they're good templates). A "SettingsSection" wrapper
(`<div><h2 className="text-title-md">…</h2><Card>…</Card></div>`) keeps it tidy.

After creating it, `npm run build` should compile the whole app.

---

## 7. Edge functions (Task 7 — not started)

Create under `supabase/functions/` and deploy with MCP `deploy_edge_function` (project_id above).

### `sync-wakatime` (deploy with `verify_jwt: false` — it does its own auth)
Auth modes:
- Header `x-cron-secret: <CRON_SECRET>` → sync **all** connected users (the cron path).
- `Authorization: Bearer <user-jwt>` → sync **just that caller** (the "Sync now" button path; verify
  the JWT with the anon client `auth.getUser`).

Logic per user:
1. Read `wakatime_credentials.encrypted_key` (service client).
2. **Decrypt** with Web Crypto AES-GCM. Format is `ivB64 + "." + dataB64`, where `data =
   ciphertext || 16-byte GCM tag` (Web Crypto convention — matches `src/lib/crypto.ts`). Key =
   `Uint8Array(atob(WAKATIME_ENC_KEY))` (32 bytes).
3. `GET https://wakatime.com/api/v1/users/current/summaries?range=Today` with
   `Authorization: Basic base64(apiKey)`.
4. Upsert today's `wakatime_logs`: `total_seconds = data[0].grand_total.total_seconds`,
   `languages` → `[{name,total_seconds}]` from `data[0].languages`, `projects` similarly,
   `top_language`/`top_project` = first of each, `hourly` = 24-slot seconds (WakaTime summaries don't
   give hourly directly — approximate by bucketing, or fetch `durations?date=` for real hourly; an
   approximation is acceptable for v1).
5. Re-evaluate that user's active `goals` (use `goal_period_seconds`) → set `status='completed'`,
   `completed_at` when target met; update `progress_seconds`.
6. `rpc("recompute_streak", { target: userId })`.
7. (Optional) award badges (streak_7/30, centurion≥100h, polyglot 5+ langs/week, night_owl/early_bird
   from `hourly`, deep_work single 4h+ — insert into `user_badges` on conflict do nothing).

Decryption helper (Deno):
```ts
function b64ToBytes(b64: string){return Uint8Array.from(atob(b64), c=>c.charCodeAt(0));}
async function decrypt(payload: string, keyB64: string){
  const [ivB64, dataB64] = payload.split(".");
  const key = await crypto.subtle.importKey("raw", b64ToBytes(keyB64), "AES-GCM", false, ["decrypt"]);
  const buf = await crypto.subtle.decrypt({name:"AES-GCM", iv: b64ToBytes(ivB64)}, key, b64ToBytes(dataB64));
  return new TextDecoder().decode(buf);
}
```

### `smart-reminders` (deploy `verify_jwt: false`; guard with `x-cron-secret`)
- For each user with `reminders_enabled=true` and ≥1 active goal not yet met **today**:
  - Compute their peak coding window from historical `wakatime_logs.hourly` (argmax hour).
  - If `now` (in the user's `timezone`) is within ~1h *before* that peak window closes AND goal unmet
    AND no row in `reminders_sent` for (goal_id, today): send email via **Resend**
    (`POST https://api.resend.com/emails`, `Authorization: Bearer RESEND_API_KEY`, `from = RESEND_FROM`)
    with a nicely formatted HTML body, then insert `reminders_sent`.
- Make Resend optional: if `RESEND_API_KEY` missing, log and no-op (don't crash).

### Set edge secrets (or tell the user to):
```
supabase secrets set WAKATIME_ENC_KEY=yLhXfDh10XeQaWytW3ExNkHdZvKcT3HfntCvPmtZmYg= \
  CRON_SECRET=<same-as-.env.local> RESEND_API_KEY=<resend> RESEND_FROM="CodePulse <pulse@yourdomain>"
```
(`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected into edge functions.)

---

## 8. Cron (Task 7 cont.) — schedule via a migration

Enable `pg_cron` + `pg_net`, then schedule both functions every 30 min. Apply via MCP
`apply_migration` and also save the file under `supabase/migrations/`:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('codepulse-sync', '*/30 * * * *', $$
  select net.http_post(
    url := 'https://gtbmqetpqjjqfcwfwvie.supabase.co/functions/v1/sync-wakatime',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>')
  );
$$);

select cron.schedule('codepulse-reminders', '*/30 * * * *', $$
  select net.http_post(
    url := 'https://gtbmqetpqjjqfcwfwvie.supabase.co/functions/v1/smart-reminders',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>')
  );
$$);
```
Replace `<CRON_SECRET>` with the real value. (Storing it inline is acceptable; vault is nicer.)

---

## 9. Build verification & smoke test (Task 8)

```
npx tsc --noEmit        # currently PASSES for everything written so far
npm run build           # will fail until Section 6 file exists
npm run dev             # http://localhost:3000
```
Manual E2E: sign up → confirm email (Supabase may require it; check Auth settings — for demo you can
disable "Confirm email" in the dashboard) → onboarding (connect WakaTime needs
`SUPABASE_SERVICE_ROLE_KEY` set; you can "Skip for now") → create a group → land on dashboard →
create a goal → toggle privacy in settings → flip theme. Then run `get_advisors` (security) and fix
anything new.

**Known empty-state behavior:** with no `wakatime_logs` yet, leaderboard/analytics show graceful
empty states. Insert a test row via MCP `execute_sql` to see populated UI, or wait for a real sync.

### Tips
- Use `npm run dev` in background; if the user must do interactive logins, suggest `! <cmd>`.
- The repo's `/run` and `/verify` skills can drive the app if helpful.
- If email confirmation is on, `signUp` returns `needsConfirmation` and the UI shows "check inbox";
  the `auth/callback` route exchanges the code.

---

## 10. README (Task 8)

Write `README.md`: what CodePulse is, stack, the Supabase project ref, env setup (copy `.env.example`,
fill service-role + cron + resend), `npm install && npm run dev`, how schema/edge-functions/cron are
deployed, and the design-system note (built to `DESIGN.md`). `.env.example` already exists.

---

## 11. Task tracker state (TaskList tool)

1 Foundation ✅ · 2 DB/RLS ✅ · 3 Supabase wiring ✅ · 4 UI primitives ✅ · 5 Auth/landing/onboarding ✅
· 6 App shell + pages **🔄 (only settings-client.tsx left)** · 7 Edge functions + cron ⬜ · 8 Build
verify + docs ⬜.

---

## 12. Gotchas checklist
- [ ] Keep `@supabase/ssr@^0.10.3` (don't downgrade — see §2).
- [ ] `WAKATIME_ENC_KEY` must be **identical** in `.env.local` and edge secrets (§4/§7).
- [ ] Encryption payload format `ivB64.base64(ciphertext+tag)` must match `src/lib/crypto.ts` ⇄ edge.
- [ ] `wakatime_credentials`/`reminders_sent` have no RLS policies on purpose (service-role only).
- [ ] Build to `DESIGN.md` (cream/editorial), not glassmorphism.
- [ ] `connectWakatime` needs `SUPABASE_SERVICE_ROLE_KEY`; surface a clear error if missing (already
      handled in the action — returns an explanatory message).
- [ ] All Supabase calls are typed via `Database` generic; don't pass untyped `Record<string,unknown>`
      to `.update()/.insert()` (use `TablesUpdate<"x">`/`TablesInsert<"x">`).
