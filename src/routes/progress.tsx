import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Progress } from "@/lib/storage";
import { ALL_BADGES, DEFAULT_PROGRESS, loadProgress, saveProgress, xpForLevel } from "@/lib/storage";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — CmdDeck" },
      { name: "description", content: "Your XP, level, streak and unlocked badges." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [p, setP] = useState<Progress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setP(loadProgress());
  }, []);

  function reset() {
    if (!confirm("Reset all your progress? This can't be undone.")) return;
    saveProgress(DEFAULT_PROGRESS);
    setP(DEFAULT_PROGRESS);
  }

  const nextXp = xpForLevel(p.level);
  const prevXp = p.level > 1 ? xpForLevel(p.level - 1) : 0;
  const pct = Math.min(100, ((p.xp - prevXp) / (nextXp - prevXp)) * 100);
  const acc = p.totalAttempts > 0 ? Math.round((p.totalCorrect / p.totalAttempts) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-black">Your Progress</h1>
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive"
        >
          Reset progress
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Level" value={p.level} emoji="🎖️" />
        <Stat label="XP" value={p.xp} emoji="✨" />
        <Stat label="Streak" value={`${p.streak} day${p.streak === 1 ? "" : "s"}`} emoji="🔥" />
        <Stat label="Accuracy" value={`${acc}%`} emoji="🎯" />
      </div>

      <div className="rounded-2xl bg-card-grad border border-border p-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-bold">Level {p.level}</span>
          <span className="text-muted-foreground">
            {p.xp - prevXp} / {nextXp - prevXp} XP to level {p.level + 1}
          </span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-hero glow-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_BADGES.map((b) => {
            const earned = p.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={
                  "rounded-xl p-4 border text-center " +
                  (earned
                    ? "bg-card-grad border-primary glow-primary"
                    : "bg-secondary/30 border-border opacity-50")
                }
              >
                <div className="text-3xl mb-1">{b.emoji}</div>
                <div className="text-xs font-semibold">{b.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Flashcards correct" value={p.perMode.flashcard} emoji="🃏" />
        <Stat label="Reverse correct" value={p.perMode.reverse} emoji="🔄" />
        <Stat label="Battles won" value={p.perMode.battle} emoji="⚔️" />
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="rounded-xl bg-card-grad border border-border p-4">
      <div className="text-2xl">{emoji}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}