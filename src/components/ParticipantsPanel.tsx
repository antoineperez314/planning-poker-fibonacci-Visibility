import { Crown, Radio, UserRoundCheck } from "lucide-react";
import { clsx } from "clsx";
import { VoteBackCard } from "@/components/PokerCard";
import type { Participant } from "@/types/planning";

export function ParticipantsPanel({
  participants,
  revealed,
  outliers,
}: {
  participants: Participant[];
  revealed: boolean;
  outliers: Set<string>;
}) {
  return (
    <div className="grid gap-3">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={clsx(
            "grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border bg-white p-3 shadow-sm",
            outliers.has(participant.id) ? "border-rose-200" : "border-slate-100",
          )}
        >
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-semibold text-slate-900">{participant.name}</span>
              {participant.role === "host" && <Crown className="size-4 text-[#0078ff]" />}
              <span className={clsx("size-2 rounded-full", participant.connected ? "bg-emerald-400" : "bg-slate-300")} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              {participant.hasVoted ? <UserRoundCheck className="size-3.5 text-emerald-500" /> : <Radio className="size-3.5 text-slate-400" />}
              {participant.hasVoted ? "a vote" : "en attente"}
            </div>
          </div>
          <VoteBackCard revealed={revealed} value={participant.vote} outlier={outliers.has(participant.id)} />
        </div>
      ))}
    </div>
  );
}
