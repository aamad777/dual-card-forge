import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import type { CommandCard } from "@/lib/cards";
import { loadCards, loadProgress, saveProgress, awardAnswer } from "@/lib/storage";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — CmdDeck" },
      { name: "description", content: "Flashcard mode: see the command, guess what it does." },
    ],
  }),
  component: () => <PlayMode mode="flashcard" />,
});

export function PlayMode({ mode }: { mode: "flashcard" | "reverse" }) {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const cs = loadCards();
    setCards(cs);
    setOrder(shuffle(cs.map((c) => c.id)));
  }, []);

  const card = useMemo(() => {
    const id = order[idx];
    return cards.find((c) => c.id === id);
  }, [cards, order, idx]);

  function answer(correct: boolean) {
    if (!card) return;
    const prev = loadProgress();
    const { next, leveledUp, newBadges } = awardAnswer(prev, {
      correct,
      mode,
      powerXp: card.power,
    });
    saveProgress(next);
    const msgs: string[] = [];
    if (correct) msgs.push(`+${next.xp - prev.xp} XP`);
    else msgs.push("No worries — try the next one!");
    if (leveledUp) msgs.push(`🎉 Level ${next.level}!`);
    if (newBadges.length) msgs.push(`🏅 Badge unlocked`);
    setToast(msgs.join(" · "));
    setTimeout(() => setToast(null), 2200);
    nextCard();
  }

  function nextCard() {
    setFlipped(false);
    setIdx((i) => (i + 1) % order.length);
  }

  if (!card) return <div className="text-muted-foreground">Loading deck…</div>;

  const hideCommand = mode === "reverse" && !flipped;
  const hideEffect = mode === "flashcard" && !flipped;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">
          {mode === "flashcard" ? "Flashcard Mode" : "Reverse Mode"}
        </h1>
        <div className="text-sm text-muted-foreground">
          {idx + 1} / {order.length}
        </div>
      </div>
      <p className="text-muted-foreground">
        {mode === "flashcard"
          ? "Read the command, think about what it does, then flip."
          : "Read the effect, recall the command, then flip."}
      </p>

      <div className="flex justify-center">
        <CardView card={card} hideCommand={hideCommand} hideEffect={hideEffect} />
      </div>

      {!flipped ? (
        <button
          onClick={() => setFlipped(true)}
          className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-bold glow-accent"
        >
          Flip card
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="py-3 rounded-lg bg-secondary text-secondary-foreground font-bold border border-border hover:bg-destructive hover:text-destructive-foreground"
          >
            ✗ Got it wrong
          </button>
          <button
            onClick={() => answer(true)}
            className="py-3 rounded-lg bg-primary text-primary-foreground font-bold glow-primary"
          >
            ✓ Got it right
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border p-3 text-sm">
        <div className="font-bold mb-1">Quick quiz</div>
        <div>{card.quiz.question}</div>
        {flipped && (
          <div className="mt-2 text-muted-foreground">
            <span className="font-semibold text-foreground">Answer:</span> {card.quiz.answer} —{" "}
            {card.quiz.explanation}
          </div>
        )}
      </div>

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