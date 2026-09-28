import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchById, getPlayers } from "@/lib/data";
import { saveAllMatchData, updateMatchStatus } from "@/lib/actions";
import { homeName, awayName } from "@/lib/labels";
import SavedBanner from "@/components/SavedBanner";
import type { Player, MatchStat } from "@/lib/types";

export const revalidate = 0;

const STATS = [
  { key: "goals",        label: "G"   },
  { key: "assists",      label: "A"   },
  { key: "through_cross",label: "T/C" },
  { key: "tackles_won",  label: "TW"  },
  { key: "interceptions",label: "INT" },
  { key: "saves",        label: "SV"  },
  { key: "fouls",        label: "FL"  },
  { key: "yellow_cards", label: "YC"  },
  { key: "red_cards",    label: "RC"  },
] as const;
type StatKey = (typeof STATS)[number]["key"];

function val(stat: MatchStat | undefined, key: StatKey): number {
  return stat ? ((stat[key as keyof MatchStat] as number) ?? 0) : 0;
}

export default async function AdminMatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string>;
}) {
  const data = await getMatchById(params.id);
  if (!data) notFound();
  const { match, stats } = data;

  const [homePlayers, awayPlayers] = await Promise.all([
    match.home_team_id
      ? getPlayers(match.home_team_id)
      : Promise.resolve<Player[]>([]),
    match.away_team_id
      ? getPlayers(match.away_team_id)
      : Promise.resolve<Player[]>([]),
  ]);
  const allPlayers = [...homePlayers, ...awayPlayers];
  const statById = Object.fromEntries(stats.map((s) => [s.player_id, s]));

  // GK = kit_no 1 per team
  const homeGk = homePlayers.find((p) => p.kit_no === 1);
  const awayGk = awayPlayers.find((p) => p.kit_no === 1);
  const homeCs = homeGk ? (statById[homeGk.id]?.clean_sheet ?? false) : false;
  const awayCs = awayGk ? (statById[awayGk.id]?.clean_sheet ?? false) : false;

  return (
    <div className="space-y-6">
      <SavedBanner show={searchParams.saved === "1"} />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/dashboard" className="text-sm text-turf hover:underline">
          ← Dashboard
        </Link>
        <h1 className="font-display text-xl text-ink">
          {homeName(match)} vs {awayName(match)}
        </h1>
      </div>

      {/* Status — instant, separate forms so no "Save All" needed */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[#5B6B62] uppercase tracking-wide">
          Match status:
        </span>
        {(["upcoming", "live", "completed"] as const).map((status) => (
          <form key={status} action={updateMatchStatus.bind(null, match.id, status)}>
            <button
              type="submit"
              className={`px-3 py-1 text-xs border transition-colors ${
                match.status === status
                  ? "bg-pitch text-bone border-pitch font-semibold"
                  : "border-[#D6E3EC] hover:border-pitch"
              }`}
            >
              {status === "live" ? "🔴 Live" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          </form>
        ))}
      </div>

      {/* ── MAIN FORM: everything saved with ONE button ── */}
      <form action={saveAllMatchData.bind(null, match.id)} className="space-y-8">

        {/* Score + MOTM */}
        <div className="bg-card p-5 flex flex-wrap items-end gap-6">
          <div className="flex items-end gap-3">
            <label className="text-sm font-medium">
              {homeName(match)}
              <input
                type="number" name="home_score" min={0}
                defaultValue={match.home_score}
                className="block w-16 border border-[#D6E3EC] text-center px-2 py-1.5 mt-1 font-display text-2xl"
              />
            </label>
            <span className="font-display text-3xl pb-1.5 text-[#5B6B62]">–</span>
            <label className="text-sm font-medium">
              {awayName(match)}
              <input
                type="number" name="away_score" min={0}
                defaultValue={match.away_score}
                className="block w-16 border border-[#D6E3EC] text-center px-2 py-1.5 mt-1 font-display text-2xl"
              />
            </label>
          </div>
          <label className="text-sm font-medium">
            Man of the Match ⭐
            <select
              name="motm_player_id"
              defaultValue={match.motm_player_id ?? ""}
              className="block border border-[#D6E3EC] px-2 py-1.5 mt-1 min-w-[14rem] text-sm"
            >
              <option value="">— None —</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Team stat tables */}
        <TeamSection
          title={homeName(match)}
          players={homePlayers}
          statById={statById}
          gk={homeGk}
          csName="home_clean_sheet"
          gkHidden="home_gk_id"
          defaultCs={homeCs}
        />
        <TeamSection
          title={awayName(match)}
          players={awayPlayers}
          statById={statById}
          gk={awayGk}
          csName="away_clean_sheet"
          gkHidden="away_gk_id"
          defaultCs={awayCs}
        />

        {/* Single save button */}
        <div className="sticky bottom-0 bg-white border-t border-[#D6E3EC] py-4 flex justify-end">
          <button
            type="submit"
            className="bg-pitch text-bone px-10 py-3 font-semibold text-sm hover:bg-pitch-dark transition-colors"
          >
            💾  Save All Data
          </button>
        </div>
      </form>
    </div>
  );
}

function TeamSection({
  title, players, statById, gk, csName, gkHidden, defaultCs,
}: {
  title: string;
  players: Player[];
  statById: Record<string, MatchStat>;
  gk: Player | undefined;
  csName: string;
  gkHidden: string;
  defaultCs: boolean;
}) {
  if (players.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-lg text-turf">{title}</h2>
        {/* ONE clean sheet tick per team — goes to GK only */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none bg-card px-3 py-1.5">
          <input
            type="checkbox" name={csName} defaultChecked={defaultCs}
            className="w-4 h-4 accent-turf"
          />
          <span>
            Clean Sheet{" "}
            <span className="text-[#5B6B62] text-xs">
              → GK: {gk?.name ?? "kit #1"}
            </span>
          </span>
          {gk && <input type="hidden" name={gkHidden} value={gk.id} />}
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left font-semibold text-[#5B6B62] text-xs py-2 pr-4 whitespace-nowrap">
                Player
              </th>
              {STATS.map((s) => (
                <th key={s.key} className="text-[#5B6B62] text-xs py-2 px-1 w-10 text-center font-semibold">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-b border-[#D6E3EC] hover:bg-card">
                <input type="hidden" name="player_ids" value={p.id} />
                <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                  {p.name}
                  {p.kit_no === 1 && (
                    <span className="ml-1.5 text-[10px] text-turf font-semibold">[GK]</span>
                  )}
                </td>
                {STATS.map((s) => (
                  <td key={s.key} className="px-0.5 py-1">
                    <input
                      type="number"
                      name={`${p.id}_${s.key}`}
                      min={0}
                      defaultValue={val(statById[p.id], s.key)}
                      className="w-10 border border-[#D6E3EC] text-center px-0.5 py-1 text-sm focus:border-turf focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
