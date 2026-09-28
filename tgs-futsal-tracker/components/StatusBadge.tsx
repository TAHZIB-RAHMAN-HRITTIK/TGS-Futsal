import type { MatchStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-alert text-xs font-semibold">
        <span className="live-dot" aria-hidden="true" />
        LIVE
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="text-xs font-semibold text-[#5B6B62]">FULL-TIME</span>
    );
  }
  return (
    <span className="text-xs font-semibold text-turf">UPCOMING</span>
  );
}
