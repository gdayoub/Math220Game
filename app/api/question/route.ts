import { z } from "zod";
import { getProfile, getRateLimiter } from "@/lib/store";
import { getUid } from "@/lib/uid";
import { pickNextTopic, pickDifficulty, type GameMode } from "@/lib/adaptive";
import { generateQuestion } from "@/lib/generators";
import { dueItem } from "@/lib/srs";

const Body = z.object({
  mode: z.enum(["survival", "weakness", "boss", "speed", "viz"]),
  bossTopic: z
    .enum(["rref", "independence", "basis", "eigen", "orthogonality", "leastSquares", "matrixOps"])
    .optional(),
  questionsAnsweredInRun: z.number().int().nonnegative().default(0),
});

export async function POST(req: Request) {
  const uid = getUid(req);
  const limiter = getRateLimiter();
  if (limiter) {
    const { success } = await limiter.limit(`q:${uid}`);
    if (!success) {
      return Response.json({ error: "rate limited" }, { status: 429 });
    }
  }

  const body = Body.parse(await req.json());
  const profile = await getProfile(uid);

  const due = body.mode !== "boss" && body.mode !== "viz" ? dueItem(profile) : null;
  const topic = due
    ? due.topic
    : pickNextTopic({
        profile,
        mode: body.mode as GameMode,
        bossTopic: body.bossTopic,
      });

  const difficulty = pickDifficulty({
    profile,
    topic,
    mode: body.mode as GameMode,
    questionsAnsweredInRun: body.questionsAnsweredInRun,
  });

  const question = generateQuestion(topic, difficulty);
  return Response.json({ question, srsHit: !!due });
}
