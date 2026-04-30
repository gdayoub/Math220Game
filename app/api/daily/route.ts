import { z } from "zod";
import {
  appendHistory,
  readProfile,
  recordResult,
  rankFor,
  writeProfile,
} from "@/lib/profile";
import { computeXp } from "@/lib/scoring";
import { gradeAnswer } from "@/lib/grade";
import { generateQuestion } from "@/lib/generators";
import { ALL_TOPICS, type Difficulty } from "@/lib/topics";
import { getCharacter } from "@/lib/characters";

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const profile = await readProfile();
  const today = todayStr();

  if (profile.dailyChallenge.date !== today || !profile.dailyChallenge.question) {
    // Reset streak if the player skipped a day
    if (
      profile.dailyChallenge.lastDate &&
      profile.dailyChallenge.lastDate !== yesterdayStr() &&
      profile.dailyChallenge.lastDate !== today
    ) {
      profile.dailyChallenge.streak = 0;
    }

    const topic = ALL_TOPICS[hashStr(today) % ALL_TOPICS.length];
    const difficulty = DIFFS[hashStr(today + "d") % DIFFS.length];
    const question = generateQuestion(topic, difficulty);

    profile.dailyChallenge = {
      ...profile.dailyChallenge,
      date: today,
      question,
      completed: 0,
    };
    await writeProfile(profile);
  }

  return Response.json({
    question: profile.dailyChallenge.question,
    completed: profile.dailyChallenge.completed === 1,
    streak: profile.dailyChallenge.streak,
  });
}

const Body = z.object({
  userAnswer: z.unknown(),
  timeSec: z.number().nonnegative(),
  confidence: z.enum(["sure", "maybe", "guess"]),
  characterId: z
    .enum(["pivot", "spectral", "orthos", "determinant", "nullity", "basis"])
    .nullable()
    .optional(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const profile = await readProfile();
  const today = todayStr();
  const question = profile.dailyChallenge.question;

  if (!question || profile.dailyChallenge.date !== today) {
    return Response.json(
      { error: "no daily question for today — fetch first" },
      { status: 400 },
    );
  }
  if (profile.dailyChallenge.completed === 1) {
    return Response.json(
      { error: "already completed today" },
      { status: 409 },
    );
  }

  const correct = gradeAnswer(question, body.userAnswer);
  recordResult(profile, question.topic, correct, body.timeSec);

  const character = getCharacter(body.characterId ?? null);
  const xpDelta = computeXp({
    correct,
    difficulty: question.difficulty,
    confidence: body.confidence,
    timeSec: body.timeSec,
    timeLimitSec: question.timeLimitSec,
    streak: 0,
    topic: question.topic,
    character,
  });
  // Daily bonus on top of regular XP for a correct first-try answer
  const dailyBonus = correct ? 50 : 0;
  const totalXp = xpDelta + dailyBonus;

  profile.xp = Math.max(0, profile.xp + totalXp);
  profile.rank = rankFor(profile.xp);
  if (correct) {
    profile.dailyChallenge.completed = 1;
    const yesterday = yesterdayStr();
    if (profile.dailyChallenge.lastDate === yesterday) {
      profile.dailyChallenge.streak += 1;
    } else if (profile.dailyChallenge.lastDate !== today) {
      profile.dailyChallenge.streak = 1;
    }
    profile.dailyChallenge.lastDate = today;
  }

  await writeProfile(profile);
  await appendHistory({
    ts: Date.now(),
    questionId: question.id,
    topic: question.topic,
    difficulty: question.difficulty,
    correct,
    timeSec: body.timeSec,
    confidence: body.confidence,
    userAnswer: body.userAnswer,
    correctAnswer: question.answer,
    prompt: question.prompt,
    steps: question.steps,
    commonMistake: question.commonMistake,
  });

  return Response.json({
    correct,
    xpDelta: totalXp,
    bonus: dailyBonus,
    profile,
    streak: profile.dailyChallenge.streak,
  });
}
