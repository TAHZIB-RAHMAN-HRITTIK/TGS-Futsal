import { getTeams, getPlayers } from "@/lib/data";

export const revalidate = 0;

export default async function TeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()]);

  const playersByTeam = players.reduce<Record<string, typeof players>>(
    (acc, p) => {
      (acc[p.team_id] ??= []).push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-ink">Teams &amp; Squads</h1>
      {(["A", "B"] as const).map((group) => (
        <section key={group}>
          <h2 className="font-display text-xl text-turf mb-4">Group {group}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {teams
              .filter((t) => t.group_name === group)
              .map((team) => (
                <div key={team.id}>
                  <h3 className="font-display text-lg text-ink border-b-2 border-ink pb-1 mb-1">
                    {team.name}
                  </h3>
                  <ul className="divide-y divide-[#DAD6C8] text-sm">
                    {(playersByTeam[team.id] ?? []).map((p) => (
                      <li key={p.id} className="py-1.5">
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
