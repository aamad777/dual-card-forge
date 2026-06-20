import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import type { Category, CommandCard } from "@/lib/cards";
import { CATEGORY_ICON } from "@/lib/cards";
import { loadCards, saveCards } from "@/lib/storage";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — CmdDeck" },
      { name: "description", content: "Browse every command card in your collection." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCards(loadCards());
  }, []);

  const categories = useMemo(() => {
    const set = new Set<Category>();
    cards.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [cards]);

  const filtered = cards.filter((c) => {
    if (filter !== "All" && c.category !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.command.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.deck.toLowerCase().includes(q)
    );
  });

  function remove(id: string) {
    if (!confirm("Delete this card?")) return;
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    saveCards(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black">Card Library</h1>
          <p className="text-muted-foreground">{cards.length} cards in your collection</p>
        </div>
        <Link
          to="/manage"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold"
        >
          + Add Card
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands…"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
        />
        <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>All</FilterChip>
        {categories.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {CATEGORY_ICON[c]} {c}
          </FilterChip>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((card) => (
          <div key={card.id} className="flex flex-col items-center gap-2">
            <CardView card={card} />
            <div className="flex gap-2 text-xs">
              <Link
                to="/manage"
                search={{ id: card.id }}
                className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Edit
              </Link>
              <button
                onClick={() => remove(card.id)}
                className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">No cards match your filter.</div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-sm border transition-colors " +
        (active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground")
      }
    >
      {children}
    </button>
  );
}