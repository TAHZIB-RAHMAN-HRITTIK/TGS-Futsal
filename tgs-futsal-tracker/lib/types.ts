export type GroupName = "A" | "B";
export type Stage = "group" | "semi" | "final";
export type MatchStatus = "upcoming" | "live" | "completed";

export interface Team {
  id: string;
  name: string;
  group_name: GroupName | null;
  created_at?: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  kit_no: number;
  position: string | null;
}

export interface Match {
  id: string;
  stage: Stage;
  group_name: GroupName | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_label?: string | null; // shown while a team is still TBD, e.g. "Group A 1st"
  away_label?: string | null;
  home_score: number;
  away_score: number;
  kickoff_at: string;
  venue: string | null;
  status: MatchStatus;
  motm_player_id: string | null;
  // joined at query time
  home_team?: Team;
  away_team?: Team;
  motm_player?: Player;
}

export interface MatchStat {
  id: string;
  match_id: string;
  player_id: string;
  goals: number;
  assists: number;
  through_cross: number;
  tackles_won: number;
  interceptions: number;
  saves: number;
  fouls: number;
  yellow_cards: number;
  red_cards: number;
  clean_sheet: boolean;
  player?: Player;
}

export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}
