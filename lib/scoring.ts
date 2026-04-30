import type { Difficulty, Confidence, Topic } from "./topics";
import type { Character } from "./characters";

const BASE_XP: Record<Difficulty, number> = { easy: 10, medium: 25, hard: 60 };

const CONF_MULT_CORRECT: Record<Confidence, number> = {
  sure: 1.5,
  maybe: 1.0,
  guess: 0.7,
};
const CONF_MULT_WRONG: Record<Confidence, number> = {
  sure: -1.0,
  maybe: -0.3,
  guess: 0,
};

export function computeXp(args: {
  correct: boolean;
  difficulty: Difficulty;
  confidence: Confidence;
  timeSec: number;
  timeLimitSec: number;
  streak: number;
  topic: Topic;
  character?: Character | null;
}): number {
  const { correct, difficulty, confidence, timeSec, timeLimitSec, streak, topic, character } = args;
  const base = BASE_XP[difficulty];
  const speedFraction = Math.max(0, 1 - timeSec / timeLimitSec);
  const speedBonus = correct ? speedFraction * base * 0.5 : 0;
  const confMult = correct ? CONF_MULT_CORRECT[confidence] : CONF_MULT_WRONG[confidence];
  const streakMult = correct ? 1 + Math.min(streak, 10) * 0.1 : 1;
  const topicMult = (character?.topicXpMultiplier?.[topic] ?? 1) || 1;
  const globalMult = character?.globalXpMultiplier ?? 1;
  const charMult = correct ? topicMult * globalMult : 1;
  return Math.round((base + speedBonus) * confMult * streakMult * charMult);
}
