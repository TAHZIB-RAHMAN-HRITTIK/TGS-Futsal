-- Custom fixture list. Run in Supabase: SQL Editor > New query > paste > Run.
-- WARNING: this deletes all existing matches (and any match stats entered
-- for them). Run it BEFORE the tournament starts, not during.

-- 1. Allow knockout matches to exist before their teams are known.
alter table matches alter column home_team_id drop not null;
alter table matches alter column away_team_id drop not null;
alter table matches add column if not exists home_label text;
alter table matches add column if not exists away_label text;

-- 2. Replace the placeholder fixtures.
delete from matches;

-- 3. Group stage: 30 matches, times are Dhaka time.
insert into matches (stage, group_name, home_team_id, away_team_id, kickoff_at, venue, status)
select 'group', f.grp, h.id, a.id,
       (f.kickoff::timestamp at time zone 'Asia/Dhaka'),
       'Dbox Sports Complex', 'upcoming'
from (values
  ('A', 'Gregorian Aces',      'Warsity FC',         '2026-10-02 09:30'),
  ('B', 'Aeros',               'The Gregorians 14',  '2026-10-02 09:45'),
  ('A', 'Gregorian Spartans',  'Warhawks De 19',     '2026-10-02 10:00'),
  ('B', 'FC Anchors',          'Shoeless Boys FC',   '2026-10-02 10:15'),
  ('A', 'Gregorian Thunders',  'Team Hades',         '2026-10-02 10:30'),
  ('B', 'Fraternite FC',       'Gregorian 13',       '2026-10-02 10:45'),
  ('A', 'Gregorian Aces',      'Warhawks De 19',     '2026-10-02 11:00'),
  ('B', 'Aeros',               'Shoeless Boys FC',   '2026-10-02 11:15'),
  ('A', 'Warsity FC',          'Team Hades',         '2026-10-02 11:30'),
  ('B', 'The Gregorians 14',   'Gregorian 13',       '2026-10-02 11:45'),
  ('A', 'Gregorian Spartans',  'Gregorian Thunders', '2026-10-02 12:00'),
  ('B', 'FC Anchors',          'Fraternite FC',      '2026-10-02 12:15'),
  ('A', 'Gregorian Aces',      'Team Hades',         '2026-10-02 12:30'),
  ('B', 'Aeros',               'Gregorian 13',       '2026-10-02 12:45'),
  ('A', 'Warhawks De 19',      'Gregorian Thunders', '2026-10-02 13:00'),
  ('B', 'Shoeless Boys FC',    'Fraternite FC',      '2026-10-02 14:15'),
  ('A', 'Warsity FC',          'Gregorian Spartans', '2026-10-02 14:30'),
  ('B', 'The Gregorians 14',   'FC Anchors',         '2026-10-02 14:45'),
  ('A', 'Gregorian Aces',      'Gregorian Thunders', '2026-10-02 15:00'),
  ('B', 'Aeros',               'Fraternite FC',      '2026-10-02 15:15'),
  ('A', 'Team Hades',          'Gregorian Spartans', '2026-10-02 15:30'),
  ('B', 'Gregorian 13',        'FC Anchors',         '2026-10-02 15:45'),
  ('A', 'Warhawks De 19',      'Warsity FC',         '2026-10-02 16:00'),
  ('B', 'Shoeless Boys FC',    'The Gregorians 14',  '2026-10-02 16:15'),
  ('A', 'Gregorian Aces',      'Gregorian Spartans', '2026-10-02 16:30'),
  ('B', 'Aeros',               'FC Anchors',         '2026-10-02 16:45'),
  ('A', 'Gregorian Thunders',  'Warsity FC',         '2026-10-02 17:00'),
  ('B', 'Fraternite FC',       'The Gregorians 14',  '2026-10-02 17:15'),
  ('A', 'Team Hades',          'Warhawks De 19',     '2026-10-02 17:30'),
  ('B', 'Gregorian 13',        'Shoeless Boys FC',   '2026-10-02 17:45')
) as f(grp, home_name, away_name, kickoff)
join teams h on h.name = f.home_name
join teams a on a.name = f.away_name;

-- 4. Knockouts: teams stay TBD until the group stage ends.
insert into matches (stage, home_label, away_label, kickoff_at, venue, status)
values
  ('semi',  'Group A 1st', 'Group B 2nd',  '2026-10-02 18:10+06', 'Dbox Sports Complex', 'upcoming'),
  ('semi',  'Group B 1st', 'Group A 2nd',  '2026-10-02 18:50+06', 'Dbox Sports Complex', 'upcoming'),
  ('final', 'Winner SF1',  'Winner SF2',   '2026-10-02 19:40+06', 'Dbox Sports Complex', 'upcoming');

-- ---------------------------------------------------------------------
-- The site fills in the semi-finals and final AUTOMATICALLY: semis from the
-- group standings once a group's matches are all completed, and the final
-- from the semi winners. It leaves a slot as TBD if teams are level on
-- points, goal difference and goals scored, or if a semi ends level.
--
-- Only if that happens, set the team by hand (do not run otherwise).
-- Replace the names, then run each block on its own:
--
-- Semi-final 1 (Group A 1st vs Group B 2nd):
-- update matches
-- set home_team_id = (select id from teams where name = 'TEAM NAME'),
--     away_team_id = (select id from teams where name = 'TEAM NAME')
-- where stage = 'semi' and home_label = 'Group A 1st';
--
-- Semi-final 2 (Group B 1st vs Group A 2nd): same, but
-- where stage = 'semi' and home_label = 'Group B 1st';
--
-- Final (winners of the two semis): same, but
-- where stage = 'final';
