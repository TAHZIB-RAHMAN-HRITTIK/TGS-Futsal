# Gregorian Abdur Rahim Memorial Futsal Tournament — Live Tracker

Real-time site for the TGS Gregorian Abdur Rahim Memorial Futsal Tournament:
home page, groups, standings, fixtures, results, per-match player stats with
a computed rating, and top-of-tournament leaderboards. Scores/stats update
live on every open tab as an organiser enters them — no refresh needed.

## 1. Create the database (~5 minutes)

1. Go to [supabase.com](https://supabase.com), sign up free, and create a new project.
2. Once it's ready, open **SQL Editor > New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the tables and turns on
   realtime.
3. Open a new query, paste `supabase/seed.sql`, and run it. This creates 12
   placeholder teams (Team A1–A6, Team B1–B6) with 9 placeholder players
   each, and the full group-stage fixture list starting 9:00 AM on Oct 2.
4. Go to **Project Settings > API** and copy: the **Project URL**, the
   **anon public** key, and the **service_role** key (keep this one secret).

## 2. Set your real team & player names

Easiest way: **Table Editor > teams** and **Table Editor > players** in
Supabase — it's a spreadsheet-style grid, click a cell and type. Update
kickoff times in **Table Editor > matches** to match your real schedule
once you know it (the seed data just spaces group matches 20 minutes apart
starting at 9 AM as a placeholder).

Semi-finals and the final aren't seeded, since the teams aren't known until
group standings settle. Once they are, add those two-to-three rows the same
way in the `matches` table (set `stage` to `semi` or `final`, and leave
`group_name` blank) — or use the SQL template at the bottom of `seed.sql`.

## 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the three Supabase
values from step 1, plus an `ADMIN_PASSWORD` of your choosing — this is the
single shared password that gets organisers into `/admin` to enter live
match stats. Don't reuse a personal password; anyone with it can edit match
data.

## 4. Run it locally

```
npm install
npm run dev
```

Open http://localhost:3000. Go to `/admin`, log in, set a match to "live",
and open it to enter goals/cards/stats — the public pages update instantly.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com), **New Project** → import that repo.
3. Under **Environment Variables**, add the same four keys from your
   `.env.local`.
4. Deploy. That's it — Vercel builds and hosts it, and it'll be live at a
   `*.vercel.app` URL you can share.

## Knockouts fill in automatically

`supabase/fixtures.sql` sets up the custom schedule. Semi-finals and the final
start as TBD ("Group A 1st vs Group B 2nd"). The site fills in the real teams
by itself: semis from the group standings once a group's matches are all
completed, and the final from the semi winners. If teams are level on points,
goal difference and goals scored, or a semi ends level, that slot stays TBD —
set it by hand with the SQL at the bottom of `fixtures.sql`.

## How the rating is calculated

`lib/ratings.ts` implements exactly what you specified:

```
6 (base)
+ 0.5 × goals
+ 0.25 × assists
− 0.5 × yellow cards
− 2 × red cards
+ 2 if Man of the Match
+ 0.1 × tackles won
+ 0.1 × interceptions
+ 0.25 × saves
```

Capped at 10, and floored at 0 (a negative rating isn't meaningful to show).

## What's deliberately left out of this starter

To get something you can actually ship in the next few days, this scaffold
skips a few things you can add once the core site is live:

- **Team/player/fixture management UI.** Use Supabase's Table Editor for
  now (it's genuinely quick) rather than a custom admin form — building
  full CRUD screens for that would roughly double the build.
- **Team logos/photos.** Teams and players are text-only. Add an `logo_url`
  column and an `<img>` tag in the team displays if you want crests later.
- **Semi-final/final auto-generation.** Since qualifying teams aren't known
  in advance, those two matches are added manually once groups conclude.

## Project structure

```
app/                 Pages (App Router) — one folder per route
components/          Shared UI: StatusBadge, LiveRefresher (realtime hook)
lib/data.ts          All data fetching + standings/leaderboard computation
lib/ratings.ts       The rating formula
lib/actions.ts       Server actions used by the admin panel
supabase/schema.sql  Database tables + policies + realtime setup
supabase/seed.sql    Placeholder teams, players, and group fixtures
```
