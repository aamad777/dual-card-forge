import type { CommandCard } from "@/lib/cards";
import { CATEGORY_COLOR, CATEGORY_ICON } from "@/lib/cards";

interface Props {
  card: CommandCard;
  faceDown?: boolean;
  hideCommand?: boolean;
  hideEffect?: boolean;
  compact?: boolean;
}

export function CardView({ card, faceDown, hideCommand, hideEffect, compact }: Props) {
  const color = CATEGORY_COLOR[card.category];
  const icon = CATEGORY_ICON[card.category];

  if (faceDown) {
    return (
      <div className="relative aspect-[3/4] w-full max-w-sm rounded-2xl bg-hero glow-primary overflow-hidden">
        <div className="absolute inset-2 rounded-xl border-2 border-white/30 grid place-items-center">
          <div className="text-6xl">🎴</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-sm aspect-[3/4] rounded-2xl bg-card-grad text-card-foreground overflow-hidden border-2"
      style={{ borderColor: color as string, boxShadow: `0 10px 40px -10px ${color as string}` }}
    >
      {/* Holographic sheen */}
      <div className="pointer-events-none absolute inset-0 bg-holo opacity-40" />
      <div className="relative h-full flex flex-col p-4 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
            style={{ background: `${color as string}`, color: "#0b0717" }}
          >
            <span className="mr-1">{icon}</span>
            {card.category}
          </div>
          <div
            className="px-2 py-1 rounded-md text-xs font-bold border"
            style={{ borderColor: color as string, color: color as string }}
          >
            ⚡ {card.power}
          </div>
        </div>

        {/* Command */}
        <div className="rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-sm break-words min-h-[60px]">
          {hideCommand ? <span className="text-muted-foreground italic">— hidden —</span> : card.command}
        </div>

        {/* Body */}
        {!compact && (
          <div className="flex-1 space-y-2 text-sm overflow-hidden">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Effect</div>
              <div className="text-card-foreground/90">
                {hideEffect ? <span className="text-muted-foreground italic">— hidden —</span> : card.description}
              </div>
            </div>
            {!hideEffect && (
              <>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Example</div>
                  <div className="font-mono text-xs text-card-foreground/80 break-words">{card.example}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">When to use</div>
                  <div className="text-card-foreground/80 text-xs">{card.whenToUse}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
          <span className="font-semibold opacity-80">{card.deck}</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {card.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}