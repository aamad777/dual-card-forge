import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { CommandCard } from "@/lib/cards";
import { loadCards } from "@/lib/storage";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "Duel Arena — CmdDeck" },
      { name: "description", content: "Summon command-monsters, attack, and reduce your opponent's life points to zero." },
    ],
  }),
  component: DuelPage,
});

type Monster = {
  uid: string;
  card: CommandCard;
  atk: number;
  def: number;
  level: number;
  position: "atk" | "def";
  faceDown: boolean;
  hasAttacked: boolean;
};

type Side = "player" | "opponent";
type Phase = "draw" | "main" | "battle" | "end";

const STARTING_LP = 4000;
const ZONES = 3;
const HAND_LIMIT = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function statsFor(card: CommandCard) {
  const atk = 200 + card.power * 28;
  const def = 100 + card.power * 22;
  const level = Math.max(1, Math.min(8, Math.round(card.power / 12)));
  return { atk, def, level };
}

function toMonster(card: CommandCard, faceDown = false, position: "atk" | "def" = "atk"): Monster {
  const s = statsFor(card);
  return {
    uid: `${card.id}-${Math.random().toString(36).slice(2, 8)}`,
    card,
    atk: s.atk,
    def: s.def,
    level: s.level,
    position,
    faceDown,
    hasAttacked: false,
  };
}

function DuelPage() {
  const [allCards, setAllCards] = useState<CommandCard[]>([]);
  const [ready, setReady] = useState(false);

  // game state
  const [pLP, setPLP] = useState(STARTING_LP);
  const [oLP, setOLP] = useState(STARTING_LP);
  const [pDeck, setPDeck] = useState<CommandCard[]>([]);
  const [oDeck, setODeck] = useState<CommandCard[]>([]);
  const [pHand, setPHand] = useState<CommandCard[]>([]);
  const [oHand, setOHand] = useState<CommandCard[]>([]);
  const [pField, setPField] = useState<(Monster | null)[]>([null, null, null]);
  const [oField, setOField] = useState<(Monster | null)[]>([null, null, null]);

  const [turn, setTurn] = useState<Side>("player");
  const [phase, setPhase] = useState<Phase>("draw");
  const [turnNo, setTurnNo] = useState(1);
  const [summonedThisTurn, setSummonedThisTurn] = useState(false);

  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<"win" | "lose" | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // load cards client-side only (SSR safe)
  useEffect(() => {
    setAllCards(loadCards());
  }, []);

  useEffect(() => {
    if (allCards.length === 0 || ready) return;
    startDuel(allCards);
  }, [allCards, ready]);

  function pushLog(msg: string) {
    setLog((l) => [msg, ...l].slice(0, 8));
  }

  function startDuel(pool: CommandCard[]) {
    const p = shuffle(pool).slice(0, 20);
    const o = shuffle(pool).slice(0, 20);
    setPDeck(p.slice(5));
    setODeck(o.slice(5));
    setPHand(p.slice(0, 5));
    setOHand(o.slice(0, 5));
    setPField([null, null, null]);
    setOField([null, null, null]);
    setPLP(STARTING_LP);
    setOLP(STARTING_LP);
    setTurn("player");
    setPhase("main");
    setTurnNo(1);
    setSummonedThisTurn(false);
    setLog(["🎴 Duel begins — first turn skips the draw."]);
    setOutcome(null);
    setReady(true);
  }

  function damage(side: Side, amount: number, reason: string) {
    if (side === "player") {
      setPLP((lp) => {
        const next = Math.max(0, lp - amount);
        if (next === 0) setOutcome("lose");
        return next;
      });
    } else {
      setOLP((lp) => {
        const next = Math.max(0, lp - amount);
        if (next === 0) setOutcome("win");
        return next;
      });
    }
    setFlash(side);
    setTimeout(() => setFlash(null), 350);
    pushLog(`💥 ${side === "player" ? "You take" : "Opponent takes"} ${amount} damage — ${reason}.`);
  }

  function drawFor(side: Side) {
    if (side === "player") {
      setPDeck((d) => {
        if (d.length === 0) return d;
        const [c, ...rest] = d;
        setPHand((h) => (h.length >= HAND_LIMIT ? h : [...h, c]));
        return rest;
      });
    } else {
      setODeck((d) => {
        if (d.length === 0) return d;
        const [c, ...rest] = d;
        setOHand((h) => (h.length >= HAND_LIMIT ? h : [...h, c]));
        return rest;
      });
    }
  }

  function endTurn() {
    if (outcome) return;
    setSelectedHandIdx(null);
    setSelectedAttacker(null);
    // refresh attacked flags for the side that just ended
    const refresh = (m: Monster | null) => (m ? { ...m, hasAttacked: false } : null);
    setPField((f) => f.map(refresh));
    setOField((f) => f.map(refresh));

    const next: Side = turn === "player" ? "opponent" : "player";
    setTurn(next);
    setTurnNo((t) => t + 1);
    setSummonedThisTurn(false);
    setPhase("main");
    drawFor(next);
    pushLog(`🔄 ${next === "player" ? "Your" : "Opponent's"} turn.`);

    if (next === "opponent") {
      setTimeout(aiTurn, 900);
    }
  }

  // -------- Player actions --------
  function summonToZone(zoneIdx: number, position: "atk" | "def") {
    if (turn !== "player" || phase !== "main" || outcome) return;
    if (selectedHandIdx === null) return;
    if (summonedThisTurn) {
      pushLog("⚠️ Only one summon per turn.");
      return;
    }
    if (pField[zoneIdx]) {
      pushLog("⚠️ Zone occupied.");
      return;
    }
    const card = pHand[selectedHandIdx];
    const mon = toMonster(card, position === "def", position);
    setPHand((h) => h.filter((_, i) => i !== selectedHandIdx));
    setPField((f) => f.map((m, i) => (i === zoneIdx ? mon : m)));
    setSummonedThisTurn(true);
    setSelectedHandIdx(null);
    pushLog(`✨ You summon ${card.command} (${position === "atk" ? "ATK" : "DEF"}).`);
  }

  function declareAttack(targetIdx: number | "direct") {
    if (turn !== "player" || phase !== "battle" || outcome) return;
    if (selectedAttacker === null) return;
    const attacker = pField[selectedAttacker];
    if (!attacker || attacker.hasAttacked || attacker.position !== "atk") return;

    if (targetIdx === "direct") {
      const oHasMonster = oField.some((m) => m !== null);
      if (oHasMonster) {
        pushLog("⚠️ Cannot attack directly while opponent has monsters.");
        return;
      }
      damage("opponent", attacker.atk, `${attacker.card.command} direct attack`);
    } else {
      const target = oField[targetIdx];
      if (!target) return;
      resolveBattle("player", selectedAttacker, targetIdx);
    }

    setPField((f) =>
      f.map((m, i) => (i === selectedAttacker ? { ...m!, hasAttacked: true } : m)),
    );
    setSelectedAttacker(null);
  }

  function resolveBattle(attackerSide: Side, attIdx: number, defIdx: number) {
    const attField = attackerSide === "player" ? pField : oField;
    const defField = attackerSide === "player" ? oField : pField;
    const setAttField = attackerSide === "player" ? setPField : setOField;
    const setDefField = attackerSide === "player" ? setOField : setPField;
    const attacker = attField[attIdx]!;
    const target = defField[defIdx]!;

    // reveal face-down
    if (target.faceDown) {
      setDefField((f) => f.map((m, i) => (i === defIdx ? { ...m!, faceDown: false } : m)));
      pushLog(`👁️ ${target.card.command} flipped face-up.`);
    }

    const targetVal = target.position === "atk" ? target.atk : target.def;
    const diff = attacker.atk - targetVal;

    if (target.position === "atk") {
      if (diff > 0) {
        setDefField((f) => f.map((m, i) => (i === defIdx ? null : m)));
        damage(attackerSide === "player" ? "opponent" : "player", diff, "battle damage");
      } else if (diff < 0) {
        setAttField((f) => f.map((m, i) => (i === attIdx ? null : m)));
        damage(attackerSide, -diff, "battle damage");
      } else {
        setAttField((f) => f.map((m, i) => (i === attIdx ? null : m)));
        setDefField((f) => f.map((m, i) => (i === defIdx ? null : m)));
        pushLog("⚔️ Both monsters destroyed.");
      }
    } else {
      // defending
      if (diff > 0) {
        setDefField((f) => f.map((m, i) => (i === defIdx ? null : m)));
        pushLog(`💥 ${target.card.command} destroyed in defense.`);
      } else if (diff < 0) {
        damage(attackerSide, -diff, "piercing recoil");
      } else {
        pushLog("🛡️ Attack bounced off — no damage.");
      }
    }
  }

  // -------- AI --------
  function aiTurn() {
    if (outcome) return;
    // Main phase: summon strongest if a zone is free
    setOHand((hand) => {
      let newHand = hand;
      setOField((field) => {
        const freeIdx = field.findIndex((m) => m === null);
        if (freeIdx === -1 || newHand.length === 0) return field;
        const sorted = [...newHand].sort((a, b) => b.power - a.power);
        const choice = sorted[0];
        const summonAsDef = choice.power < 35; // weak → defense
        const mon = toMonster(choice, summonAsDef, summonAsDef ? "def" : "atk");
        newHand = newHand.filter((c) => c.id !== choice.id);
        pushLog(`👹 Opponent summons ${choice.command} (${summonAsDef ? "DEF, face-down" : "ATK"}).`);
        return field.map((m, i) => (i === freeIdx ? mon : m));
      });
      return newHand;
    });

    setTimeout(() => {
      // Battle phase
      setOField((field) => {
        let workingField = field;
        const attackers = field
          .map((m, i) => ({ m, i }))
          .filter((x) => x.m && x.m.position === "atk" && !x.m.hasAttacked) as { m: Monster; i: number }[];

        for (const a of attackers) {
          // pick the weakest opposing monster you can kill, else weakest, else direct
          const targets = pField
            .map((m, i) => ({ m, i }))
            .filter((x) => x.m) as { m: Monster; i: number }[];
          if (targets.length === 0) {
            damage("player", a.m.atk, `${a.m.card.command} direct attack`);
          } else {
            const sorted = [...targets].sort((x, y) => {
              const vx = x.m.position === "atk" ? x.m.atk : x.m.def;
              const vy = y.m.position === "atk" ? y.m.atk : y.m.def;
              return vx - vy;
            });
            const t = sorted[0];
            resolveBattle("opponent", a.i, t.i);
          }
          workingField = workingField.map((m, i) => (i === a.i ? { ...m!, hasAttacked: true } : m));
        }
        return workingField;
      });

      setTimeout(() => {
        // end opponent turn
        const refresh = (m: Monster | null) => (m ? { ...m, hasAttacked: false } : null);
        setOField((f) => f.map(refresh));
        setPField((f) => f.map(refresh));
        setTurn("player");
        setTurnNo((t) => t + 1);
        setSummonedThisTurn(false);
        setPhase("main");
        drawFor("player");
        pushLog("🔄 Your turn.");
      }, 800);
    }, 900);
  }

  const selectedCard = useMemo(
    () => (selectedHandIdx !== null ? pHand[selectedHandIdx] : null),
    [selectedHandIdx, pHand],
  );

  if (!ready) return <div className="text-muted-foreground">Shuffling decks…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Duel Arena</h1>
          <p className="text-sm text-muted-foreground">Turn {turnNo} · {turn === "player" ? "Your" : "Opponent's"} turn · {phase} phase</p>
        </div>
        <button
          onClick={() => { setReady(false); }}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary"
        >
          Restart Duel
        </button>
      </header>

      {/* Opponent LP */}
      <LPBar side="opponent" lp={oLP} flash={flash === "opponent"} />

      {/* Opponent hand (back of cards) */}
      <div className="flex justify-center gap-1">
        {oHand.map((_, i) => (
          <div
            key={i}
            className="h-14 w-10 rounded border border-border bg-[image:linear-gradient(135deg,oklch(0.4_0.18_290),oklch(0.3_0.18_340))] shadow-[var(--shadow-card)]"
          />
        ))}
      </div>

      {/* Opponent field */}
      <FieldRow
        side="opponent"
        field={oField}
        canClick={turn === "player" && phase === "battle" && selectedAttacker !== null}
        onZoneClick={(i) => declareAttack(i)}
        onDirectAttack={() => declareAttack("direct")}
      />

      {/* Player field */}
      <FieldRow
        side="player"
        field={pField}
        canClick={turn === "player" && phase === "main" && selectedHandIdx !== null}
        onZoneClick={(i) => {
          if (phase === "main" && selectedHandIdx !== null) {
            summonToZone(i, "atk");
          } else if (phase === "battle") {
            const m = pField[i];
            if (m && m.position === "atk" && !m.hasAttacked) setSelectedAttacker(i);
          }
        }}
        onSetDef={(i) => summonToZone(i, "def")}
        selectedAttacker={selectedAttacker}
        phase={phase}
      />

      <LPBar side="player" lp={pLP} flash={flash === "player"} />

      {/* Player hand */}
      <div className="rounded-2xl border border-border bg-card/40 p-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your hand</div>
        <div className="flex flex-wrap gap-2">
          {pHand.map((c, i) => {
            const s = statsFor(c);
            const active = selectedHandIdx === i;
            return (
              <button
                key={`${c.id}-${i}`}
                onClick={() => setSelectedHandIdx(active ? null : i)}
                className={
                  "w-28 rounded-lg border p-2 text-left transition-all " +
                  (active
                    ? "border-primary shadow-[var(--shadow-glow)] -translate-y-1"
                    : "border-border hover:border-accent")
                }
                style={{ background: "var(--gradient-card-back, var(--card))" }}
              >
                <div className="text-[10px] uppercase opacity-70">Lv {s.level}</div>
                <div className="text-xs font-bold truncate">{c.command}</div>
                <div className="text-[10px] mt-1 flex justify-between">
                  <span className="text-primary">⚔ {s.atk}</span>
                  <span className="text-accent">🛡 {s.def}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          {phase === "main" && (
            <button
              onClick={() => setPhase("battle")}
              disabled={turn !== "player" || turnNo === 1}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40"
              title={turnNo === 1 ? "No battle on the first turn" : ""}
            >
              ⚔️ Battle Phase
            </button>
          )}
          {phase === "battle" && (
            <div className="text-xs text-muted-foreground self-center">
              {selectedAttacker === null
                ? "Click one of your ATK monsters to choose an attacker."
                : "Click an opponent monster to attack, or the arena to attack directly."}
            </div>
          )}
          <button
            onClick={endTurn}
            disabled={turn !== "player"}
            className="px-4 py-2 rounded-lg border border-border font-bold hover:bg-secondary disabled:opacity-40"
          >
            End Turn ⏭
          </button>
        </div>
        {selectedCard && phase === "main" && !summonedThisTurn && (
          <div className="text-xs text-muted-foreground">
            Click a free zone to summon in ATK · click again with shift / use "Set" to set in DEF.
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="rounded-2xl border border-border bg-card/40 p-3 text-sm space-y-1 max-h-48 overflow-auto">
        {log.map((l, i) => (
          <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</div>
        ))}
      </div>

      {outcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="rounded-2xl border border-primary/40 bg-card p-8 text-center shadow-[var(--shadow-glow)]">
            <div className="text-sm uppercase tracking-widest text-muted-foreground">Duel Over</div>
            <div className="mt-2 text-4xl font-black">
              {outcome === "win" ? "🏆 Victory!" : "💀 Defeat"}
            </div>
            <button
              onClick={() => { setReady(false); }}
              className="mt-6 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold"
            >
              Duel Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LPBar({ side, lp, flash }: { side: Side; lp: number; flash: boolean }) {
  const pct = Math.max(0, Math.min(100, (lp / STARTING_LP) * 100));
  return (
    <div
      className={
        "rounded-xl border border-border bg-card/60 p-2 flex items-center gap-3 " +
        (flash ? "animate-[shake_0.35s_ease-in-out]" : "")
      }
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground w-20">
        {side === "player" ? "You" : "Opponent"}
      </div>
      <div className="flex-1 h-3 rounded-full bg-background/60 overflow-hidden">
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: side === "player"
              ? "linear-gradient(90deg, oklch(0.7 0.2 145), oklch(0.78 0.17 65))"
              : "linear-gradient(90deg, oklch(0.65 0.24 25), oklch(0.65 0.2 350))",
          }}
        />
      </div>
      <div className="font-mono font-bold tabular-nums w-20 text-right">{lp} LP</div>
    </div>
  );
}

function FieldRow({
  side,
  field,
  canClick,
  onZoneClick,
  onDirectAttack,
  onSetDef,
  selectedAttacker,
  phase,
}: {
  side: Side;
  field: (Monster | null)[];
  canClick: boolean;
  onZoneClick: (i: number) => void;
  onDirectAttack?: () => void;
  onSetDef?: (i: number) => void;
  selectedAttacker?: number | null;
  phase?: Phase;
}) {
  const empty = field.every((m) => m === null);
  return (
    <div
      className={
        "relative rounded-2xl border-2 p-3 " +
        (side === "player"
          ? "border-primary/40 bg-[image:linear-gradient(180deg,transparent,oklch(0.78_0.17_65/0.08))]"
          : "border-destructive/40 bg-[image:linear-gradient(0deg,transparent,oklch(0.65_0.24_25/0.08))]")
      }
    >
      {side === "opponent" && empty && onDirectAttack && canClick && (
        <button
          onClick={onDirectAttack}
          className="absolute inset-0 z-10 rounded-2xl bg-destructive/10 border-2 border-dashed border-destructive/60 text-destructive font-bold animate-pulse"
        >
          ⚔️ Click to attack directly
        </button>
      )}
      <div className="grid grid-cols-3 gap-3">
        {field.map((m, i) => {
          const isSelectedAttacker = side === "player" && selectedAttacker === i;
          const targetable = side === "opponent" && canClick && m !== null;
          return (
            <div key={i} className="relative">
              <button
                onClick={() => onZoneClick(i)}
                className={
                  "w-full aspect-[3/4] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 " +
                  (m
                    ? m.faceDown
                      ? "border-border bg-[image:linear-gradient(135deg,oklch(0.4_0.18_290),oklch(0.3_0.18_340))]"
                      : m.position === "atk"
                        ? "border-primary/60 bg-card"
                        : "border-accent/60 bg-card rotate-90"
                    : canClick
                      ? "border-dashed border-primary/60 bg-primary/5 hover:bg-primary/10"
                      : "border-dashed border-border/50 bg-background/30") +
                  (isSelectedAttacker ? " ring-2 ring-primary shadow-[var(--shadow-glow)] -translate-y-1" : "") +
                  (targetable ? " ring-2 ring-destructive cursor-crosshair" : "")
                }
              >
                {m && !m.faceDown && (
                  <>
                    <div className="text-[10px] uppercase opacity-70">Lv {m.level}</div>
                    <div className="text-xs font-bold text-center line-clamp-2 px-1">{m.card.command}</div>
                    <div className="mt-auto w-full text-[10px] flex justify-between">
                      <span className="text-primary">⚔ {m.atk}</span>
                      <span className="text-accent">🛡 {m.def}</span>
                    </div>
                  </>
                )}
                {m && m.faceDown && (
                  <div className="text-2xl opacity-60">✦</div>
                )}
                {!m && <div className="text-xs opacity-40">Zone {i + 1}</div>}
              </button>
              {side === "player" && !m && phase === "main" && canClick && onSetDef && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSetDef(i); }}
                  className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded bg-accent text-accent-foreground"
                >
                  Set DEF
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}