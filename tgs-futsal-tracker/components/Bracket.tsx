import Link from "next/link";
import type { Match } from "@/lib/types";
import { homeName, awayName } from "@/lib/labels";
import { matchWinner } from "@/lib/knockouts";
import StatusBadge from "./StatusBadge";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamRow({
  name, score, pens, show, won, decided,
}: {
  name: string; score: number; pens: number | null; show: boolean; won: boolean; decided: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2 ${
        won ? "font-semibold text-ink" : decided ? "text-[#5B6B62]" : "text-ink"
      }`}
    >
      <span className="truncate">{name}</span>
      {show && (
        <span className="font-display tabular-nums">
          {score}
          {pens != null && <span className="text-xs font-sans text-[#5B6B62]"> ({pens})</span>}
        </span>
      )}
    </div>
  );
}

function BracketMatch({ match, title }: { match?: Match; title: string }) {
  if (!match) {
    return (
      <div className="border border-dashed border-[#D6E3EC] px-3 py-4 text-sm text-[#5B6B62]">
        {title} — not scheduled yet
      </div>
    );
  }
  const winner = matchWinner(match);
  const show = match.status !== "upcoming";
  const pens = match.home_penalties != null && match.away_penalties != null;
  return (
    <Link
      href={`/match/${match.id}`}
      className="block border border-[#D6E3EC] bg-white hover:border-sky transition-colors"
    >
      <div className="flex items-center justify-between gap-2 bg-card px-3 py-1.5 text-xs">
        <span className="font-semibold uppercase tracking-wide text-turf">
          {title} · {formatKickoff(match.kickoff_at)}
        </span>
        <StatusBadge status={match.status} />
      </div>
      <div className="divide-y divide-[#D6E3EC] text-sm">
        <TeamRow
          name={homeName(match)} score={match.home_score}
          pens={pens ? match.home_penalties : null} show={show}
          won={!!winner && winner.id === match.home_team?.id} decided={!!winner}
        />
        <TeamRow
          name={awayName(match)} score={match.away_score}
          pens={pens ? match.away_penalties : null} show={show}
          won={!!winner && winner.id === match.away_team?.id} decided={!!winner}
        />
      </div>
    </Link>
  );
}

/** Semi-finals → final, with the winner of each tie highlighted. */
export default function Bracket({ matches }: { matches: Match[] }) {
  const semis = matches
    .filter((m) => m.stage === "semi")
    .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime());
  const final = matches.find((m) => m.stage === "final");
  const champion = final && matchWinner(final);

  return (
    <section>
      <h2 className="font-display text-xl text-turf mb-3">Road to the Final</h2>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="space-y-4">
          <BracketMatch match={semis[0]} title="Semi-Final 1" />
          <BracketMatch match={semis[1]} title="Semi-Final 2" />
        </div>
        <div aria-hidden="true" className="hidden md:block text-2xl text-sky">→</div>
        <div className="space-y-3">
          <BracketMatch match={final} title="Final" />
          {champion && (
            <p className="text-center text-sm font-semibold text-ink">
              🏆 Champions: {champion.name}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
