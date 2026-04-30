import type { Topic, Difficulty, Confidence, Question } from "./topics";
import { ALL_TOPICS } from "./topics";

export type TopicStats = {
  attempts: number;
  correct: number;
  totalTimeSec: number;
  recentResults: Array<0 | 1>; // last 20
  mastery: number; // 0..1
};

export type SrsItem = {
  questionId: string;
  topic: Topic;
  conceptTag: string;
  dueAtIndex: number;
  interval: number;
  ease: number;
};

export type HistoryEntry = {
  ts: number;
  questionId: string;
  topic: Topic;
  difficulty: Difficulty;
  correct: boolean;
  timeSec: number;
  confidence: Confidence;
  userAnswer: unknown;
  correctAnswer: unknown;
  prompt: string;
  steps: string[];
  commonMistake: string;
};

export type Profile = {
  xp: number;
  rank: string;
  totalQuestions: number;
  totalCorrect: number;
  bestStreak: number;
  topics: Record<Topic, TopicStats>;
  srs: SrsItem[];
  recentTopics: Topic[]; // last 5
  dailyChallenge: {
    date: string;
    question: Question | null;
    completed: number;
    streak: number;
    lastDate: string;
  };
  createdAt: number;
  updatedAt: number;
};

function emptyTopicStats(): TopicStats {
  return { attempts: 0, correct: 0, totalTimeSec: 0, recentResults: [], mastery: 0.3 };
}

export function emptyProfile(): Profile {
  const topics = {} as Record<Topic, TopicStats>;
  for (const t of ALL_TOPICS) topics[t] = emptyTopicStats();
  const today = new Date().toISOString().slice(0, 10);
  return {
    xp: 0,
    rank: "Beginner",
    totalQuestions: 0,
    totalCorrect: 0,
    bestStreak: 0,
    topics,
    srs: [],
    recentTopics: [],
    dailyChallenge: { date: today, question: null, completed: 0, streak: 0, lastDate: "" },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Backfill missing fields on a profile loaded from older storage. Returns the same profile. */
export function backfillProfile(p: Profile): Profile {
  for (const t of ALL_TOPICS) {
    if (!p.topics[t]) p.topics[t] = emptyTopicStats();
  }
  if (!p.dailyChallenge) {
    const today = new Date().toISOString().slice(0, 10);
    p.dailyChallenge = {
      date: today,
      question: null,
      completed: 0,
      streak: 0,
      lastDate: "",
    };
  } else if ((p.dailyChallenge as { question?: unknown }).question === undefined) {
    p.dailyChallenge.question = null;
  }
  return p;
}

export function rankFor(xp: number): string {
  if (xp >= 8000) return "Matrix Master";
  if (xp >= 2000) return "Advanced";
  if (xp >= 500) return "Intermediate";
  return "Beginner";
}

export function recordResult(
  p: Profile,
  topic: Topic,
  correct: boolean,
  timeSec: number,
): void {
  const ts = p.topics[topic];
  ts.attempts += 1;
  if (correct) ts.correct += 1;
  ts.totalTimeSec += timeSec;
  ts.recentResults.push(correct ? 1 : 0);
  if (ts.recentResults.length > 20) ts.recentResults.shift();
  // EMA-style mastery update
  const target = correct ? 1 : 0;
  ts.mastery = ts.mastery * 0.85 + target * 0.15;

  p.totalQuestions += 1;
  if (correct) p.totalCorrect += 1;

  p.recentTopics.push(topic);
  if (p.recentTopics.length > 5) p.recentTopics.shift();
}
