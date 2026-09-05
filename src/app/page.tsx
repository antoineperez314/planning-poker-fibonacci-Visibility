"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Link2,
  Moon,
  Plus,
  Radio,
  Sparkles,
  Sun,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PokerTable } from "@/components/PokerTable";
import { ResultsPanel } from "@/components/ResultsPanel";
import { Button, Field, Input, Panel } from "@/components/ui";
import { usePlanningSocket } from "@/hooks/usePlanningSocket";
import { FIBONACCI_CARDS } from "@/lib/constants";
import { calculateStats } from "@/lib/stats";

type Screen = "home" | "create" | "join" | "room";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [localSelectedVote, setLocalSelectedVote] = useState<string | null>(null);
  const [localSelectedRound, setLocalSelectedRound] = useState<number | null>(null);
  const [voteAnimationKey, setVoteAnimationKey] = useState(0);
  const [createForm, setCreateForm] = useState({
    name: "",
    selectedCards: FIBONACCI_CARDS,
  });
  const [joinForm, setJoinForm] = useState({ code: "", name: "" });
  const {
    connected,
    room,
    joinState,
    error,
    closed,
    createSession,
    joinSession,
    actions,
  } = usePlanningSocket();

  const isHost = joinState?.role === "host";
  const currentStory = room?.stories[room.currentStoryIndex];
  const inviteUrl = room ? `${globalThis.location?.origin || ""}/?session=${encodeURIComponent(room.code)}` : "";
  const stats = room ? calculateStats(room.participants, room.cards) : null;
  const hasAtLeastOneVote = Boolean(room?.participants.some((participant) => participant.hasVoted));
  const selectedVote = useMemo(() => {
    const serverVote = room?.participants.find((participant) => participant.id === joinState?.participantId)?.vote ?? null;
    if (room?.revealed) return serverVote;
    return localSelectedRound === room?.round ? localSelectedVote : null;
  }, [joinState?.participantId, localSelectedRound, localSelectedVote, room?.participants, room?.revealed, room?.round]);

  useEffect(() => {
    const sessionCode = new URLSearchParams(window.location.search).get("session")?.trim();
    if (!sessionCode) return;

    const timer = window.setTimeout(() => {
      setJoinForm((form) => ({ ...form, code: sessionCode.toUpperCase() }));
      setScreen("join");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleCreate() {
    if (!createForm.name.trim() || createForm.selectedCards.length < 2) return;
    const ok = await createSession(createForm);
    if (ok) {
      setScreen("room");
    }
  }

  async function handleJoin() {
    if (!joinForm.code.trim() || !joinForm.name.trim()) return;
    const ok = await joinSession(joinForm);
    if (ok) setScreen("room");
  }

  function copyInvite() {
    if (inviteUrl) navigator.clipboard.writeText(inviteUrl);
  }

  function castVote(value: string) {
    setLocalSelectedVote(value);
    setLocalSelectedRound(room?.round ?? null);
    setVoteAnimationKey((key) => key + 1);
    actions.vote(value);
    if (sound) {
      const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
      audio.volume = 0.08;
      audio.play().catch(() => undefined);
    }
  }

  const shellClass = darkMode ? "dark" : "";

  return (
    <main className={shellClass}>
      <div className="min-h-screen bg-[#eef7fb] text-slate-900 transition dark:bg-[#071329] dark:text-slate-100">
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(120deg,#08245c_0%,#0078ff_48%,#21d4d4_78%,#ff8a00_100%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-white text-[#08245c] shadow-lg">
                <Radio className="size-6" />
              </div>
              <div>
                <div className="text-lg font-black">Poker Planning</div>
                <div className="text-xs font-medium text-cyan-100">Agile Fibonacci Poker</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setSound((value) => !value)} title="Son">
                {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setDarkMode((value) => !value)} title="Theme">
                {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>
            </div>
          </header>

          {screen !== "room" && (
            <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_460px]">
              <div className="pt-10 text-white lg:pt-20">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200/40 bg-white/16 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 backdrop-blur">
                  <Sparkles className="size-4 text-orange-200" />
                  V1 temps reel sans compte
                </div>
                <h1 className="hero-title-blue max-w-3xl text-5xl font-black leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.65)] sm:text-6xl">
                  Poker Planning
                </h1>
                <p className="hero-subtitle-blue mt-5 inline-block max-w-2xl rounded-lg bg-white/82 px-4 py-3 text-xl font-semibold leading-8 shadow-lg shadow-blue-950/15 backdrop-blur">
                  Estimez vos User Stories rapidement, simplement et en equipe.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => setScreen("create")}>
                    <Plus className="size-5" />
                    Creer une session
                  </Button>
                  <Button variant="secondary" onClick={() => setScreen("join")}>
                    <Users className="size-5" />
                    Rejoindre une session
                  </Button>
                </div>
              </div>

              <Panel className="self-center">
                {screen === "home" && (
                  <div className="grid gap-5">
                    <div>
                      <h2 className="text-2xl font-black text-[#08245c]">Salle de refinement moderne</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Creez une salle, invitez votre equipe, votez en Fibonacci et revelez les cartes au bon moment.
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {FIBONACCI_CARDS.slice(1, 9).map((card) => (
                        <div key={card} className="grid aspect-[3/4] place-items-center rounded-lg bg-cyan-50 text-xl font-black text-[#0078ff] shadow-sm">
                          {card}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {screen === "create" && (
                  <div className="grid gap-4">
                    <h2 className="text-2xl font-black text-[#08245c]">Creer une session</h2>
                    <Field label="Nom de la session">
                      <Input value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} />
                    </Field>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-slate-700">Cartes utilisees</div>
                      <div className="flex flex-wrap gap-2">
                        {FIBONACCI_CARDS.map((card) => {
                          const active = createForm.selectedCards.includes(card);
                          return (
                            <button
                              key={card}
                              type="button"
                              onClick={() =>
                                setCreateForm((form) => ({
                                  ...form,
                                  selectedCards: active ? form.selectedCards.filter((item) => item !== card) : [...form.selectedCards, card],
                                }))
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                                active ? "border-cyan-300 bg-cyan-50 text-[#0078ff]" : "border-slate-200 text-slate-400"
                              }`}
                            >
                              {card}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setScreen("home")}>Retour</Button>
                      <Button className="flex-1" onClick={handleCreate} disabled={!connected}>
                        Creer la session
                      </Button>
                    </div>
                  </div>
                )}

                {screen === "join" && (
                  <div className="grid gap-4">
                    <h2 className="text-2xl font-black text-[#08245c]">Rejoindre une session</h2>
                    <Field label="Code ou nom de la session">
                      <Input value={joinForm.code} onChange={(event) => setJoinForm({ ...joinForm, code: event.target.value })} placeholder="Planning equipe" />
                    </Field>
                    <Field label="Prenom ou pseudo">
                      <Input value={joinForm.name} onChange={(event) => setJoinForm({ ...joinForm, name: event.target.value })} placeholder="Sarah" />
                    </Field>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setScreen("home")}>Retour</Button>
                      <Button className="flex-1" onClick={handleJoin} disabled={!connected}>
                        Entrer dans la salle
                      </Button>
                    </div>
                  </div>
                )}

                {(error || closed) && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{closed ? "La session a ete fermee." : error}</p>}
              </Panel>
            </section>
          )}

          {screen === "room" && room && currentStory && stats && (
            <section className="grid gap-5 py-6 xl:grid-cols-[1fr_340px]">
              <div className="grid content-start gap-5">
                <PokerTable
                  participants={room.participants}
                  revealed={room.revealed}
                  outliers={stats.outliers}
                  isHost={isHost}
                  canReveal={hasAtLeastOneVote}
                  onReveal={actions.reveal}
                  onNewRound={() => actions.newRound()}
                  onInviteClick={() => setShowInvite((visible) => !visible)}
                  onBackHome={() => {
                    setShowInvite(false);
                    setScreen("home");
                  }}
                  cards={room.cards}
                  selectedVote={selectedVote}
                  voteAnimationKey={voteAnimationKey}
                  onVote={castVote}
                />
              </div>

              <aside className="grid content-start gap-5">
                {room.revealed && <ResultsPanel room={room} isHost={isHost} onFinalize={actions.finalize} />}
              </aside>
            </section>
          )}

          {showInvite && room && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-blue-950/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
              <div className="w-full max-w-md rounded-lg border border-white/80 bg-white p-5 shadow-2xl shadow-blue-950/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#08245c]">
                    <Link2 className="size-5 text-[#0078ff]" />
                    <h2 className="text-lg font-black">Invitation</h2>
                  </div>
                  <Button variant="ghost" onClick={() => setShowInvite(false)}>
                    Fermer
                  </Button>
                </div>
                <div className="mt-5 grid place-items-center rounded-lg bg-cyan-50 p-5">
                  <QRCodeSVG value={inviteUrl || room.code} size={180} fgColor="#08245c" />
                </div>
                <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-lg font-black text-[#08245c]">
                  {room.code}
                </div>
                <Button className="mt-4 w-full" variant="secondary" onClick={copyInvite}>
                  Copier le lien
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
