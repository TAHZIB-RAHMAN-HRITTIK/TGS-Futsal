-- Placeholder seed data: 12 teams (2 groups of 6), 9 players each,
-- and a full round-robin group-stage schedule starting 9:00 AM on Oct 2, 2026.
-- Edit team/player names directly here before running, or afterwards in
-- Supabase's Table Editor (Project > Table Editor) -- no SQL needed to edit rows.

-- Team + player IDs are generated deterministically so this file is easy to
-- re-run/edit; swap the placeholder names for your real team & player names.

with new_teams as (
  insert into teams (name, group_name) values
    ('Team A1', 'A'),
    ('Team A2', 'A'),
    ('Team A3', 'A'),
    ('Team A4', 'A'),
    ('Team A5', 'A'),
    ('Team A6', 'A'),
    ('Team B1', 'B'),
    ('Team B2', 'B'),
    ('Team B3', 'B'),
    ('Team B4', 'B'),
    ('Team B5', 'B'),
    ('Team B6', 'B')
  returning id, name, group_name
)
select * from new_teams;

-- Players: run after confirming the teams above were created.
-- This uses each team's name to look up its id, so team names must be unique.
insert into players (team_id, name, kit_no, position)
select t.id, p.name, p.kit_no, p.position from teams t
join (values
  ('Team A1', 'Team A1 Player 1', 1, 'GK'),
  ('Team A1', 'Team A1 Player 2', 2, 'Defender'),
  ('Team A1', 'Team A1 Player 3', 3, 'Defender'),
  ('Team A1', 'Team A1 Player 4', 4, 'Winger'),
  ('Team A1', 'Team A1 Player 5', 5, 'Winger'),
  ('Team A1', 'Team A1 Player 6', 6, 'Pivot'),
  ('Team A1', 'Team A1 Player 7', 7, 'Defender'),
  ('Team A1', 'Team A1 Player 8', 8, 'Winger'),
  ('Team A1', 'Team A1 Player 9', 9, 'Pivot'),
  ('Team A2', 'Team A2 Player 1', 1, 'GK'),
  ('Team A2', 'Team A2 Player 2', 2, 'Defender'),
  ('Team A2', 'Team A2 Player 3', 3, 'Defender'),
  ('Team A2', 'Team A2 Player 4', 4, 'Winger'),
  ('Team A2', 'Team A2 Player 5', 5, 'Winger'),
  ('Team A2', 'Team A2 Player 6', 6, 'Pivot'),
  ('Team A2', 'Team A2 Player 7', 7, 'Defender'),
  ('Team A2', 'Team A2 Player 8', 8, 'Winger'),
  ('Team A2', 'Team A2 Player 9', 9, 'Pivot'),
  ('Team A3', 'Team A3 Player 1', 1, 'GK'),
  ('Team A3', 'Team A3 Player 2', 2, 'Defender'),
  ('Team A3', 'Team A3 Player 3', 3, 'Defender'),
  ('Team A3', 'Team A3 Player 4', 4, 'Winger'),
  ('Team A3', 'Team A3 Player 5', 5, 'Winger'),
  ('Team A3', 'Team A3 Player 6', 6, 'Pivot'),
  ('Team A3', 'Team A3 Player 7', 7, 'Defender'),
  ('Team A3', 'Team A3 Player 8', 8, 'Winger'),
  ('Team A3', 'Team A3 Player 9', 9, 'Pivot'),
  ('Team A4', 'Team A4 Player 1', 1, 'GK'),
  ('Team A4', 'Team A4 Player 2', 2, 'Defender'),
  ('Team A4', 'Team A4 Player 3', 3, 'Defender'),
  ('Team A4', 'Team A4 Player 4', 4, 'Winger'),
  ('Team A4', 'Team A4 Player 5', 5, 'Winger'),
  ('Team A4', 'Team A4 Player 6', 6, 'Pivot'),
  ('Team A4', 'Team A4 Player 7', 7, 'Defender'),
  ('Team A4', 'Team A4 Player 8', 8, 'Winger'),
  ('Team A4', 'Team A4 Player 9', 9, 'Pivot'),
  ('Team A5', 'Team A5 Player 1', 1, 'GK'),
  ('Team A5', 'Team A5 Player 2', 2, 'Defender'),
  ('Team A5', 'Team A5 Player 3', 3, 'Defender'),
  ('Team A5', 'Team A5 Player 4', 4, 'Winger'),
  ('Team A5', 'Team A5 Player 5', 5, 'Winger'),
  ('Team A5', 'Team A5 Player 6', 6, 'Pivot'),
  ('Team A5', 'Team A5 Player 7', 7, 'Defender'),
  ('Team A5', 'Team A5 Player 8', 8, 'Winger'),
  ('Team A5', 'Team A5 Player 9', 9, 'Pivot'),
  ('Team A6', 'Team A6 Player 1', 1, 'GK'),
  ('Team A6', 'Team A6 Player 2', 2, 'Defender'),
  ('Team A6', 'Team A6 Player 3', 3, 'Defender'),
  ('Team A6', 'Team A6 Player 4', 4, 'Winger'),
  ('Team A6', 'Team A6 Player 5', 5, 'Winger'),
  ('Team A6', 'Team A6 Player 6', 6, 'Pivot'),
  ('Team A6', 'Team A6 Player 7', 7, 'Defender'),
  ('Team A6', 'Team A6 Player 8', 8, 'Winger'),
  ('Team A6', 'Team A6 Player 9', 9, 'Pivot'),
  ('Team B1', 'Team B1 Player 1', 1, 'GK'),
  ('Team B1', 'Team B1 Player 2', 2, 'Defender'),
  ('Team B1', 'Team B1 Player 3', 3, 'Defender'),
  ('Team B1', 'Team B1 Player 4', 4, 'Winger'),
  ('Team B1', 'Team B1 Player 5', 5, 'Winger'),
  ('Team B1', 'Team B1 Player 6', 6, 'Pivot'),
  ('Team B1', 'Team B1 Player 7', 7, 'Defender'),
  ('Team B1', 'Team B1 Player 8', 8, 'Winger'),
  ('Team B1', 'Team B1 Player 9', 9, 'Pivot'),
  ('Team B2', 'Team B2 Player 1', 1, 'GK'),
  ('Team B2', 'Team B2 Player 2', 2, 'Defender'),
  ('Team B2', 'Team B2 Player 3', 3, 'Defender'),
  ('Team B2', 'Team B2 Player 4', 4, 'Winger'),
  ('Team B2', 'Team B2 Player 5', 5, 'Winger'),
  ('Team B2', 'Team B2 Player 6', 6, 'Pivot'),
  ('Team B2', 'Team B2 Player 7', 7, 'Defender'),
  ('Team B2', 'Team B2 Player 8', 8, 'Winger'),
  ('Team B2', 'Team B2 Player 9', 9, 'Pivot'),
  ('Team B3', 'Team B3 Player 1', 1, 'GK'),
  ('Team B3', 'Team B3 Player 2', 2, 'Defender'),
  ('Team B3', 'Team B3 Player 3', 3, 'Defender'),
  ('Team B3', 'Team B3 Player 4', 4, 'Winger'),
  ('Team B3', 'Team B3 Player 5', 5, 'Winger'),
  ('Team B3', 'Team B3 Player 6', 6, 'Pivot'),
  ('Team B3', 'Team B3 Player 7', 7, 'Defender'),
  ('Team B3', 'Team B3 Player 8', 8, 'Winger'),
  ('Team B3', 'Team B3 Player 9', 9, 'Pivot'),
  ('Team B4', 'Team B4 Player 1', 1, 'GK'),
  ('Team B4', 'Team B4 Player 2', 2, 'Defender'),
  ('Team B4', 'Team B4 Player 3', 3, 'Defender'),
  ('Team B4', 'Team B4 Player 4', 4, 'Winger'),
  ('Team B4', 'Team B4 Player 5', 5, 'Winger'),
  ('Team B4', 'Team B4 Player 6', 6, 'Pivot'),
  ('Team B4', 'Team B4 Player 7', 7, 'Defender'),
  ('Team B4', 'Team B4 Player 8', 8, 'Winger'),
  ('Team B4', 'Team B4 Player 9', 9, 'Pivot'),
  ('Team B5', 'Team B5 Player 1', 1, 'GK'),
  ('Team B5', 'Team B5 Player 2', 2, 'Defender'),
  ('Team B5', 'Team B5 Player 3', 3, 'Defender'),
  ('Team B5', 'Team B5 Player 4', 4, 'Winger'),
  ('Team B5', 'Team B5 Player 5', 5, 'Winger'),
  ('Team B5', 'Team B5 Player 6', 6, 'Pivot'),
  ('Team B5', 'Team B5 Player 7', 7, 'Defender'),
  ('Team B5', 'Team B5 Player 8', 8, 'Winger'),
  ('Team B5', 'Team B5 Player 9', 9, 'Pivot'),
  ('Team B6', 'Team B6 Player 1', 1, 'GK'),
  ('Team B6', 'Team B6 Player 2', 2, 'Defender'),
  ('Team B6', 'Team B6 Player 3', 3, 'Defender'),
  ('Team B6', 'Team B6 Player 4', 4, 'Winger'),
  ('Team B6', 'Team B6 Player 5', 5, 'Winger'),
  ('Team B6', 'Team B6 Player 6', 6, 'Pivot'),
  ('Team B6', 'Team B6 Player 7', 7, 'Defender'),
  ('Team B6', 'Team B6 Player 8', 8, 'Winger'),
  ('Team B6', 'Team B6 Player 9', 9, 'Pivot')
) as p(team_name, name, kit_no, position) on p.team_name = t.name;

-- Group-stage fixtures: full round robin within each group (15 matches x 2 groups).
-- Semi-finals and the final are added later once group winners are known --
-- see the template at the bottom of this file.
insert into matches (stage, group_name, home_team_id, away_team_id, kickoff_at, venue, status)
select 'group', m.group_name, home.id, away.id, (m.kickoff_at::timestamp at time zone 'Asia/Dhaka'), 'Dbox Sports Complex', 'upcoming'
from (values
  ('A', 'Team A1', 'Team A2', '2026-10-02 09:00'),
  ('A', 'Team A1', 'Team A3', '2026-10-02 09:20'),
  ('A', 'Team A1', 'Team A4', '2026-10-02 09:40'),
  ('A', 'Team A1', 'Team A5', '2026-10-02 10:00'),
  ('A', 'Team A1', 'Team A6', '2026-10-02 10:20'),
  ('A', 'Team A2', 'Team A3', '2026-10-02 10:40'),
  ('A', 'Team A2', 'Team A4', '2026-10-02 11:00'),
  ('A', 'Team A2', 'Team A5', '2026-10-02 11:20'),
  ('A', 'Team A2', 'Team A6', '2026-10-02 11:40'),
  ('A', 'Team A3', 'Team A4', '2026-10-02 12:00'),
  ('A', 'Team A3', 'Team A5', '2026-10-02 12:20'),
  ('A', 'Team A3', 'Team A6', '2026-10-02 12:40'),
  ('A', 'Team A4', 'Team A5', '2026-10-02 13:00'),
  ('A', 'Team A4', 'Team A6', '2026-10-02 13:20'),
  ('A', 'Team A5', 'Team A6', '2026-10-02 13:40'),
  ('B', 'Team B1', 'Team B2', '2026-10-02 14:00'),
  ('B', 'Team B1', 'Team B3', '2026-10-02 14:20'),
  ('B', 'Team B1', 'Team B4', '2026-10-02 14:40'),
  ('B', 'Team B1', 'Team B5', '2026-10-02 15:00'),
  ('B', 'Team B1', 'Team B6', '2026-10-02 15:20'),
  ('B', 'Team B2', 'Team B3', '2026-10-02 15:40'),
  ('B', 'Team B2', 'Team B4', '2026-10-02 16:00'),
  ('B', 'Team B2', 'Team B5', '2026-10-02 16:20'),
  ('B', 'Team B2', 'Team B6', '2026-10-02 16:40'),
  ('B', 'Team B3', 'Team B4', '2026-10-02 17:00'),
  ('B', 'Team B3', 'Team B5', '2026-10-02 17:20'),
  ('B', 'Team B3', 'Team B6', '2026-10-02 17:40'),
  ('B', 'Team B4', 'Team B5', '2026-10-02 18:00'),
  ('B', 'Team B4', 'Team B6', '2026-10-02 18:20'),
  ('B', 'Team B5', 'Team B6', '2026-10-02 18:40')
) as m(group_name, home_name, away_name, kickoff_at)
join teams home on home.name = m.home_name
join teams away on away.name = m.away_name;

-- --- Template for once group winners are known (run manually) ---
-- insert into matches (stage, home_team_id, away_team_id, kickoff_at, venue, status)
-- select 'semi', home.id, away.id, '2026-10-02 17:00+06', 'Dbox Sports Complex', 'upcoming'
-- from teams home, teams away where home.name = 'Team A1' and away.name = 'Team B2';
-- -- repeat for the second semi, then for the final once semi winners are known.
