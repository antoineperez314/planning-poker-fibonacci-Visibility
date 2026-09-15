import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-[#0078ff] text-white shadow-lg shadow-cyan-500/20 hover:bg-[#0066da]",
        variant === "secondary" && "border border-cyan-200/70 bg-white text-[#073b7a] shadow-sm shadow-orange-500/5 hover:border-orange-300 hover:bg-orange-50 dark:border-cyan-700/70 dark:bg-slate-900 dark:text-cyan-100 dark:hover:border-orange-300 dark:hover:bg-slate-800",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 dark:text-cyan-100 dark:hover:bg-white/10",
        variant === "danger" && "bg-rose-500 text-white hover:bg-rose-600",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-cyan-100">
      {label}
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-900/70",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-900/70",
        props.className,
      )}
    />
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx("rounded-lg border border-white/70 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur ring-1 ring-orange-100/50 dark:border-cyan-800/60 dark:bg-slate-950/88 dark:shadow-black/30 dark:ring-cyan-900/60", className)}>{children}</section>;
}

export function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-4 dark:border-cyan-800 dark:bg-cyan-950/40">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[#08245c] dark:text-cyan-50">{value}</div>
    </div>
  );
}
