import type { DualCard } from "./dualCards";
import { fullStackLabMonster } from "./dualCards";

export function fusionStats(cardA: DualCard, cardB: DualCard) {
  const strongestAttack = Math.max(cardA.attack, cardB.attack);
  const weakestAttack = Math.min(cardA.attack, cardB.attack);

  const strongestDefense = Math.max(cardA.defense, cardB.defense);
  const weakestDefense = Math.min(cardA.defense, cardB.defense);

  return {
    attack: strongestAttack + Math.floor(weakestAttack / 2),
    defense: strongestDefense + Math.floor(weakestDefense / 2),
    level: Math.min(8, Math.max(cardA.level, cardB.level) + 2),
  };
}

export function canFuse(selectedCards: DualCard[]) {
  const ids = selectedCards.map((card) => card.id);

  return (
    ids.includes("monster-docker-nginx") &&
    ids.includes("monster-docker-postgres") &&
    ids.includes("spell-docker-compose-fusion")
  );
}

export function createFusionMonster(selectedCards: DualCard[]) {
  if (!canFuse(selectedCards)) {
    return null;
  }

  const webMonster = selectedCards.find(
    (card) => card.id === "monster-docker-nginx"
  );

  const dbMonster = selectedCards.find(
    (card) => card.id === "monster-docker-postgres"
  );

  if (!webMonster || !dbMonster || !fullStackLabMonster) {
    return null;
  }

  const stats = fusionStats(webMonster, dbMonster);

  return {
    ...fullStackLabMonster,
    attack: stats.attack,
    defense: stats.defense,
    level: stats.level,
  };
}
