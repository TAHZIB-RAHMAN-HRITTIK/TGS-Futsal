-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text check (group_name in ('A', 'B')),
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  kit_no int not null,
  position text
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('group', 'semi', 'final')),
  group_name text check (group_name in ('A', 'B')),
  home_team_id uuid references teams(id),   -- null while a knockout team is still TBD
  away_team_id uuid references teams(id),
  home_label text,                          -- e.g. 'Group A 1st', shown while TBD
  away_label text,
  home_score int not null default 0,
  away_score int not null default 0,
  kickoff_at timestamptz not null,
  venue text default 'Dbox Sports Complex',
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  motm_player_id uuid references players(id)
);

create table match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  goals int not null default 0,
  assists int not null default 0,
  through_cross int not null default 0,
  tackles_won int not null default 0,
  interceptions int not null default 0,
  saves int not null default 0,
  fouls int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  clean_sheet boolean not null default false,
  unique (match_id, player_id)
);

-- Public read access; writes only via the service-role key (used server-side
-- in the admin panel), so no insert/update/delete policies are defined here.
alter table teams enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table match_stats enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_stats" on match_stats for select using (true);

-- Enable realtime so the site updates live as an admin enters scores/stats.
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_stats;
