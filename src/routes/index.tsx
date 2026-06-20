import { createFileRoute } from "@tanstack/react-router";
import { MemoryGame } from "@/components/MemoryGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Duplicate — 2-Player Memory Card Game" },
      { name: "description", content: "A fast, modern two-player memory card game. Flip cards, find duplicates, and beat your opponent." },
      { property: "og:title", content: "Duplicate — 2-Player Memory Card Game" },
      { property: "og:description", content: "Flip cards, find duplicates, and beat your opponent in this fast, modern memory game." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <MemoryGame />
    </main>
  );
}
