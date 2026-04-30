import type { Profile, SrsItem } from "./profile";
import type { Topic } from "./topics";

export function dueItem(p: Profile): SrsItem | null {
  const idx = p.totalQuestions;
  const due = p.srs.find((s) => s.dueAtIndex <= idx);
  return due ?? null;
}

export function popDue(p: Profile): SrsItem | null {
  const idx = p.totalQuestions;
  const i = p.srs.findIndex((s) => s.dueAtIndex <= idx);
  if (i < 0) return null;
  const [item] = p.srs.splice(i, 1);
  return item;
}

export function scheduleAfterAnswer(args: {
  profile: Profile;
  questionId: string;
  topic: Topic;
  conceptTag: string;
  correct: boolean;
  prior?: SrsItem;
}): void {
  const { profile, questionId, topic, conceptTag, correct, prior } = args;
  const idx = profile.totalQuestions;
  if (correct && prior) {
    const newInterval = Math.max(3, Math.round(prior.interval * prior.ease));
    if (newInterval > 30) return; // graduated
    profile.srs.push({
      questionId,
      topic,
      conceptTag,
      dueAtIndex: idx + newInterval,
      interval: newInterval,
      ease: Math.min(2.6, prior.ease + 0.05),
    });
    return;
  }
  if (!correct) {
    const ease = prior ? Math.max(1.3, prior.ease * 0.85) : 2.0;
    profile.srs.push({
      questionId,
      topic,
      conceptTag,
      dueAtIndex: idx + 3,
      interval: 3,
      ease,
    });
  }
}
