import type { CommandCard } from "./cards";
import { STARTER_CARDS } from "./cards";

const CARDS_KEY = "ctcg.cards.v1";
const PROGRESS_KEY = "ctcg.progress.v1";

export interface Progress {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null; // ISO date YYYY-MM-DD
  totalCorrect: number;
  totalAttempts: number;
  badges: string[];
  perMode: { flashcard: number; reverse: number; battle: number };
}

export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: null,
  totalCorrect: 0,
  totalAttempts: 0,
  badges: [],
  perMode: { flashcard: 0, reverse: 0, battle: 0 },
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCards(): CommandCard[] {
  if (!isBrowser()) return STARTER_CARDS;
  try {
    const raw = window.localStorage.getItem(CARDS_KEY);
    if (!raw) {
      window.localStorage.setItem(CARDS_KEY, JSON.stringify(STARTER_CARDS));
      return STARTER_CARDS;
    }
    const parsed = JSON.parse(raw) as CommandCard[];
    if (!Array.isArray(parsed) || parsed.length === 0) return STARTER_CARDS;
    return parsed;
  } catch {
    return STARTER_CARDS;
  }
}

export function saveCards(cards: CommandCard[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function loadProgress(): Progress {
  if (!isBrowser()) return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(p: Progress) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function xpForLevel(level: number) {
  return 50 * level * level; // 50, 200, 450, 800, ...
}

export function levelFromXp(xp: number) {
  let lvl = 1;
  while (xp >= xpForLevel(lvl)) lvl++;
  return lvl;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const BADGE_RULES: { id: string; label: string; emoji: string; check: (p: Progress) => boolean }[] = [
  { id: "first-blood", label: "First Correct", emoji: "🩸", check: (p) => p.totalCorrect >= 1 },
  { id: "warm-up", label: "Warming Up (10 correct)", emoji: "🔥", check: (p) => p.totalCorrect >= 10 },
  { id: "centurion", label: "Centurion (100 correct)", emoji: "💯", check: (p) => p.totalCorrect >= 100 },
  { id: "streak-3", label: "3-Day Streak", emoji: "⚡", check: (p) => p.streak >= 3 },
  { id: "streak-7", label: "7-Day Streak", emoji: "🌟", check: (p) => p.streak >= 7 },
  { id: "level-5", label: "Level 5", emoji: "🎖️", check: (p) => p.level >= 5 },
  { id: "battlemaster", label: "Battlemaster (25 battles won)", emoji: "⚔️", check: (p) => p.perMode.battle >= 25 },
  { id: "polyglot", label: "Polyglot (all three modes)", emoji: "🧠",
    check: (p) => p.perMode.flashcard > 0 && p.perMode.reverse > 0 && p.perMode.battle > 0 },
];

export function awardAnswer(
  prev: Progress,
  opts: { correct: boolean; mode: "flashcard" | "reverse" | "battle"; powerXp: number },
): { next: Progress; leveledUp: boolean; newBadges: string[] } {
  const today = todayStr();
  const xpGain = opts.correct ? Math.max(5, Math.round(opts.powerXp / 5)) : 1;

  let streak = prev.streak;
  if (prev.lastPlayedDate !== today) {
    if (prev.lastPlayedDate) {
      const last = new Date(prev.lastPlayedDate);
      const diff = (new Date(today).getTime() - last.getTime()) / 86400000;
      streak = diff === 1 ? prev.streak + 1 : 1;
    } else {
      streak = 1;
    }
  }

  const next: Progress = {
    ...prev,
    xp: prev.xp + xpGain,
    streak,
    lastPlayedDate: today,
    totalCorrect: prev.totalCorrect + (opts.correct ? 1 : 0),
    totalAttempts: prev.totalAttempts + 1,
    perMode: {
      ...prev.perMode,
      [opts.mode]: prev.perMode[opts.mode] + (opts.correct ? 1 : 0),
    },
  };
  next.level = levelFromXp(next.xp);

  const newBadges: string[] = [];
  for (const rule of BADGE_RULES) {
    if (rule.check(next) && !next.badges.includes(rule.id)) {
      next.badges.push(rule.id);
      newBadges.push(rule.id);
    }
  }

  return { next, leveledUp: next.level > prev.level, newBadges };
}

export function getBadgeMeta(id: string) {
  return BADGE_RULES.find((b) => b.id === id);
}

export const ALL_BADGES = BADGE_RULES;