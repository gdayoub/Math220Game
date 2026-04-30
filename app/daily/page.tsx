"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Question, Confidence } from "@/lib/topics";
import { useClient } from "@/lib/clientStore";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { Confetti } from "@/components/ui/Confetti";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { PaperHint } from "@/components/ui/PaperHint";

type DailyState = {
  question: Question | null;
  completed: boolean;
  streak: number;
};

export default function DailyPage() {
  const { selectedCharacter } = useClient();
  const [state, setState] = useState<DailyState | null>(null);
  const [userAnswer, setUserAnswer] = useState<unknown>("");
  const [confidence, setConfidence] = useState<Confidence>("maybe");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    xpDelta: number;
    bonus: number;
  } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetch("/api/daily")
      .then((r) => r.json())
      .then((d) => {
        setState(d);
        if (d.completed) setShowSolution(true);
        startTimeRef.current = Date.now();
      });
  }, []);

  const submit = useCallback(async () => {
    if (!state?.question || feedback || state.completed) return;
    const timeSec = (Date.now() - startTimeRef.current) / 1000;
    const res = await fetch("/api/daily", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userAnswer,
        timeSec,
        confidence,
        characterId: selectedCharacter,
      }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setFeedback({ correct: data.correct, xpDelta: data.xpDelta, bonus: data.bonus });
    setShowSolution(true);
    setState((s) => (s ? { ...s, completed: data.correct, streak: data.streak } : s));
    if (data.correct) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
  }, [state, feedback, userAnswer, confidence, selectedCharacter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !feedback) {
        e.preventDefault();
        submit();
      } else if (e.key === "1" && !feedback) setConfidence("sure");
      else if (e.key === "2" && !feedback) setConfidence("maybe");
      else if (e.key === "3" && !feedback) setConfidence("guess");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, submit]);

  return (
    <>
      <ScreenShell
        title="Daily Challenge"
        subtitle={
          state?.completed
            ? "Today's solved. Streak protected — see you tomorrow."
            : "One question. One shot. Keep your streak alive."
        }
        glyph="✦"
        accent="var(--lemon)"
      >
        {/* Streak chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: state && state.streak > 0 ? "var(--lemon)" : "var(--paper)",
              border: "4px solid var(--ink)",
              borderRadius: 999,
              boxShadow: "0 4px 0 0 var(--ink)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "var(--ink)",
            }}
          >
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Daily streak
            </span>
            <span style={{ fontSize: 18 }}>🔥 {state?.streak ?? 0}</span>
          </div>
        </div>

        {state?.question ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <QuestionCard
              question={state.question}
              feedback={feedback}
              showSolution={showSolution}
            />

            {!feedback && !state.completed && (
              <>
                <AnswerInput question={state.question} onChange={setUserAnswer} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <ConfidencePicker value={confidence} onChange={setConfidence} />
                  <ChunkyButton color="var(--lemon)" onClick={submit}>
                    Submit ⏎
                  </ChunkyButton>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    [1] sure · [2] maybe · [3] guess · One attempt only
                  </p>
                  <PaperHint show={state.question.difficulty !== "easy"} />
                </div>
              </>
            )}

            {feedback && (
              <motion.div
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 28,
                      color: feedback.correct
                        ? "var(--mint-deep)"
                        : "var(--pink-deep)",
                      WebkitTextStroke: "2px var(--ink)",
                      textShadow: "0 4px 0 var(--ink)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {feedback.correct ? "★ DAILY DONE" : "✕ NOT TODAY"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 24,
                      color: feedback.xpDelta >= 0 ? "var(--mint-deep)" : "var(--pink-deep)",
                      WebkitTextStroke: "2px var(--ink)",
                    }}
                  >
                    {feedback.xpDelta >= 0 ? "+" : ""}
                    {feedback.xpDelta} XP
                    {feedback.bonus > 0 && (
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 14,
                          color: "var(--ink-soft)",
                          WebkitTextStroke: 0,
                        }}
                      >
                        (incl. +{feedback.bonus} daily bonus)
                      </span>
                    )}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--ink-soft)",
                  }}
                >
                  {feedback.correct
                    ? "Streak preserved. Come back tomorrow for the next one."
                    : "No streak today — try a Boss run on this topic to lock it in."}
                </p>
                <Link href="/">
                  <ChunkyButton color="var(--mint)">Home</ChunkyButton>
                </Link>
              </motion.div>
            )}

            {state.completed && !feedback && (
              <div
                data-light-card
                style={{
                  background: "var(--paper)",
                  border: "4px solid var(--ink)",
                  borderRadius: 22,
                  boxShadow: "0 6px 0 0 var(--ink)",
                  padding: "18px 22px",
                }}
              >
                <p
                  data-on-paper
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--ink)",
                  }}
                >
                  ★ Already done today. Streak: {state.streak}. The solution is
                  visible — see you tomorrow.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "20px 0",
            }}
          >
            Loading today's challenge…
          </div>
        )}
      </ScreenShell>
      <AnimatePresence>{confetti && <Confetti />}</AnimatePresence>
      <ThemePicker />
    </>
  );
}
