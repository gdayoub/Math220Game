import { z } from "zod";
import {
  rankFor,
  recordResult,
  type Profile,
} from "@/lib/profile";
import {
  appendHistory,
  getProfile,
  getRateLimiter,
  saveProfile,
} from "@/lib/store";
import { getUid } from "@/lib/uid";
import { computeXp } from "@/lib/scoring";
import { gradeAnswer } from "@/lib/grade";
import { scheduleAfterAnswer, popDue } from "@/lib/srs";
import { getCharacter } from "@/lib/characters";
import type { Question } from "@/lib/topics";

const Body = z.object({
  question: z.any(),
  userAnswer: z.unknown(),
  timeSec: z.number().nonnegative(),
  confidence: z.enum(["sure", "maybe", "guess"]),
  streak: z.number().int().nonnegative(),
  characterId: z
    .enum(["pivot", "spectral", "orthos", "determinant", "nullity", "basis"])
    .nullable()
    .optional(),
});

export async function POST(req: Request) {
  const uid = getUid(req);
  const limiter = getRateLimiter();
  if (limiter) {
    const { success } = await limiter.limit(`e:${uid}`);
    if (!success) {
      return Response.json({ error: "rate limited" }, { status: 429 });
    }
  }

  const body = Body.parse(await req.json());
  const q = body.question as Question;
  const profile: Profile = await getProfile(uid);

  const correct = gradeAnswer(q, body.userAnswer);

  const prior = popDue(profile);
  scheduleAfterAnswer({
    profile,
    questionId: q.id,
    topic: q.topic,
    conceptTag: q.conceptTag,
    correct,
    prior: prior?.questionId === q.id ? prior : undefined,
  });

  recordResult(profile, q.topic, correct, body.timeSec);

  const character = getCharacter(body.characterId ?? null);
  const xpDelta = computeXp({
    correct,
    difficulty: q.difficulty,
    confidence: body.confidence,
    timeSec: body.timeSec,
    timeLimitSec: q.timeLimitSec,
    streak: body.streak,
    topic: q.topic,
    character,
  });
  profile.xp = Math.max(0, profile.xp + xpDelta);
  profile.rank = rankFor(profile.xp);
  if (correct) {
    const newStreak = body.streak + 1;
    if (newStreak > profile.bestStreak) profile.bestStreak = newStreak;
  }

  await saveProfile(uid, profile);
  await appendHistory(uid, {
    ts: Date.now(),
    questionId: q.id,
    topic: q.topic,
    difficulty: q.difficulty,
    correct,
    timeSec: body.timeSec,
    confidence: body.confidence,
    userAnswer: body.userAnswer,
    correctAnswer: q.answer,
    prompt: q.prompt,
    steps: q.steps,
    commonMistake: q.commonMistake,
  });

  return Response.json({ correct, xpDelta, profile });
}
