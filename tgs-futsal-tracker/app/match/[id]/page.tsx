import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/data";
import { calculateRating } from "@/lib/ratings";
import StatusBadge from "@/components/StatusBadge";
import LiveRefresher from "@/components/LiveRefresher";
import type { MatchStat } from "@/lib/types";

export const revalidate = 0;

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const data = await getMatchById(params.id);
  if (!data) notFound();
  const { match, stats } = data;

  const homeStats = stats.filter((s) => s.player?.team_id === match.home_team_id);
  const awayStats = stats.filter((s) => s.player?.team_id === match.away_team_id);

  return (
    <div className="space-y-8">
      <LiveRefresher />

      <section className="text-center border-b border-[#DAD6C8] pb-6">
        <p className="text-xs uppercase tracking-wide text-[#5B6B62] mb-2">
          {match.stage === "group" ? `Group ${match.group_name}` : match.stage} ·{" "}
          {formatKickoff(match.kickoff_at)}
        </p>
        <div className="flex items-center justify-center gap-6 font-display text-3xl sm:text-4xl text-ink">
          <span className="text-right w-40 sm:w-56 truncate">{match.home_team?.name}</span>
          <span className="tabular-nums">
            {match.status === "upcoming" ? "vs" : `${match.home_score} – ${match.away_score}`}
          </span>
          <span className="text-left w-40 sm:w-56 truncate">{match.away_team?.name}</span>
        </div>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={match.status} />
        </div>
        {match.motm_player && (
          <p className="mt-3 text-sm text-amber-700">
            Man of the Match: <span className="font-semibold">{match.motm_player.name}</span>
          </p>
        )}
      </section>

      {stats.length > 0 ? (
        <>
          <TeamStatTable
            teamName={match.home_team?.name ?? "Home"}
            stats={homeStats}
            motmId={match.motm_player_id}
          />
          <TeamStatTable
            teamName={match.away_team?.name ?? "Away"}
            stats={awayStats}
            motmId={match.motm_player_id}
          />
        </>
      ) : (
        <p className="text-sm text-[#5B6B62]">
          Player stats will appear here once the match starts.
        </p>
      )}
    </div>
  );
}

function TeamStatTable({
  teamName,
  stats,
  motmId,
}: {
  teamName: string;
  stats: MatchStat[];
  motmId: string | null;
}) {
  return (
    <section>
      <h2 className="font-display text-xl text-turf mb-3">{teamName}</h2>
      <div className="overflow-x-auto">
        <table className="stat-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Player</th>
              <th>G</th>
              <th>A</th>
              <th>T/C</th>
              <th>TW</th>
              <th>INT</th>
              <th>SV</th>
              <th>FL</th>
              <th>YC</th>
              <th>RC</th>
              <th>CS</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stats
              .sort((a, b) => (a.player?.kit_no ?? 0) - (b.player?.kit_no ?? 0))
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.player?.kit_no}</td>
                  <td className="font-medium">
                    {s.player?.name}
                    {s.player_id === motmId && (
                      <span className="ml-1.5 text-amber-600" title="Man of the Match">
                        ★
                      </span>
                    )}
                  </td>
                  <td>{s.goals}</td>
                  <td>{s.assists}</td>
                  <td>{s.through_cross}</td>
                  <td>{s.tackles_won}</td>
                  <td>{s.interceptions}</td>
                  <td>{s.saves}</td>
                  <td>{s.fouls}</td>
                  <td>{s.yellow_cards}</td>
                  <td>{s.red_cards}</td>
                  <td>{s.clean_sheet ? "✓" : ""}</td>
                  <td className="font-semibold tabular-nums">
                    {calculateRating(s, s.player_id === motmId)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
