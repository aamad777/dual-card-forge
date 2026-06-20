import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJI_POOL = ["🦊", "🐼", "🐙", "🦄", "🐳", "🦁", "🐧", "🦋", "🌵", "🍄", "🌸", "⚡", "🔥", "🌙", "🎲", "💎"];

type Difficulty = { label: string; pairs: number; cols: string };
const DIFFICULTIES: Record<string, Difficulty> = {
  easy: { label: "Easy · 6 pairs", pairs: 6, cols: "grid-cols-4" },
  medium: { label: "Medium · 8 pairs", pairs: 8, cols: "grid-cols-4" },
  hard: { label: "Hard · 12 pairs", pairs: 12, cols: "grid-cols-6" },
};

type Card = { id: number; emoji: string; matched: boolean; owner: 0 | 1 | null };

function buildDeck(pairs: number): Card[] {
  const picks = [...EMOJI_POOL].sort(() => Math.random() - 0.5).slice(0, pairs);
  const deck = [...picks, ...picks]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, matched: false, owner: null as 0 | 1 | null }));
  return deck;
}

export function MemoryGame() {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>("medium");
  const [cards, setCards] = useState<Card[]>(() => buildDeck(DIFFICULTIES.medium.pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);

  const totalPairs = DIFFICULTIES[difficulty].pairs;
  const finished = scores[0] + scores[1] === totalPairs;

  const winner = useMemo(() => {
    if (!finished) return null;
    if (scores[0] === scores[1]) return "tie";
    return scores[0] > scores[1] ? 0 : 1;
  }, [finished, scores]);

  function reset(next: keyof typeof DIFFICULTIES = difficulty) {
    setDifficulty(next);
    setCards(buildDeck(DIFFICULTIES[next].pairs));
    setFlipped([]);
    setTurn(0);
    setScores([0, 0]);
    setMoves(0);
    setLock(false);
    setShakeId(null);
  }

  function onFlip(id: number) {
    if (lock) return;
    if (flipped.includes(id)) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched) return;

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = next.map((i) => cards.find((c) => c.id === i)!);
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true, owner: turn } : c)),
          );
          setScores((s) => {
            const ns: [number, number] = [...s] as [number, number];
            ns[turn] += 1;
            return ns;
          });
          setFlipped([]);
          setLock(false);
        }, 650);
      } else {
        setShakeId(b.id);
        setTimeout(() => {
          setFlipped([]);
          setTurn((t) => (t === 0 ? 1 : 0));
          setLock(false);
          setShakeId(null);
        }, 1000);
      }
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          Duplicate · 2-Player Memory
        </span>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Find the <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">duplicates</span>
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Take turns flipping two cards. Match a pair to score and play again. Miss and pass the turn.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].map((p) => {
          const active = turn === p && !finished;
          return (
            <div
              key={p}
              className={cn(
                "rounded-2xl border bg-card/70 p-4 backdrop-blur transition-all",
                active ? "border-primary shadow-[var(--shadow-glow)]" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                      p === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    P{p + 1}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Player {p + 1}</div>
                    <div className="text-xs text-muted-foreground">{active ? "Your turn" : "Waiting…"}</div>
                  </div>
                </div>
                <div className="text-3xl font-bold tabular-nums">{scores[p]}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(Object.keys(DIFFICULTIES) as Array<keyof typeof DIFFICULTIES>).map((k) => (
            <button
              key={k}
              onClick={() => reset(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                difficulty === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {DIFFICULTIES[k].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Moves: <span className="font-semibold text-foreground tabular-nums">{moves}</span></span>
          <Button size="sm" variant="outline" onClick={() => reset()}>Restart (R)</Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3 rounded-3xl border border-border bg-card/40 p-4 backdrop-blur",
          DIFFICULTIES[difficulty].cols,
        )}
        style={{ perspective: "1000px" }}
      >
        {cards.map((card) => {
          const isOpen = flipped.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => onFlip(card.id)}
              disabled={card.matched}
              className={cn(
                "relative aspect-square w-full rounded-xl transition-transform duration-300",
                shakeId === card.id && "animate-[shake_0.4s_ease-in-out]",
                card.matched && "animate-[pop_0.6s_ease-out]",
              )}
              style={{ transformStyle: "preserve-3d", transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)" }}
              aria-label={isOpen ? `Card ${card.emoji}` : "Hidden card"}
            >
              <span
                className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/10 text-2xl shadow-[var(--shadow-card)]"
                style={{ backfaceVisibility: "hidden", background: "var(--gradient-card-back)" }}
              >
                <span className="text-3xl opacity-70">✦</span>
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-xl border text-4xl sm:text-5xl shadow-[var(--shadow-card)]",
                  card.matched
                    ? card.owner === 0
                      ? "border-primary bg-primary/15"
                      : "border-secondary bg-secondary/15"
                    : "border-border bg-background/80",
                )}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {card.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="rounded-2xl border border-primary/40 bg-card/80 p-6 text-center shadow-[var(--shadow-glow)]">
          <div className="text-sm uppercase tracking-widest text-muted-foreground">Game Over</div>
          <div className="mt-1 text-2xl font-bold">
            {winner === "tie" ? "It's a tie!" : `Player ${(winner as number) + 1} wins 🎉`}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Final score — P1: {scores[0]} · P2: {scores[1]} in {moves} moves
          </div>
          <Button className="mt-4" onClick={() => reset()}>Play again</Button>
        </div>
      )}
    </div>
  );
}