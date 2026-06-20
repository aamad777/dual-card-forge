import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CardView } from "@/components/CardView";
import { STARTER_CARDS, STARTER_DECKS, CATEGORY_ICON } from "@/lib/cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CmdDeck — Memorize IT commands the fun way" },
      { name: "description", content: "A trading-card game for mastering Linux, Docker, Terraform, Network and Security commands." },
      { property: "og:title", content: "CmdDeck — Memorize IT commands the fun way" },
      { property: "og:description", content: "Trading-card game for IT commands." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = STARTER_CARDS.slice(0, 3);
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <span>🎴</span> The IT Command TCG
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-[1.05]">
            Collect commands.
            <br />
            <span className="text-hero">Battle bugs.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Memorize Linux, Docker, Terraform, Network and Security commands by playing
            a card game — flip, guess, battle, level up.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/flashcards"
              className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold glow-primary hover:scale-105 transition-transform"
            >
              Start Playing →
            </Link>
            <Link
              to="/library"
              className="px-5 py-3 rounded-lg border border-border text-foreground font-bold hover:bg-secondary transition-colors"
            >
              Browse Library
            </Link>
          </div>
        </div>

        <div className="relative h-[420px]">
          <div className="absolute left-0 top-6 w-[55%] rotate-[-8deg] animate-float">
            <CardView card={featured[0]} compact />
          </div>
          <div className="absolute left-[22%] top-0 w-[55%] rotate-[2deg] animate-float" style={{ animationDelay: "0.8s" }}>
            <CardView card={featured[1]} compact />
          </div>
          <div className="absolute right-0 top-10 w-[55%] rotate-[8deg] animate-float" style={{ animationDelay: "1.6s" }}>
            <CardView card={featured[2]} compact />
          </div>
        </div>
      </section>

      {/* MODES */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Game modes</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ModeCard to="/flashcards" emoji="🃏" title="Flashcard Mode" desc="See the command, guess what it does." />
          <ModeCard to="/reverse" emoji="🔄" title="Reverse Mode" desc="See the effect, recall the command." />
          <ModeCard to="/battle" emoji="⚔️" title="Battle Mode" desc="Pick the right command for the scenario." />
        </div>
      </section>

      {/* DECKS */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Starter decks</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STARTER_DECKS.map((deck) => {
            const count = STARTER_CARDS.filter((c) => c.deck === deck).length;
            const sample = STARTER_CARDS.find((c) => c.deck === deck);
            const icon = sample ? CATEGORY_ICON[sample.category] : "🎴";
            return (
              <Link
                key={deck}
                to="/library"
                className="group rounded-2xl p-5 bg-card-grad border border-border hover:border-primary transition-all hover:scale-[1.02]"
              >
                <div className="text-4xl mb-2">{icon}</div>
                <div className="font-bold text-lg">{deck}</div>
                <div className="text-sm text-muted-foreground">{count} cards</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ModeCard({ to, emoji, title, desc }: { to: string; emoji: string; title: string; desc: string }) {
  return (
    <Link
      to={to as "/flashcards" | "/reverse" | "/battle"}
      className="rounded-2xl p-5 bg-card-grad border border-border hover:border-accent hover:glow-accent transition-all"
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="font-bold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}
