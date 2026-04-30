import { z } from "zod";
import { readProfile } from "@/lib/profile";
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
  const body = Body.parse(await req.json());
  const profile = await readProfile();

  // Honor SRS due items first (skip in boss/viz)
  const due = body.mode !== "boss" && body.mode !== "viz" ? dueItem(profile) : null;
  let topic = due
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
  // Strip canonical answer + steps before sending — server keeps them.
  // Actually we DO need answer+steps client-side for instant grading & post-answer reveal,
  // since this is single-user local. Keep them.
  return Response.json({ question, srsHit: !!due });
}
