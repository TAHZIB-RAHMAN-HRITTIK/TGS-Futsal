import { getStandings } from "@/lib/data";
import LiveRefresher from "@/components/LiveRefresher";
import type { StandingRow } from "@/lib/types";

export const revalidate = 0;

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="space-y-10">
      <LiveRefresher />
      <h1 className="font-display text-3xl text-ink">Table Standing</h1>
      {(["A", "B"] as const).map((group) => (
        <section key={group} id={group}>
          <h2 className="font-display text-xl text-turf mb-3">Group {group}</h2>
          <StandingsTable rows={standings[group]} />
        </section>
      ))}
      <p className="text-xs text-[#5B6B62]">
        Top 2 from each group advance to the semi-finals. Ties broken by goal
        difference, then goals scored.
      </p>
    </div>
  );
}

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="stat-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.team.id} id={row.team.id}>
              <td>{i + 1}</td>
              <td className="font-medium">{row.team.name}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.goals_for}</td>
              <td>{row.goals_against}</td>
              <td>{row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}</td>
              <td className="font-semibold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
