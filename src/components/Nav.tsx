import { Link } from "@tanstack/react-router";

const items = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
  { to: "/flashcards", label: "Flashcards" },
  { to: "/reverse", label: "Reverse" },
  { to: "/battle", label: "Battle" },
  { to: "/duel", label: "Duel" },
  { to: "/progress", label: "Progress" },
  { to: "/manage", label: "Add Card" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3 gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎴</span>
          <span className="font-black tracking-tight text-lg text-hero">CmdDeck</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeOptions={{ exact: i.to === "/" }}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "px-3 py-1.5 rounded-md bg-secondary text-foreground font-semibold" }}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}