import Link from "next/link";
import { getStandings } from "@/lib/data";

export const revalidate = 0;

export default async function GroupsPage() {
  const standings = await getStandings();

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-ink">Group Stage</h1>
      {(["A", "B"] as const).map((group) => (
        <section key={group}>
          <h2 className="font-display text-xl text-turf mb-3">Group {group}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {standings[group].map((row) => (
              <li key={row.team.id}>
                <Link
                  href={`/standings#${row.team.id}`}
                  className="flex justify-between py-1.5 border-b border-[#DAD6C8]"
                >
                  <span>{row.team.name}</span>
                  <span className="tabular-nums text-[#5B6B62]">
                    {row.points} pts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
