import type { GroupName, Match, StandingRow, Team } from "./types";

/** True when two rows can't be separated by points, goal difference or goals scored. */
export function sameRecord(a: StandingRow, b: StandingRow) {
  return (
    a.points === b.points &&
    a.goal_diff === b.goal_diff &&
    a.goals_for === b.goals_for
  );
}

/** Group-stage standings, computed from completed group matches. */
export function buildStandings(
  teams: Team[],
  allMatches: Match[]
): Record<GroupName, StandingRow[]> {
  const matches = allMatches.filter(
    (m) => m.stage === "group" && m.status === "completed"
  );

  const table: Record<string, StandingRow> = {};
  for (const team of teams) {
    table[team.id] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_diff: 0,
      points: 0,
    };
  }

  for (const m of matches) {
    const home = m.home_team_id ? table[m.home_team_id] : undefined;
    const away = m.away_team_id ? table[m.away_team_id] : undefined;
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goals_for += m.home_score;
    home.goals_against += m.away_score;
    away.goals_for += m.away_score;
    away.goals_against += m.home_score;

    if (m.home_score > m.away_score) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (m.home_score < m.away_score) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of Object.values(table)) {
    row.goal_diff = row.goals_for - row.goals_against;
  }

  const sortRows = (rows: StandingRow[]) =>
    rows.sort(
      (a, b) =>
        b.points - a.points ||
        b.goal_diff - a.goal_diff ||
        b.goals_for - a.goals_for ||
        a.team.name.localeCompare(b.team.name)
    );

  return {
    A: sortRows(Object.values(table).filter((r) => r.team.group_name === "A")),
    B: sortRows(Object.values(table).filter((r) => r.team.group_name === "B")),
  };
}
