import { getPlayerLeaderboard, getTeams } from "@/lib/data";
import LiveRefresher from "@/components/LiveRefresher";

export const revalidate = 0;

export default async function SquadsPage() {
  const [teams, rows] = await Promise.all([getTeams(), getPlayerLeaderboard()]);

  const squadFor = (teamId: string) =>
    rows
      .filter((r) => r.player.team_id === teamId)
      .sort((a, b) => a.player.kit_no - b.player.kit_no);

  return (
    <div className="space-y-10">
      <LiveRefresher />
      <div>
        <h1 className="font-display text-3xl text-ink">Squads</h1>
        <p className="text-xs text-[#5B6B62] mt-1">
          G = goals, A = assists (tournament totals, updated live).
        </p>
      </div>

      {(["A", "B"] as const).map((group) => (
        <section key={group}>
          <h2 className="font-display text-xl text-turf mb-4">Group {group}</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {teams
              .filter((t) => t.group_name === group)
              .map((team) => (
                <div key={team.id} id={team.id}>
                  <h3 className="font-display text-lg text-ink mb-2">{team.name}</h3>
                  <table className="stat-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Player</th>
                        <th>G</th>
                        <th>A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {squadFor(team.id).map((r) => (
                        <tr key={r.player.id}>
                          <td>{r.player.kit_no}</td>
                          <td className="font-medium">{r.player.name}</td>
                          <td>{r.goals}</td>
                          <td>{r.assists}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
