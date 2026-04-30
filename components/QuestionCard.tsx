"use client";
import type { Question } from "@/lib/topics";
import { TOPIC_META } from "@/lib/topics";
import { Tex } from "./Tex";

type Props = {
  question: Question;
  feedback?: { correct: boolean; xpDelta: number } | null;
  showSolution?: boolean;
};

export function QuestionCard({ question, feedback, showSolution }: Props) {
  const meta = TOPIC_META[question.topic];
  const flashClass = feedback ? (feedback.correct ? "flash-green" : "flash-red shake") : "";
  return (
    <div className={`border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 ${flashClass}`}>
      <div className="flex justify-between items-center mb-4 font-mono text-xs uppercase tracking-widest">
        <span className="text-[var(--color-accent)] text-glow">{meta.short}</span>
        <span className="text-[var(--color-fg-dim)]">{question.difficulty}</span>
      </div>
      <div className="text-base leading-relaxed">
        <Tex>{question.prompt}</Tex>
      </div>
      {showSolution && (
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
            Solution
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {question.steps.map((s, i) => (
              <li key={i}>
                <Tex>{s}</Tex>
              </li>
            ))}
          </ol>
          <div className="mt-3 border-l-2 border-[var(--color-accent)] pl-3 text-sm">
            <span className="font-mono uppercase text-xs text-[var(--color-accent-soft)] mr-2">
              Watch out:
            </span>
            {question.commonMistake}
          </div>
        </div>
      )}
    </div>
  );
}
