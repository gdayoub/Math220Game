"use client";
import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/topics";

type Props = {
  question: Question;
  disabled?: boolean;
  onChange: (value: unknown) => void;
};

const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 20,
  padding: "16px 20px",
  border: "4px solid var(--ink)",
  borderRadius: 20,
  boxShadow: "0 4px 0 0 var(--ink)",
  background: "var(--paper)",
  color: "var(--ink)",
  outline: "none",
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

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--grape)";
    e.currentTarget.style.boxShadow = "0 4px 0 0 var(--grape-deep)";
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--ink)";
    e.currentTarget.style.boxShadow = "0 4px 0 0 var(--ink)";
  }

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
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="enter number or fraction (e.g. 3 or -1/2)"
          style={inputBaseStyle}
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="comma separated (e.g. 1, -2, 3)"
          style={inputBaseStyle}
        />
      );
    case "multiple-choice":
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
          }}
        >
          {(question.choices ?? []).map((choice, i) => {
            const active = mc === choice;
            return (
              <motion.button
                key={i}
                type="button"
                disabled={disabled}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setMc(choice);
                  onChange(choice);
                }}
                style={{
                  textAlign: "left",
                  padding: "14px 18px",
                  border: "4px solid var(--ink)",
                  borderRadius: 18,
                  boxShadow: active
                    ? "0 3px 0 0 var(--ink)"
                    : "0 5px 0 0 var(--ink)",
                  transform: active ? "translateY(2px)" : undefined,
                  background: active ? "var(--lemon)" : "var(--paper)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: "var(--ink-soft)",
                    marginRight: 12,
                  }}
                >
                  {String.fromCharCode(65 + i)}.
                </span>
                {choice}
              </motion.button>
            );
          })}
        </div>
      );
    case "boolean":
      return (
        <div style={{ display: "flex", gap: 12 }}>
          {["true", "false"].map((opt) => {
            const active = mc === opt;
            return (
              <motion.button
                key={opt}
                type="button"
                disabled={disabled}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMc(opt);
                  onChange(opt === "true");
                }}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "4px solid var(--ink)",
                  borderRadius: 999,
                  boxShadow: active
                    ? "0 3px 0 0 var(--ink)"
                    : "0 5px 0 0 var(--ink)",
                  transform: active ? "translateY(2px)" : undefined,
                  background: active
                    ? opt === "true"
                      ? "var(--mint)"
                      : "var(--pink)"
                    : "var(--paper)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 17,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      );
    default:
      return (
        <div style={{ color: "var(--ink-soft)" }}>Unsupported input type</div>
      );
  }
});
