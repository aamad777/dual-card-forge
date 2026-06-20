import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  dockerStarterCards,
  type DualCard,
} from "../lib/dualCards";
import { createFusionMonster } from "../lib/fusion";

export const Route = createFileRoute("/docker-lab")({
  component: DockerDuelField,
});

type PlayerName = "player" | "opponent";

type FieldState = {
  monsterZones: Array<DualCard | null>;
  spellZones: Array<DualCard | null>;
};

type LogEntry = {
  id: number;
  message: string;
};

const opponentDeck: DualCard[] = [
  {
    id: "opponent-linux-bug",
    name: "Linux Bug Monster",
    type: "monster",
    category: "Linux",
    imageName: "ubuntu:broken-service",
    level: 4,
    attack: 1300,
    defense: 1000,
    deck: "Opponent Deck",
    difficulty: "Beginner",
    description:
      "A Linux troubleshooting monster. It represents a broken service or bad configuration.",
    command: "systemctl status broken-service",
    code: "systemctl status broken-service\njournalctl -xe",
    explanation:
      "This card teaches how to inspect failed Linux services using systemctl and journalctl.",
    quiz: {
      question: "Which command checks a Linux service?",
      answer: "systemctl status service-name",
      explanation: "systemctl is commonly used to inspect and manage services.",
    },
  },
  {
    id: "opponent-network-bug",
    name: "Network Bug Monster",
    type: "monster",
    category: "Network",
    imageName: "network:misconfigured",
    level: 3,
    attack: 1000,
    defense: 1200,
    deck: "Opponent Deck",
    difficulty: "Beginner",
    description:
      "A network problem monster. It represents DNS, routing, or connectivity issues.",
    command: "ping 8.8.8.8 && nslookup example.com",
    code: "ip a\nip route\nping 8.8.8.8\nnslookup example.com",
    explanation:
      "This card teaches basic network troubleshooting using IP, route, ping, and DNS commands.",
    quiz: {
      question: "Which command tests basic connectivity?",
      answer: "ping",
      explanation: "ping checks if a remote host can be reached.",
    },
  },
  {
    id: "opponent-permission-bug",
    name: "Permission Bug Monster",
    type: "monster",
    category: "Security",
    imageName: "linux:permission-denied",
    level: 3,
    attack: 900,
    defense: 1500,
    deck: "Opponent Deck",
    difficulty: "Beginner",
    description:
      "A permission issue monster. It represents file ownership and access problems.",
    command: "ls -l && chmod && chown",
    code: "ls -l\nchmod 640 file.txt\nchown user:group file.txt",
    explanation:
      "This card teaches file permission inspection and correction on Linux.",
    quiz: {
      question: "Which command changes file permissions?",
      answer: "chmod",
      explanation: "chmod changes read, write, and execute permissions.",
    },
  },
];

function buildPlayerDeck(): DualCard[] {
  const visibleCards = dockerStarterCards.filter(
    (card) => card.id !== "monster-fullstack-lab"
  );

  return [
    ...visibleCards,
    ...visibleCards.map((card) => ({ ...card, id: `${card.id}-copy-1` })),
    ...visibleCards.map((card) => ({ ...card, id: `${card.id}-copy-2` })),
  ];
}

function drawCards(deck: DualCard[], count: number) {
  return {
    hand: deck.slice(0, count),
    deck: deck.slice(count),
  };
}

function DockerDuelField() {
  const initialPlayer = drawCards(buildPlayerDeck(), 6);
  const initialOpponent = drawCards(
    [
      ...opponentDeck,
      ...opponentDeck.map((card) => ({ ...card, id: `${card.id}-copy-1` })),
    ],
    6
  );

  const [playerDeck, setPlayerDeck] = useState<DualCard[]>(initialPlayer.deck);
  const [opponentCardDeck, setOpponentCardDeck] = useState<DualCard[]>(
    initialOpponent.deck
  );

  const [playerHand, setPlayerHand] = useState<DualCard[]>(initialPlayer.hand);
  const [opponentHand, setOpponentHand] = useState<DualCard[]>(
    initialOpponent.hand
  );

  const [playerField, setPlayerField] = useState<FieldState>({
    monsterZones: [null, null, null],
    spellZones: [null, null, null],
  });

  const [opponentField, setOpponentField] = useState<FieldState>({
    monsterZones: [initialOpponent.hand[0] ?? null, null, null],
    spellZones: [null, null, null],
  });

  const [playerLp, setPlayerLp] = useState(4000);
  const [opponentLp, setOpponentLp] = useState(4000);
  const [turn, setTurn] = useState<PlayerName>("player");
  const [normalSummonUsed, setNormalSummonUsed] = useState(false);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(
    null
  );
  const [selectedPlayerMonsterZone, setSelectedPlayerMonsterZone] =
    useState<number | null>(null);
  const [selectedOpponentMonsterZone, setSelectedOpponentMonsterZone] =
    useState<number | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      message:
        "Duel started. You drew 6 cards. Place one monster, activate spell, or prepare fusion.",
    },
  ]);

  const selectedCard = useMemo(() => {
    return playerHand.find((card) => card.id === selectedHandCardId) ?? null;
  }, [playerHand, selectedHandCardId]);

  const gameOver = playerLp <= 0 || opponentLp <= 0;

  function addLog(message: string) {
    setLogs((current) => [{ id: Date.now() + Math.random(), message }, ...current]);
  }

  function removeFromHand(cardId: string) {
    setPlayerHand((current) => current.filter((card) => card.id !== cardId));
    setSelectedHandCardId(null);
  }

  function placeMonster(zoneIndex: number) {
    if (turn !== "player" || gameOver) return;

    if (!selectedCard) {
      addLog("Select a card from your hand first.");
      return;
    }

    if (selectedCard.type !== "monster") {
      addLog("This is not a monster card. Use a spell zone for spell cards.");
      return;
    }

    if (normalSummonUsed) {
      addLog("You already placed one monster this turn.");
      return;
    }

    if (playerField.monsterZones[zoneIndex]) {
      addLog("That monster zone is already occupied.");
      return;
    }

    setPlayerField((field) => {
      const zones = [...field.monsterZones];
      zones[zoneIndex] = selectedCard;
      return { ...field, monsterZones: zones };
    });

    removeFromHand(selectedCard.id);
    setNormalSummonUsed(true);
    addLog(`${selectedCard.name} was placed in Monster Zone ${zoneIndex + 1}.`);
  }

  function placeSpell(zoneIndex: number) {
    if (turn !== "player" || gameOver) return;

    if (!selectedCard) {
      addLog("Select a card from your hand first.");
      return;
    }

    if (selectedCard.type !== "spell") {
      addLog("This is not a spell card. Use a monster zone for monster cards.");
      return;
    }

    if (playerField.spellZones[zoneIndex]) {
      addLog("That spell zone is already occupied.");
      return;
    }

    setPlayerField((field) => {
      const zones = [...field.spellZones];
      zones[zoneIndex] = selectedCard;
      return { ...field, spellZones: zones };
    });

    removeFromHand(selectedCard.id);
    addLog(`${selectedCard.name} was placed in Spell Zone ${zoneIndex + 1}.`);
  }

  function activateFusionSpell() {
    if (turn !== "player" || gameOver) return;

    const webZoneIndex = playerField.monsterZones.findIndex((card) =>
      card?.id.startsWith("monster-docker-nginx")
    );

    const dbZoneIndex = playerField.monsterZones.findIndex((card) =>
      card?.id.startsWith("monster-docker-postgres")
    );

    const spellZoneIndex = playerField.spellZones.findIndex((card) =>
      card?.id.startsWith("spell-docker-compose-fusion")
    );

    if (webZoneIndex === -1 || dbZoneIndex === -1 || spellZoneIndex === -1) {
      addLog(
        "Fusion needs Docker Web Monster + Docker Database Monster on the monster field, and Docker Compose Fusion in the spell zone."
      );
      return;
    }

    const webMonster = playerField.monsterZones[webZoneIndex];
    const dbMonster = playerField.monsterZones[dbZoneIndex];
    const spell = playerField.spellZones[spellZoneIndex];

    if (!webMonster || !dbMonster || !spell) return;

    const fused = createFusionMonster([webMonster, dbMonster, spell]);

    if (!fused) {
      addLog("Fusion failed.");
      return;
    }

    setPlayerField((field) => {
      const monsterZones = [...field.monsterZones];
      const spellZones = [...field.spellZones];

      monsterZones[webZoneIndex] = fused;
      monsterZones[dbZoneIndex] = null;
      spellZones[spellZoneIndex] = null;

      return {
        monsterZones,
        spellZones,
      };
    });

    addLog(
      `Fusion activated! ${webMonster.name} + ${dbMonster.name} created ${fused.name} with ${fused.attack} ATK.`
    );
  }

  function attack() {
    if (turn !== "player" || gameOver) return;

    if (selectedPlayerMonsterZone === null) {
      addLog("Select one of your monsters first.");
      return;
    }

    const attacker = playerField.monsterZones[selectedPlayerMonsterZone];

    if (!attacker) {
      addLog("Selected monster zone is empty.");
      return;
    }

    const opponentHasMonster = opponentField.monsterZones.some(Boolean);

    if (!opponentHasMonster) {
      setOpponentLp((lp) => Math.max(0, lp - attacker.attack));
      addLog(`${attacker.name} attacked directly for ${attacker.attack} damage.`);
      return;
    }

    if (selectedOpponentMonsterZone === null) {
      addLog("Select an opponent monster to attack.");
      return;
    }

    const defender = opponentField.monsterZones[selectedOpponentMonsterZone];

    if (!defender) {
      addLog("Selected opponent zone is empty.");
      return;
    }

    const damage = attacker.attack - defender.attack;

    if (damage > 0) {
      setOpponentLp((lp) => Math.max(0, lp - damage));

      setOpponentField((field) => {
        const zones = [...field.monsterZones];
        zones[selectedOpponentMonsterZone] = null;
        return { ...field, monsterZones: zones };
      });

      addLog(
        `${attacker.name} destroyed ${defender.name}. Opponent took ${damage} damage.`
      );
    } else if (damage < 0) {
      setPlayerLp((lp) => Math.max(0, lp - Math.abs(damage)));
      addLog(
        `${attacker.name} attacked ${defender.name}, but lost the battle. You took ${Math.abs(
          damage
        )} damage.`
      );
    } else {
      setPlayerField((field) => {
        const zones = [...field.monsterZones];
        zones[selectedPlayerMonsterZone] = null;
        return { ...field, monsterZones: zones };
      });

      setOpponentField((field) => {
        const zones = [...field.monsterZones];
        zones[selectedOpponentMonsterZone] = null;
        return { ...field, monsterZones: zones };
      });

      addLog(`${attacker.name} and ${defender.name} destroyed each other.`);
    }
  }

  function drawOneCard() {
    if (playerDeck.length === 0) {
      addLog("Your deck is empty. No card drawn.");
      return;
    }

    const [drawnCard, ...remainingDeck] = playerDeck;
    setPlayerDeck(remainingDeck);
    setPlayerHand((hand) => [...hand, drawnCard]);
    addLog(`You drew ${drawnCard.name}.`);
  }

  function opponentTurn() {
    let newOpponentHand = [...opponentHand];
    let newOpponentDeck = [...opponentCardDeck];

    if (newOpponentDeck.length > 0) {
      const drawn = newOpponentDeck[0];
      newOpponentDeck = newOpponentDeck.slice(1);
      newOpponentHand = [...newOpponentHand, drawn];
    }

    const emptyZone = opponentField.monsterZones.findIndex((zone) => zone === null);
    const monsterInHand = newOpponentHand.find((card) => card.type === "monster");

    if (emptyZone !== -1 && monsterInHand) {
      newOpponentHand = newOpponentHand.filter((card) => card.id !== monsterInHand.id);

      setOpponentField((field) => {
        const zones = [...field.monsterZones];
        zones[emptyZone] = monsterInHand;
        return { ...field, monsterZones: zones };
      });

      addLog(`Opponent placed ${monsterInHand.name}.`);
    } else {
      addLog("Opponent could not place a monster.");
    }

    setOpponentHand(newOpponentHand);
    setOpponentCardDeck(newOpponentDeck);

    const opponentAttacker =
      opponentField.monsterZones.find(Boolean) ?? monsterInHand ?? null;

    const playerTargetIndex = playerField.monsterZones.findIndex(Boolean);

    if (opponentAttacker && playerTargetIndex !== -1) {
      const playerTarget = playerField.monsterZones[playerTargetIndex];

      if (playerTarget) {
        const damage = opponentAttacker.attack - playerTarget.attack;

        if (damage > 0) {
          setPlayerLp((lp) => Math.max(0, lp - damage));
          setPlayerField((field) => {
            const zones = [...field.monsterZones];
            zones[playerTargetIndex] = null;
            return { ...field, monsterZones: zones };
          });
          addLog(
            `Opponent ${opponentAttacker.name} destroyed ${playerTarget.name}. You took ${damage} damage.`
          );
        } else {
          addLog(`Opponent attacked, but your monster survived.`);
        }
      }
    }

    setOpponentHand(newOpponentHand);
    setOpponentCardDeck(newOpponentDeck);
  }

  function endTurn() {
    if (turn !== "player" || gameOver) return;

    addLog("You ended your turn. Opponent turn begins.");
    setTurn("opponent");

    setTimeout(() => {
      opponentTurn();
      setTurn("player");
      setNormalSummonUsed(false);
      setSelectedPlayerMonsterZone(null);
      setSelectedOpponentMonsterZone(null);
      drawOneCard();
      addLog("Your turn begins. You can place one monster this turn.");
    }, 700);
  }

  function resetGame() {
    const freshPlayer = drawCards(buildPlayerDeck(), 6);
    const freshOpponent = drawCards(
      [
        ...opponentDeck,
        ...opponentDeck.map((card) => ({
          ...card,
          id: `${card.id}-copy-1`,
        })),
      ],
      6
    );

    setPlayerDeck(freshPlayer.deck);
    setOpponentCardDeck(freshOpponent.deck);
    setPlayerHand(freshPlayer.hand);
    setOpponentHand(freshOpponent.hand);
    setPlayerField({
      monsterZones: [null, null, null],
      spellZones: [null, null, null],
    });
    setOpponentField({
      monsterZones: [freshOpponent.hand[0] ?? null, null, null],
      spellZones: [null, null, null],
    });
    setPlayerLp(4000);
    setOpponentLp(4000);
    setTurn("player");
    setNormalSummonUsed(false);
    setSelectedHandCardId(null);
    setSelectedPlayerMonsterZone(null);
    setSelectedOpponentMonsterZone(null);
    setLogs([
      {
        id: 1,
        message:
          "New duel started. You drew 6 cards. Place one monster per turn.",
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border border-cyan-500/30 bg-slate-900 p-5">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            Dual Card Forge
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Docker Duel Field
          </h1>
          <p className="mt-3 text-slate-300">
            Draw 6 cards, place one monster per turn, use spell zones, fuse Docker monsters, and battle the opponent.
          </p>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatusBox label="Turn" value={turn === "player" ? "Your Turn" : "Opponent"} />
          <StatusBox label="Your LP" value={playerLp} />
          <StatusBox label="Opponent LP" value={opponentLp} />
          <StatusBox label="Deck" value={`${playerDeck.length} cards`} />
        </div>

        {gameOver && (
          <div className="mb-6 rounded-2xl border border-yellow-400 bg-yellow-500/10 p-5">
            <h2 className="text-2xl font-black">
              {opponentLp <= 0 ? "You Win!" : "You Lost!"}
            </h2>
          </div>
        )}

        <DuelField
          title="Opponent Field"
          field={opponentField}
          owner="opponent"
          selectedMonsterZone={selectedOpponentMonsterZone}
          onMonsterZoneClick={setSelectedOpponentMonsterZone}
          onSpellZoneClick={() => {}}
        />

        <div className="my-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={activateFusionSpell}
              disabled={turn !== "player" || gameOver}
              className="rounded-xl bg-purple-600 px-5 py-3 font-bold hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400"
            >
              Activate Fusion Spell
            </button>

            <button
              onClick={attack}
              disabled={turn !== "player" || gameOver}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400"
            >
              Attack
            </button>

            <button
              onClick={endTurn}
              disabled={turn !== "player" || gameOver}
              className="rounded-xl bg-cyan-600 px-5 py-3 font-bold hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400"
            >
              End Turn
            </button>

            <button
              onClick={resetGame}
              className="rounded-xl bg-slate-700 px-5 py-3 font-bold hover:bg-slate-600"
            >
              Reset Duel
            </button>
          </div>
        </div>

        <DuelField
          title="Your Field"
          field={playerField}
          owner="player"
          selectedMonsterZone={selectedPlayerMonsterZone}
          onMonsterZoneClick={(index) => {
            if (selectedCard?.type === "monster") {
              placeMonster(index);
            } else {
              setSelectedPlayerMonsterZone(index);
            }
          }}
          onSpellZoneClick={(index) => {
            if (selectedCard?.type === "spell") {
              placeSpell(index);
            }
          }}
        />

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-2xl font-black">Your Hand: {playerHand.length} Cards</h2>

          <p className="mt-2 text-slate-400">
            Select a card, then click a monster zone or spell zone.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playerHand.map((card) => (
              <HandCard
                key={card.id}
                card={card}
                selected={selectedHandCardId === card.id}
                onClick={() => setSelectedHandCardId(card.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-2xl font-black">Battle Log</h2>
          <div className="mt-4 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-xl bg-slate-950 px-4 py-3 text-slate-300">
                {log.message}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function DuelField({
  title,
  field,
  owner,
  selectedMonsterZone,
  onMonsterZoneClick,
  onSpellZoneClick,
}: {
  title: string;
  field: FieldState;
  owner: PlayerName;
  selectedMonsterZone: number | null;
  onMonsterZoneClick: (index: number) => void;
  onSpellZoneClick: (index: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-2xl font-black">{title}</h2>

      <p className="mt-3 text-sm font-bold uppercase tracking-widest text-orange-300">
        Monster Zones
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {field.monsterZones.map((card, index) => (
          <Zone
            key={`${owner}-monster-${index}`}
            label={`Monster Zone ${index + 1}`}
            card={card}
            selected={selectedMonsterZone === index}
            onClick={() => onMonsterZoneClick(index)}
          />
        ))}
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-widest text-purple-300">
        Spell Zones
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {field.spellZones.map((card, index) => (
          <Zone
            key={`${owner}-spell-${index}`}
            label={`Spell Zone ${index + 1}`}
            card={card}
            selected={false}
            onClick={() => onSpellZoneClick(index)}
          />
        ))}
      </div>
    </section>
  );
}

function Zone({
  label,
  card,
  selected,
  onClick,
}: {
  label: string;
  card: DualCard | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[210px] rounded-2xl border p-3 text-left transition ${
        selected
          ? "border-cyan-400 bg-cyan-950/50"
          : "border-slate-700 bg-slate-950"
      } hover:border-cyan-400`}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>

      {card ? (
        <MiniCard card={card} />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-slate-700 text-slate-600">
          Empty
        </div>
      )}
    </button>
  );
}

function HandCard({
  card,
  selected,
  onClick,
}: {
  card: DualCard;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
        selected
          ? "border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-500/20"
          : "border-slate-700 bg-slate-950"
      }`}
    >
      <MiniCard card={card} />
    </button>
  );
}

function MiniCard({ card }: { card: DualCard }) {
  const isSpell = card.type === "spell";

  return (
    <div>
      <div className={`rounded-xl p-3 text-center ${isSpell ? "bg-purple-600/20" : "bg-orange-600/20"}`}>
        <div className="text-4xl">{isSpell ? "🪄" : "🐳"}</div>
        <p className="mt-1 text-xs text-slate-300">
          {isSpell ? "Spell" : "Monster"} | Lv {card.level}
        </p>
      </div>

      <h3 className="mt-3 text-lg font-black text-white">{card.name}</h3>

      {card.imageName && (
        <p className="mt-2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-green-300">
          {card.imageName}
        </p>
      )}

      <p className="mt-2 text-sm text-slate-400">{card.description}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-900 p-2">
          <p className="text-xs text-slate-500">ATK</p>
          <p className="font-black">{card.attack}</p>
        </div>
        <div className="rounded-lg bg-slate-900 p-2">
          <p className="text-xs text-slate-500">DEF</p>
          <p className="font-black">{card.defense}</p>
        </div>
      </div>

      <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-slate-900 p-2 text-xs text-slate-300">
        <code>{card.command}</code>
      </pre>
    </div>
  );
}

function StatusBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
