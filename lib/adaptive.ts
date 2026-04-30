import type { Profile } from "./profile";
import type { Topic, Difficulty } from "./topics";
import { ALL_TOPICS } from "./topics";

export type GameMode = "survival" | "weakness" | "boss" | "speed" | "viz";

export function pickNextTopic(args: {
  profile: Profile;
  mode: GameMode;
  bossTopic?: Topic;
  forbidConsecutive?: boolean;
}): Topic {
  const { profile, mode, bossTopic, forbidConsecutive = true } = args;

  if (mode === "boss" && bossTopic) return bossTopic;

  const lastTopic = profile.recentTopics[profile.recentTopics.length - 1];
  let candidates: Topic[] = [...ALL_TOPICS];
  if (forbidConsecutive && candidates.length > 1 && lastTopic) {
    candidates = candidates.filter((t) => t !== lastTopic);
  }

  // Score topics by weakness (higher = more likely)
  const scores = candidates.map((t) => {
    const ts = profile.topics[t];
    const acc = ts.attempts === 0 ? 0.5 : ts.correct / ts.attempts;
    let weakness = 1 - acc;
    if (mode === "weakness") weakness = weakness * weakness * 4;
    // Cold-start: untested topics get a baseline weight
    if (ts.attempts === 0) weakness = mode === "weakness" ? 1.2 : 0.7;
    // Frequency penalty: heavily-tested topics get slight reduction
    const freqPenalty = 1 / (1 + ts.attempts / 30);
    return Math.max(0.05, weakness * freqPenalty);
  });

  const total = scores.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= scores[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function pickDifficulty(args: {
  profile: Profile;
  topic: Topic;
  mode: GameMode;
  questionsAnsweredInRun: number;
}): Difficulty {
  const { profile, topic, mode, questionsAnsweredInRun } = args;
  const m = profile.topics[topic].mastery;

  // Survival ramps difficulty over time
  let bias = 0;
  if (mode === "survival") bias = Math.min(0.3, questionsAnsweredInRun * 0.02);
  if (mode === "boss") bias = Math.min(0.4, questionsAnsweredInRun * 0.07);
  if (mode === "speed") bias = 0.1;
  if (mode === "weakness") bias = -0.1;

  const adjusted = m + bias;
  if (adjusted < 0.4) return "easy";
  if (adjusted < 0.75) return "medium";
  return "hard";
}
