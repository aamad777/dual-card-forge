import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { BattleScenario, CommandCard } from "@/lib/cards";
import { BATTLE_SCENARIOS } from "@/lib/cards";
import { loadCards, loadProgress, saveProgress, awardAnswer } from "@/lib/storage";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Battle Mode — CmdDeck" },
      { name: "description", content: "Pick the right command for each troubleshooting scenario." },
    ],
  }),
  component: BattlePage,
});

function BattlePage() {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [order, setOrder] = useState<BattleScenario[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    setCards(loadCards());
    setOrder(shuffle(BATTLE_SCENARIOS));
  }, []);

  const scenario = order[idx];

  const choices = useMemo(() => {
    if (!scenario || cards.length === 0) return [];
    const correctCard = cards.find((c) => c.command === scenario.correctCommand);
    const wrongPool = cards.filter((c) => c.command !== scenario.correctCommand);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    const all = [correctCard, ...wrongs].filter(Boolean) as CommandCard[];
    return shuffle(all);
  }, [scenario, cards]);

  if (!scenario) return <div className="text-muted-foreground">Loading battle…</div>;

  function pick(cmd: string) {
    if (picked) return;
    setPicked(cmd);
    const correct = cmd === scenario.correctCommand;
    const card = cards.find((c) => c.command === scenario.correctCommand);
    const prev = loadProgress();
    const { next, leveledUp, newBadges } = awardAnswer(prev, {
      correct,
      mode: "battle",
      powerXp: card?.power ?? 50,
    });
    saveProgress(next);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    const msgs: string[] = [];
    if (correct) msgs.push(`⚔️ Victory! +${next.xp - prev.xp} XP`);
    else msgs.push("✗ Defeated. Study the answer.");
    if (leveledUp) msgs.push(`🎉 Level ${next.level}!`);
    if (newBadges.length) msgs.push(`🏅 Badge unlocked`);
    setToast(msgs.join(" · "));
    setTimeout(() => setToast(null), 2400);
  }

  function nextRound() {
    setPicked(null);
    setIdx((i) => (i + 1) % order.length);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Battle Mode ⚔️</h1>
        <div className="text-sm text-muted-foreground">
          Round {idx + 1} · {score.correct}/{score.total} won
        </div>
      </div>

      <div className="rounded-2xl bg-card-grad border-2 border-border p-6 space-y-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Scenario</div>
        <div className="text-lg">{scenario.scenario}</div>
      </div>

      <div className="grid gap-2">
        {choices.map((c) => {
          const isCorrect = c.command === scenario.correctCommand;
          const isPicked = picked === c.command;
          let style = "bg-secondary hover:bg-accent hover:text-accent-foreground border-border";
          if (picked) {
            if (isCorrect) style = "bg-primary text-primary-foreground border-primary";
            else if (isPicked) style = "bg-destructive text-destructive-foreground border-destructive";
            else style = "bg-secondary text-muted-foreground border-border opacity-60";
          }
          return (
            <button
              key={c.id}
              onClick={() => pick(c.command)}
              disabled={!!picked}
              className={`text-left px-4 py-3 rounded-lg border font-mono text-sm ${style}`}
            >
              {c.command}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-2">
          <div>
            <span className="font-bold text-foreground">Why:</span>{" "}
            <span className="text-muted-foreground">{scenario.explanation}</span>
          </div>
          <button
            onClick={nextRound}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold glow-primary"
          >
            Next round →
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold glow-primary z-50">
          {toast}
        </div>
      )}
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