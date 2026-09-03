import { Coffee } from "lucide-react";
import { clsx } from "clsx";
import type { VoteValue } from "@/types/planning";

export function PokerCard({
  value,
  selected,
  disabled,
  animate,
  onClick,
}: {
  value: VoteValue;
  selected?: boolean;
  disabled?: boolean;
  animate?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "group relative grid aspect-[3/4] max-h-18 w-full min-w-0 place-items-center rounded-md border text-center shadow-md transition duration-200",
        "hover:-translate-y-1 hover:shadow-cyan-400/25 active:scale-95 disabled:hover:translate-y-0",
        animate && "animate-card-select",
        selected
          ? "border-orange-300 bg-[#0078ff] text-white shadow-orange-500/30 ring-4 ring-orange-200"
          : "border-cyan-100 bg-white text-[#08245c]",
      )}
      aria-label={`Voter ${value}`}
    >
      <span className="grid size-8 place-items-center rounded-full bg-cyan-50 text-lg font-black text-inherit group-hover:bg-cyan-100 sm:size-9 sm:text-xl">
        {value === "cafe" ? <Coffee className="size-5" /> : value}
      </span>
    </button>
  );
}

export function VoteBackCard({ revealed, value, outlier }: { revealed: boolean; value: VoteValue | null; outlier?: boolean }) {
  return (
    <div className="h-16 w-11 [perspective:900px]">
      <div
        className={clsx(
          "relative size-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d]",
          revealed && "[transform:rotateY(180deg)]",
        )}
      >
        <div className="absolute inset-0 grid place-items-center rounded-lg border border-cyan-200 bg-[#08245c] text-cyan-200 shadow-md [backface-visibility:hidden]">
          <span className="text-sm font-black">BT</span>
        </div>
        <div
          className={clsx(
            "absolute inset-0 grid place-items-center rounded-lg border bg-white text-base font-black text-[#08245c] shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]",
            outlier ? "border-rose-300 ring-4 ring-rose-100" : "border-cyan-200",
          )}
        >
          {value === "cafe" ? <Coffee className="size-5" /> : value ?? "-"}
        </div>
      </div>
    </div>
  );
}
