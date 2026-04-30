"use client";
import { forwardRef, useEffect, useState } from "react";
import type { Question } from "@/lib/topics";

type Props = {
  question: Question;
  disabled?: boolean;
  onChange: (value: unknown) => void;
};

export const AnswerInput = forwardRef<HTMLInputElement, Props>(function AnswerInput(
  { question, disabled, onChange },
  ref,
) {
  const [scalar, setScalar] = useState("");
  const [vector, setVector] = useState("");
  const [mc, setMc] = useState<string | null>(null);

  useEffect(() => {
    setScalar("");
    setVector("");
    setMc(null);
  }, [question.id]);

  switch (question.inputType) {
    case "scalar":
      return (
        <input
          ref={ref}
          autoFocus
          disabled={disabled}
          value={scalar}
          onChange={(e) => {
            setScalar(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="enter number or fraction (e.g. 3 or -1/2)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] focus:border-[var(--color-accent)] px-3 py-2 font-mono text-lg"
        />
      );
    case "vector":
      return (
        <input
          ref={ref}
          autoFocus
          disabled={disabled}
          value={vector}
          onChange={(e) => {
            setVector(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="comma or space separated (e.g. 1, -2, 3)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] focus:border-[var(--color-accent)] px-3 py-2 font-mono text-lg"
        />
      );
    case "multiple-choice":
      return (
        <div className="grid grid-cols-1 gap-2">
          {(question.choices ?? []).map((choice, i) => {
            const active = mc === choice;
            return (
              <button
                key={i}
                disabled={disabled}
                onClick={() => {
                  setMc(choice);
                  onChange(choice);
                }}
                className={`text-left px-4 py-2 border font-mono ${
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[color:var(--color-accent)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                } transition-colors`}
              >
                <span className="text-[var(--color-fg-dim)] mr-3">{String.fromCharCode(65 + i)}.</span>
                {choice}
              </button>
            );
          })}
        </div>
      );
    case "boolean":
      return (
        <div className="flex gap-3">
          {["true", "false"].map((opt) => {
            const active = mc === opt;
            return (
              <button
                key={opt}
                disabled={disabled}
                onClick={() => {
                  setMc(opt);
                  onChange(opt === "true");
                }}
                className={`px-6 py-2 border font-mono uppercase ${
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    default:
      return <div className="text-[var(--color-fg-dim)]">Unsupported input type</div>;
  }
});
