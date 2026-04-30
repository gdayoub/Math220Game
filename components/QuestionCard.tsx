"use client";
import { motion } from "framer-motion";
import type { Question } from "@/lib/topics";
import { TOPIC_META } from "@/lib/topics";
import { Tex } from "./Tex";
import { Pill } from "./ui/Pill";
import { ConceptTooltip } from "./ui/ConceptTooltip";

type Props = {
  question: Question;
  feedback?: { correct: boolean; xpDelta: number } | null;
  showSolution?: boolean;
};

const TOPIC_COLORS: Record<string, string> = {
  rref: "var(--mint)",
  independence: "var(--sky)",
  basis: "var(--peach)",
  eigen: "var(--grape)",
  orthogonality: "var(--pink)",
  leastSquares: "var(--lemon)",
  matrixOps: "var(--mint)",
};

export function QuestionCard({ question, feedback, showSolution }: Props) {
  const meta = TOPIC_META[question.topic];
  const bg = feedback?.correct
    ? "#E6FFF5"
    : feedback
      ? "#FFE6EE"
      : "var(--paper)";
  const topicColor = TOPIC_COLORS[question.topic] ?? "var(--lemon)";
  const isDarkChip = topicColor === "var(--grape)";

  return (
    <motion.div
      key={question.id}
      initial={{ y: 30, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      data-light-card
      data-feedback={feedback ? (feedback.correct ? "correct" : "wrong") : undefined}
      style={{
        background: bg,
        border: "4px solid var(--ink)",
        borderRadius: 28,
        boxShadow: "0 8px 0 0 var(--ink)",
        padding: "26px 28px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <ConceptTooltip topic={question.topic}>
          <span data-pill-on-dark={isDarkChip ? "" : undefined}>
            <Pill
              color={topicColor}
              textColor={isDarkChip ? "var(--cream)" : "var(--ink)"}
            >
              {meta.short} ⓘ
            </Pill>
          </span>
        </ConceptTooltip>
        <span
          data-on-paper-soft
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 12,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {question.difficulty}
        </span>
      </div>
      <div
        data-on-paper
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 20,
          color: "var(--ink)",
          lineHeight: 1.4,
        }}
      >
        <Tex>{question.prompt}</Tex>
      </div>

      {showSolution && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "3px dashed var(--ink)",
          }}
        >
          <div
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Solution
          </div>
          <ol
            data-on-paper
            style={{
              listStyle: "decimal",
              paddingLeft: 22,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 15,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            {question.steps.map((s, i) => (
              <li key={i}>
                <Tex>{s}</Tex>
              </li>
            ))}
          </ol>
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "var(--lemon)",
              border: "3px solid var(--ink)",
              borderRadius: 16,
              boxShadow: "0 3px 0 0 var(--ink)",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginRight: 8,
              }}
            >
              Watch out:
            </span>
            {question.commonMistake}
          </div>
        </div>
      )}
    </motion.div>
  );
}
