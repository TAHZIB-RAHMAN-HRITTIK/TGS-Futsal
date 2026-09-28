import type { GroupName, Match, Team } from "./types";
import { buildStandings, sameRecord } from "./standings";

type Label = string | null | undefined;

function groupDone(matches: Match[], g: GroupName) {
  const groupMatches = matches.filter(
    (m) => m.stage === "group" && m.group_name === g
  );
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === "completed");
}

/**
 * Fills in knockout teams automatically:
 *  - "Group A 1st" / "Group B 2nd" etc. -> from the standings, once that
 *    group's matches are all completed.
 *  - "Winner SF1" / "Winner SF2" -> from the completed semi-finals.
 *
 * It never guesses: if teams can't be separated by points, goal difference
 * and goals scored (or a semi ended level), that slot stays TBD so an
 * organiser can decide it by hand. A team set manually in the database
 * always wins over the automatic pick.
 */
export function resolveKnockouts(matches: Match[], teams: Team[]): Match[] {
  const standings = buildStandings(teams, matches);

  const fromStandings = (label: Label): Team | undefined => {
    const parsed = /^Group ([AB]) (1st|2nd)$/.exec(label ?? "");
    if (!parsed) return undefined;
    const group = parsed[1] as GroupName;
    const rank = parsed[2] === "1st" ? 0 : 1;
    if (!groupDone(matches, group)) return undefined;
    const rows = standings[group];
    if (rows.length < 3) return undefined;
    if (sameRecord(rows[0], rows[1])) return undefined; // 1st/2nd can't be split
    if (rank === 1 && sameRecord(rows[1], rows[2])) return undefined; // 2nd/3rd can't be split
    return rows[rank].team;
  };

  const fill = (m: Match, home?: Team, away?: Team): Match => ({
    ...m,
    home_team_id: m.home_team_id ?? home?.id ?? null,
    away_team_id: m.away_team_id ?? away?.id ?? null,
    home_team: m.home_team ?? home,
    away_team: m.away_team ?? away,
  });

  const semis = matches
    .filter((m) => m.stage === "semi")
    .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime());

  const resolvedSemis = new Map<string, Match>();
  for (const m of semis) {
    resolvedSemis.set(
      m.id,
      fill(
        m,
        m.home_team_id ? undefined : fromStandings(m.home_label),
        m.away_team_id ? undefined : fromStandings(m.away_label)
      )
    );
  }

  const winnerOf = (index: number): Team | undefined => {
    const semi = semis[index];
    if (!semi) return undefined;
    const r = resolvedSemis.get(semi.id)!;
    if (r.status !== "completed" || !r.home_team || !r.away_team) return undefined;
    if (r.home_score > r.away_score) return r.home_team;
    if (r.away_score > r.home_score) return r.away_team;
    return undefined; // level — decide manually
  };

  const fromSemi = (label: Label): Team | undefined =>
    label === "Winner SF1" ? winnerOf(0) : label === "Winner SF2" ? winnerOf(1) : undefined;

  return matches.map((m) => {
    if (m.stage === "semi") return resolvedSemis.get(m.id)!;
    if (m.stage === "final") {
      return fill(
        m,
        m.home_team_id ? undefined : fromSemi(m.home_label),
        m.away_team_id ? undefined : fromSemi(m.away_label)
      );
    }
    return m;
  });
}
