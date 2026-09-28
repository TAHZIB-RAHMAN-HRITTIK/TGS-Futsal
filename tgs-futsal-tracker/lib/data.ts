import { supabaseServer } from "./supabase";
import { calculateRating } from "./ratings";
import type {
  Team,
  Player,
  Match,
  MatchStat,
  StandingRow,
  GroupName,
} from "./types";

export async function getTeams(): Promise<Team[]> {
  const sb = supabaseServer();
  const { data, error } = await sb.from("teams").select("*").order("name");
  if (error) throw error;
  return data as Team[];
}

export async function getPlayers(teamId?: string): Promise<Player[]> {
  const sb = supabaseServer();
  let query = sb.from("players").select("*").order("kit_no");
  if (teamId) query = query.eq("team_id", teamId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Player[];
}

export async function getMatches(): Promise<Match[]> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), motm_player:players(*)"
    )
    .order("kickoff_at");
  if (error) throw error;
  return data as unknown as Match[];
}

export async function getMatchById(id: string): Promise<{
  match: Match;
  stats: MatchStat[];
} | null> {
  const sb = supabaseServer();
  const { data: match, error: matchErr } = await sb
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), motm_player:players(*)"
    )
    .eq("id", id)
    .single();
  if (matchErr) return null;

  const { data: stats, error: statsErr } = await sb
    .from("match_stats")
    .select("*, player:players(*)")
    .eq("match_id", id);
  if (statsErr) throw statsErr;

  return { match: match as unknown as Match, stats: stats as unknown as MatchStat[] };
}

/** Group-stage standings only, computed from completed matches. */
export async function getStandings(): Promise<Record<GroupName, StandingRow[]>> {
  const teams = await getTeams();
  const matches = (await getMatches()).filter(
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
    const home = table[m.home_team_id];
    const away = table[m.away_team_id];
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
    A: sortRows(
      Object.values(table).filter((r) => r.team.group_name === "A")
    ),
    B: sortRows(
      Object.values(table).filter((r) => r.team.group_name === "B")
    ),
  };
}

export interface PlayerLeaderboardRow {
  player: Player;
  team: Team | undefined;
  goals: number;
  assists: number;
  motm: number;
  saves: number;
  clean_sheets: number;
  matches_played: number;
  avg_rating: number;
}

export async function getPlayerLeaderboard(): Promise<PlayerLeaderboardRow[]> {
  const sb = supabaseServer();
  const [teamsRes, playersRes, statsRes, matchesRes] = await Promise.all([
    sb.from("teams").select("*"),
    sb.from("players").select("*"),
    sb.from("match_stats").select("*"),
    sb.from("matches").select("id, motm_player_id, status"),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  if (playersRes.error) throw playersRes.error;
  if (statsRes.error) throw statsRes.error;
  if (matchesRes.error) throw matchesRes.error;

  const teams = teamsRes.data as Team[];
  const players = playersRes.data as Player[];
  const stats = statsRes.data as MatchStat[];
  const matches = matchesRes.data as Pick<Match, "id" | "motm_player_id" | "status">[];

  const motmCount: Record<string, number> = {};
  for (const m of matches) {
    if (m.status === "completed" && m.motm_player_id) {
      motmCount[m.motm_player_id] = (motmCount[m.motm_player_id] ?? 0) + 1;
    }
  }

  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

  const rows: PlayerLeaderboardRow[] = players.map((player) => {
    const playerStats = stats.filter((s) => s.player_id === player.id);
    const ratings = playerStats.map((s) => {
      const match = matches.find((m) => m.id === s.match_id);
      const isMotm = match?.motm_player_id === player.id;
      return calculateRating(s, isMotm);
    });

    return {
      player,
      team: teamById[player.team_id],
      goals: playerStats.reduce((sum, s) => sum + s.goals, 0),
      assists: playerStats.reduce((sum, s) => sum + s.assists, 0),
      motm: motmCount[player.id] ?? 0,
      saves: playerStats.reduce((sum, s) => sum + s.saves, 0),
      clean_sheets: playerStats.filter((s) => s.clean_sheet).length,
      matches_played: playerStats.length,
      avg_rating:
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0,
    };
  });

  return rows;
}
