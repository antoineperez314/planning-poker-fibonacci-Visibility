import { ArrowLeft, Crown, Link2, RotateCcw, Users } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui";
import { PokerCard, VoteBackCard } from "@/components/PokerCard";
import type { Participant, VoteValue } from "@/types/planning";

export function PokerTable({
  participants,
  revealed,
  outliers,
  isHost,
  canReveal,
  onReveal,
  onNewRound,
  onInviteClick,
  onBackHome,
  cards,
  selectedVote,
  voteAnimationKey,
  onVote,
}: {
  participants: Participant[];
  revealed: boolean;
  outliers: Set<string>;
  isHost?: boolean;
  canReveal: boolean;
  onReveal: () => void;
  onNewRound: () => void;
  onInviteClick: () => void;
  onBackHome: () => void;
  cards: VoteValue[];
  selectedVote: VoteValue | null;
  voteAnimationKey: number;
  onVote: (value: VoteValue) => void;
}) {
  const votedCount = participants.filter((participant) => participant.hasVoted).length;
  const centerX = 50;
  const centerY = 50;
  const radiusX = 42;
  const radiusY = 36;

  return (
    <section className="relative overflow-hidden rounded-lg border border-cyan-100 bg-[radial-gradient(circle_at_center,#e9fbff_0%,#f8fbff_46%,#d9ecff_88%,#fff3e0_100%)] p-2.5 shadow-xl shadow-blue-950/8 ring-1 ring-orange-100 dark:border-cyan-900 dark:bg-[radial-gradient(circle_at_center,#0b2a40_0%,#0b1730_48%,#061022_100%)] dark:shadow-black/30 dark:ring-cyan-950">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-[#08245c] dark:text-cyan-50">Table de vote</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {votedCount} carte{votedCount > 1 ? "s" : ""} posee{votedCount > 1 ? "s" : ""} sur la table
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBackHome}>
            <ArrowLeft className="size-4" />
            Menu
          </Button>
          <Button variant="secondary" onClick={onInviteClick}>
            <Link2 className="size-4" />
            Copier
          </Button>
          <Button variant="secondary" onClick={onReveal} disabled={revealed || !canReveal}>
            Retourner les cartes
          </Button>
          {isHost && (
            <>
              <Button className="w-11 px-0" variant="secondary" onClick={onNewRound} title="Nouvelle estimation">
                <RotateCcw className="size-4" />
              </Button>
            </>
          )}
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#0078ff] shadow-sm dark:bg-slate-900 dark:text-cyan-100">
            <Users className="size-4" />
            {participants.length}
          </div>
        </div>
      </div>

      <div className="relative mx-auto min-h-[300px] w-full max-w-4xl sm:min-h-[345px]">
        <div className="absolute left-1/2 top-1/2 grid h-32 w-[54%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[999px] border border-orange-200 bg-[linear-gradient(135deg,#073b7a,#0078ff_52%,#16c7d9_78%,#ff8a00)] shadow-2xl shadow-blue-950/20 sm:h-40 sm:w-[44%]">
          <div className="grid h-[72%] w-[80%] place-items-center rounded-[999px] border border-white/25 bg-white/10 text-center text-white shadow-inner">
            <div>
              <div className="text-xl font-black sm:text-2xl">Poker Planning</div>
              <div className="mt-1 text-xs font-semibold text-cyan-100">Cartes cachees jusqu&apos;a la revelation</div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0">
          {participants.map((participant, index) => {
            const angle = -90 + (360 / Math.max(participants.length, 1)) * index;
            const x = centerX + radiusX * Math.cos((angle * Math.PI) / 180);
            const y = centerY + radiusY * Math.sin((angle * Math.PI) / 180);

            return (
            <div
              key={participant.id}
              className={clsx(
                "absolute z-10 grid w-36 -translate-x-1/2 -translate-y-1/2 content-between rounded-lg border bg-white/94 p-2.5 shadow-lg backdrop-blur transition duration-300 dark:bg-slate-950/94 sm:w-40",
                participant.hasVoted && "animate-card-place border-orange-200 shadow-orange-500/15 dark:border-orange-300/70",
                outliers.has(participant.id) ? "border-rose-300 ring-4 ring-rose-100 dark:ring-rose-900/70" : "border-white dark:border-cyan-900",
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${Math.min(index * 45, 240)}ms`,
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-black text-[#08245c] dark:text-cyan-50">{participant.name}</span>
                    {participant.role === "host" && <Crown className="size-4 text-[#0078ff]" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold">
                    <span className={clsx("size-2 rounded-full", participant.connected ? "bg-emerald-400" : "bg-slate-300")} />
                    <span className={participant.hasVoted ? "text-emerald-600" : "text-slate-400"}>
                      {participant.hasVoted ? "a choisi" : "reflechit"}
                    </span>
                  </div>
                </div>
                <VoteBackCard revealed={revealed} value={participant.vote} outlier={outliers.has(participant.id)} />
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={clsx("h-full rounded-full transition-all duration-500", participant.hasVoted ? "w-full bg-cyan-400" : "w-1/4 bg-slate-200")} />
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-cyan-100 pt-1.5 dark:border-cyan-900">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h2 className="text-xs font-black uppercase text-[#08245c] dark:text-cyan-50">Choisissez votre carte</h2>
          {revealed && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">Cartes revelees</span>}
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
          {cards.map((card) => (
            <PokerCard
              key={`${card}-${selectedVote === card ? voteAnimationKey : "idle"}`}
              value={card}
              selected={selectedVote === card}
              animate={selectedVote === card}
              disabled={revealed}
              onClick={() => onVote(card)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
