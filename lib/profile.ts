import fs from "node:fs/promises";
import path from "node:path";
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

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");
const HISTORY_PATH = path.join(DATA_DIR, "question-history.jsonl");

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

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readProfile(): Promise<Profile> {
  try {
    const raw = await fs.readFile(PROFILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Profile;
    // Backfill missing topics if schema evolves
    for (const t of ALL_TOPICS) {
      if (!parsed.topics[t]) parsed.topics[t] = emptyTopicStats();
    }
    // Backfill dailyChallenge schema for older profiles
    if (!parsed.dailyChallenge) {
      const today = new Date().toISOString().slice(0, 10);
      parsed.dailyChallenge = {
        date: today,
        question: null,
        completed: 0,
        streak: 0,
        lastDate: "",
      };
    } else if ((parsed.dailyChallenge as { question?: unknown }).question === undefined) {
      parsed.dailyChallenge.question = null;
    }
    return parsed;
  } catch {
    const p = emptyProfile();
    await writeProfile(p);
    return p;
  }
}

export async function writeProfile(p: Profile): Promise<void> {
  await ensureDataDir();
  p.updatedAt = Date.now();
  await fs.writeFile(PROFILE_PATH, JSON.stringify(p, null, 2));
}

export async function appendHistory(entry: HistoryEntry): Promise<void> {
  await ensureDataDir();
  await fs.appendFile(HISTORY_PATH, JSON.stringify(entry) + "\n");
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
