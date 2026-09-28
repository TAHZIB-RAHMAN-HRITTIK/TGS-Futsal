import { notFound } from "next/navigation";
import { getMatchById, getPlayers } from "@/lib/data";
import { saveStatFromForm, saveScoreFromForm, saveMotmFromForm } from "@/lib/actions";
import type { MatchStat, Player } from "@/lib/types";

export const revalidate = 0;

const FIELDS: { key: keyof Omit<MatchStat, "id" | "match_id" | "player_id" | "player" | "clean_sheet">; label: string }[] = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "through_cross", label: "Through/Cross" },
  { key: "tackles_won", label: "Tackles Won" },
  { key: "interceptions", label: "Interceptions" },
  { key: "saves", label: "Saves" },
  { key: "fouls", label: "Fouls" },
  { key: "yellow_cards", label: "Yellow" },
  { key: "red_cards", label: "Red" },
];

export default async function AdminMatchPage({ params }: { params: { id: string } }) {
  const data = await getMatchById(params.id);
  if (!data) notFound();
  const { match, stats } = data;

  const [homePlayers, awayPlayers] = await Promise.all([
    getPlayers(match.home_team_id),
    getPlayers(match.away_team_id),
  ]);
  const allPlayers = [...homePlayers, ...awayPlayers];

  const statByPlayer = Object.fromEntries(stats.map((s) => [s.player_id, s]));

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl text-ink">
        {match.home_team?.name} vs {match.away_team?.name}
      </h1>

      <div className="flex flex-wrap gap-8">
        <form action={saveScoreFromForm.bind(null, match.id)} className="flex items-end gap-3">
          <label className="text-sm">
            {match.home_team?.name}
            <input
              type="number"
              name="home_score"
              defaultValue={match.home_score}
              min={0}
              className="block w-16 border border-[#DAD6C8] px-2 py-1 mt-1"
            />
          </label>
          <label className="text-sm">
            {match.away_team?.name}
            <input
              type="number"
              name="away_score"
              defaultValue={match.away_score}
              min={0}
              className="block w-16 border border-[#DAD6C8] px-2 py-1 mt-1"
            />
          </label>
          <button className="bg-pitch text-bone text-sm px-3 py-1.5">Save score</button>
        </form>

        <form action={saveMotmFromForm.bind(null, match.id)} className="flex items-end gap-3">
          <label className="text-sm">
            Man of the Match
            <select
              name="motm_player_id"
              defaultValue={match.motm_player_id ?? ""}
              className="block border border-[#DAD6C8] px-2 py-1 mt-1 min-w-[12rem]"
            >
              <option value="">—</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.kit_no})
                </option>
              ))}
            </select>
          </label>
          <button className="bg-pitch text-bone text-sm px-3 py-1.5">Save</button>
        </form>
      </div>

      <PlayerStatForms
        title={match.home_team?.name ?? "Home"}
        players={homePlayers}
        matchId={match.id}
        statByPlayer={statByPlayer}
      />
      <PlayerStatForms
        title={match.away_team?.name ?? "Away"}
        players={awayPlayers}
        matchId={match.id}
        statByPlayer={statByPlayer}
      />
    </div>
  );
}

function PlayerStatForms({
  title,
  players,
  matchId,
  statByPlayer,
}: {
  title: string;
  players: Player[];
  matchId: string;
  statByPlayer: Record<string, MatchStat>;
}) {
  return (
    <section>
      <h2 className="font-display text-lg text-turf mb-3">{title}</h2>
      <div className="space-y-4">
        {players.map((player) => {
          const s = statByPlayer[player.id];
          return (
            <form
              key={player.id}
              action={saveStatFromForm.bind(null, matchId, player.id)}
              className="border border-[#DAD6C8] p-3 flex flex-wrap items-end gap-3"
            >
              <span className="text-sm font-medium w-32">
                #{player.kit_no} {player.name}
              </span>
              {FIELDS.map((f) => (
                <label key={f.key} className="text-xs w-16">
                  {f.label}
                  <input
                    type="number"
                    name={f.key}
                    min={0}
                    defaultValue={s ? (s[f.key] as number) : 0}
                    className="block w-full border border-[#DAD6C8] px-1.5 py-1 mt-0.5"
                  />
                </label>
              ))}
              <label className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  name="clean_sheet"
                  defaultChecked={s?.clean_sheet ?? false}
                />
                Clean sheet
              </label>
              <button className="bg-turf text-bone text-xs px-3 py-1.5 self-end">
                Save
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
