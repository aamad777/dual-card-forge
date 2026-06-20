import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { CommandCard } from "@/lib/cards";
import { loadCards, loadProgress, saveProgress, awardAnswer } from "@/lib/storage";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "Duel Mode — CmdDeck" },
      { name: "description", content: "Boss fight: pick the right command to damage the bug boss." },
    ],
  }),
  component: DuelPage,
});

const BOSSES = [
  { name: "The Segfault", emoji: "👾", hp: 200 },
  { name: "Kernel Panic", emoji: "💀", hp: 280 },
  { name: "The Null Pointer", emoji: "🦠", hp: 360 },
];

function DuelPage() {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [bossIdx, setBossIdx] = useState(0);
  const [bossHp, setBossHp] = useState(BOSSES[0].hp);
  const [playerHp, setPlayerHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  const target = useMemo(() => {
    if (cards.length === 0) return null;
    return cards[Math.floor(Math.random() * cards.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, round]);

  const choices = useMemo(() => {
    if (!target) return [];
    const wrongs = shuffle(cards.filter((c) => c.id !== target.id)).slice(0, 3);
    return shuffle([target, ...wrongs]);
  }, [target, cards]);

  const boss = BOSSES[bossIdx];

  function pick(id: string) {
    if (picked || outcome || !target) return;
    setPicked(id);
    const correct = id === target.id;
    const prev = loadProgress();
    const { next } = awardAnswer(prev, { correct, mode: "battle", powerXp: target.power });
    saveProgress(next);

    if (correct) {
      const newCombo = combo + 1;
      const dmg = Math.round(target.power * (1 + newCombo * 0.15));
      const newBossHp = Math.max(0, bossHp - dmg);
      setBossHp(newBossHp);
      setCombo(newCombo);
      setLog((l) => [`⚔️ You hit ${boss.name} for ${dmg}${newCombo > 1 ? ` (x${newCombo} combo)` : ""}!`, ...l].slice(0, 6));
      if (newBossHp === 0) {
        if (bossIdx === BOSSES.length - 1) {
          setOutcome("win");
        } else {
          setLog((l) => [`🏆 Defeated ${boss.name}! A new boss appears…`, ...l].slice(0, 6));
          setTimeout(advanceBoss, 900);
        }
      }
    } else {
      const dmg = 15 + Math.floor(Math.random() * 15);
      const newHp = Math.max(0, playerHp - dmg);
      setPlayerHp(newHp);
      setCombo(0);
      setLog((l) => [`💥 Wrong! ${boss.name} hit you for ${dmg}.`, ...l].slice(0, 6));
      if (newHp === 0) setOutcome("lose");
    }

    setTimeout(() => {
      setPicked(null);
      setRound((r) => r + 1);
    }, 1100);
  }

  function advanceBoss() {
    const next = bossIdx + 1;
    setBossIdx(next);
    setBossHp(BOSSES[next].hp);
  }

  function reset() {
    setBossIdx(0);
    setBossHp(BOSSES[0].hp);
    setPlayerHp(100);
    setCombo(0);
    setRound((r) => r + 1);
    setPicked(null);
    setLog([]);
    setOutcome(null);
  }

  if (!target) return <div className="text-muted-foreground">Loading duel…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Duel Mode</h1>
        {combo > 1 && (
          <div className="px-3 py-1 rounded-full bg-hero text-primary-foreground font-black text-sm glow-primary">
            COMBO x{combo}
          </div>
        )}
      </div>

      {/* Boss */}
      <div className="rounded-2xl bg-card-grad border-2 border-destructive p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{boss.emoji}</div>
          <div className="flex-1">
            <div className="font-bold text-lg">{boss.name}</div>
            <div className="text-xs text-muted-foreground">Boss {bossIdx + 1} / {BOSSES.length}</div>
          </div>
        </div>
        <HpBar hp={bossHp} max={boss.hp} color="bg-destructive" />
      </div>

      {/* Player */}
      <div className="rounded-2xl bg-card-grad border-2 border-primary p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-bold">🧙 You</span>
          <span className="text-muted-foreground">{playerHp} / 100 HP</span>
        </div>
        <HpBar hp={playerHp} max={100} color="bg-primary" />
      </div>

      {outcome ? (
        <div className={`rounded-2xl p-6 text-center space-y-3 ${outcome === "win" ? "bg-hero text-primary-foreground glow-primary" : "bg-destructive text-destructive-foreground"}`}>
          <div className="text-5xl">{outcome === "win" ? "🏆" : "☠️"}</div>
          <div className="text-2xl font-black">{outcome === "win" ? "Victory!" : "You were defeated"}</div>
          <button onClick={reset} className="px-5 py-2 rounded-lg bg-background text-foreground font-bold">
            Fight again
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border p-4 space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Which command does this?</div>
            <div className="text-base">{target.description}</div>
            <div className="text-xs text-muted-foreground">When to use: {target.whenToUse}</div>
          </div>

          <div className="grid gap-2">
            {choices.map((c) => {
              const isRight = c.id === target.id;
              const isPicked = picked === c.id;
              let style = "bg-secondary hover:bg-accent hover:text-accent-foreground border-border";
              if (picked) {
                if (isRight) style = "bg-primary text-primary-foreground border-primary";
                else if (isPicked) style = "bg-destructive text-destructive-foreground border-destructive";
                else style = "bg-secondary text-muted-foreground border-border opacity-60";
              }
              return (
                <button
                  key={c.id}
                  onClick={() => pick(c.id)}
                  disabled={!!picked}
                  className={`text-left px-4 py-3 rounded-lg border font-mono text-sm ${style}`}
                >
                  <span className="opacity-60 mr-2">⚡{c.power}</span>{c.command}
                </button>
              );
            })}
          </div>
        </>
      )}

      {log.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-xs space-y-1 font-mono">
          {log.map((l, i) => (
            <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  const pct = (hp / max) * 100;
  return (
    <div className="h-3 rounded-full bg-secondary overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}