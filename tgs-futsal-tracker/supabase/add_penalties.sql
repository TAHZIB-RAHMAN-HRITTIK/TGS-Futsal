-- Run this ONCE in Supabase SQL Editor if your database is already set up.
-- Adds penalty shootout columns to the matches table (safe to run multiple times).

alter table matches
  add column if not exists home_penalties int,
  add column if not exists away_penalties int;

comment on column matches.home_penalties is 'Penalty goals — null unless the knockout went to a shootout';
comment on column matches.away_penalties is 'Penalty goals — null unless the knockout went to a shootout';
