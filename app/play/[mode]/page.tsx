"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/HUD";
import { Timer } from "@/components/Timer";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { Pill } from "@/components/ui/Pill";
import { Confetti } from "@/components/ui/Confetti";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { ReviewNudge } from "@/components/ui/ReviewNudge";
import { PaperHint } from "@/components/ui/PaperHint";
import type { Topic } from "@/lib/topics";
import type { Question, Confidence } from "@/lib/topics";
import type { Profile } from "@/lib/profile";
import { useClient } from "@/lib/clientStore";
import { getCharacter } from "@/lib/characters";

type Mode = "survival" | "weakness" | "speed" | "boss" | "viz";

const MODE_CONFIG: Record<
  Mode,
  { title: string; lives: number | null; total: number | null }
> = {
  survival: { title: "SURVIVAL", lives: 3, total: null },
  weakness: { title: "WEAKNESS TRAINING", lives: null, total: null },
  speed: { title: "SPEED RUN", lives: null, total: 10 },
  boss: { title: "BOSS BATTLE", lives: null, total: 10 },
  viz: { title: "VISUALIZATION", lives: null, total: null },
};

export default function PlayPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode: modeParam } = use(params);
  const mode = modeParam as Mode;
  const search = useSearchParams();
  const bossTopic = search.get("topic") ?? undefined;
  const baseCfg = MODE_CONFIG[mode] ?? MODE_CONFIG.survival;
  const { selectedCharacter } = useClient();
  const character = getCharacter(selectedCharacter);
  const cfg = {
    ...baseCfg,
    lives:
      baseCfg.lives !== null
        ? baseCfg.lives + (character?.bonusLives ?? 0)
        : null,
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<unknown>("");
  const [confidence, setConfidence] = useState<Confidence>("maybe");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    xpDelta: number;
  } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(cfg.lives ?? 0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [gameOver, setGameOver] = useState<null | "won" | "lost">(null);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [topicMissStreak, setTopicMissStreak] = useState<{ topic: Topic; count: number } | null>(null);
  const [nudgeTopic, setNudgeTopic] = useState<Topic | null>(null);
  const [nudgeDismissedFor, setNudgeDismissedFor] = useState<Topic | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
    void fetchNext(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNext = useCallback(
    async (idx: number) => {
      setLoading(true);
      setFeedback(null);
      setShowSolution(false);
      setUserAnswer("");
      setConfidence("maybe");
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          bossTopic,
          questionsAnsweredInRun: idx,
        }),
      });
      const data = await res.json();
      setQuestion(data.question);
      startTimeRef.current = Date.now();
      setLoading(false);
    },
    [mode, bossTopic],
  );

  const submit = useCallback(async () => {
    if (!question || feedback) return;
    const timeSec = (Date.now() - startTimeRef.current) / 1000;
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question,
        userAnswer,
        timeSec,
        confidence,
        streak,
        characterId: selectedCharacter,
      }),
    });
    const data: {
      correct: boolean;
      xpDelta: number;
      profile: Profile;
    } = await res.json();
    setProfile(data.profile);
    setFeedback({ correct: data.correct, xpDelta: data.xpDelta });
    if (data.correct) {
      setStreak((s) => s + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
      // Reset same-topic miss streak on a correct answer
      setTopicMissStreak(null);
    } else {
      setStreak(0);
      setShowSolution(true);
      if (cfg.lives !== null) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) setGameOver("lost");
      }
      // Track consecutive misses on the same topic
      const next =
        topicMissStreak && topicMissStreak.topic === question.topic
          ? { topic: question.topic, count: topicMissStreak.count + 1 }
          : { topic: question.topic, count: 1 };
      setTopicMissStreak(next);
      if (next.count >= 3 && nudgeDismissedFor !== next.topic) {
        setNudgeTopic(next.topic);
      }
    }
  }, [
    question,
    userAnswer,
    confidence,
    streak,
    feedback,
    lives,
    cfg.lives,
    selectedCharacter,
    topicMissStreak,
    nudgeDismissedFor,
  ]);

  const advance = useCallback(() => {
    if (gameOver) return;
    const next = questionIndex + 1;
    if (cfg.total !== null && next >= cfg.total) {
      setGameOver("won");
      return;
    }
    setQuestionIndex(next);
    void fetchNext(next);
  }, [questionIndex, cfg.total, gameOver, fetchNext]);

  const handleExpire = useCallback(async () => {
    if (!question || feedback) return;
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question,
        userAnswer: "",
        timeSec: question.timeLimitSec,
        confidence,
        streak,
      }),
    });
    const data: {
      correct: boolean;
      xpDelta: number;
      profile: Profile;
    } = await res.json();
    setProfile(data.profile);
    setFeedback({ correct: false, xpDelta: data.xpDelta });
    setShowSolution(true);
    setStreak(0);
    if (cfg.lives !== null) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameOver("lost");
    }
  }, [question, feedback, confidence, streak, lives, cfg.lives]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (gameOver) return;
        if (feedback) advance();
        else submit();
      } else if (e.key === "1" && !feedback) setConfidence("sure");
      else if (e.key === "2" && !feedback) setConfidence("maybe");
      else if (e.key === "3" && !feedback) setConfidence("guess");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, submit, advance, gameOver]);

  if (gameOver) {
    return (
      <>
        <GameOverScreen
          outcome={gameOver}
          profile={profile}
          questionsAnswered={questionIndex + (feedback ? 1 : 0)}
          onRestart={() => {
            setGameOver(null);
            setLives(cfg.lives ?? 0);
            setQuestionIndex(0);
            setStreak(0);
            void fetchNext(0);
          }}
        />
        <ThemePicker />
      </>
    );
  }

  return (
    <div
      style={{
        padding: "20px 32px 60px",
        maxWidth: 920,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          gap: 12,
          flexWrap: "nowrap",
        }}
      >
        <Link href="/">
          <ChunkyButton size="sm" color="var(--paper)">
            ← Exit
          </ChunkyButton>
        </Link>
        <Pill color="var(--lemon)">{cfg.title}</Pill>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 12,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          [Enter] submit
        </span>
      </div>

      <HUD
        xp={profile?.xp ?? 0}
        rank={profile?.rank ?? "Beginner"}
        streak={streak}
        lives={cfg.lives !== null ? lives : undefined}
        maxLives={cfg.lives !== null ? cfg.lives : undefined}
        questionIndex={cfg.total !== null ? questionIndex : undefined}
        totalQuestions={cfg.total ?? undefined}
        characterGlyph={character?.glyph}
        characterColor={character?.color}
      />

      {question && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Timer
            totalSec={Math.round(
              question.timeLimitSec * (character?.timeMultiplier ?? 1),
            )}
            active={!feedback && !loading}
            resetKey={question.id}
            onExpire={handleExpire}
          />
        </div>
      )}

      <ReviewNudge
        topic={nudgeTopic}
        onDismiss={() => {
          if (nudgeTopic) setNudgeDismissedFor(nudgeTopic);
          setNudgeTopic(null);
        }}
      />

      <main style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {loading || !question ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
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
            Loading next question…
          </motion.div>
        ) : (
          <>
            <QuestionCard
              question={question}
              feedback={feedback}
              showSolution={showSolution}
            />

            {!feedback ? (
              <>
                <AnswerInput question={question} onChange={setUserAnswer} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <ConfidencePicker
                    value={confidence}
                    onChange={setConfidence}
                  />
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
                    [1] sure · [2] maybe · [3] guess
                  </p>
                  <PaperHint show={question.difficulty === "hard"} />
                </div>
              </>
            ) : (
              <FeedbackPanel
                feedback={feedback}
                showSolution={showSolution}
                onShowSolution={() => setShowSolution(true)}
                onAdvance={advance}
              />
            )}
          </>
        )}
      </main>

      <AnimatePresence>{confetti && <Confetti />}</AnimatePresence>
      <ThemePicker />
    </div>
  );
}

function FeedbackPanel({
  feedback,
  showSolution,
  onShowSolution,
  onAdvance,
}: {
  feedback: { correct: boolean; xpDelta: number };
  showSolution: boolean;
  onShowSolution: () => void;
  onAdvance: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            color: feedback.correct ? "var(--mint-deep)" : "var(--pink-deep)",
            WebkitTextStroke: "2px var(--ink)",
            textShadow: "0 4px 0 var(--ink)",
            letterSpacing: "0.02em",
          }}
        >
          {feedback.correct ? "★ CORRECT" : "✕ INCORRECT"}
        </span>
        <motion.span
          key={feedback.xpDelta}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -16, opacity: [1, 1, 0] }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 26,
            color: feedback.xpDelta >= 0 ? "var(--mint-deep)" : "var(--pink-deep)",
            WebkitTextStroke: "2px var(--ink)",
          }}
        >
          {feedback.xpDelta >= 0 ? "+" : ""}
          {feedback.xpDelta} XP
        </motion.span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {!showSolution && (
          <ChunkyButton size="sm" color="var(--paper)" onClick={onShowSolution}>
            Show solution
          </ChunkyButton>
        )}
        <ChunkyButton color="var(--mint)" onClick={onAdvance}>
          Next ⏎
        </ChunkyButton>
      </div>
    </motion.div>
  );
}

function GameOverScreen({
  outcome,
  profile,
  questionsAnswered,
  onRestart,
}: {
  outcome: "won" | "lost";
  profile: Profile | null;
  questionsAnswered: number;
  onRestart: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 32,
      }}
    >
      <motion.h1
        data-wordmark
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 64,
          color: outcome === "won" ? "var(--mint)" : "var(--pink)",
          WebkitTextStroke: "4px var(--ink)",
          textShadow: "0 7px 0 var(--ink)",
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}
      >
        {outcome === "won" ? "RUN COMPLETE" : "RUN OVER"}
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
        data-light-card
        style={{
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: 28,
          boxShadow: "0 8px 0 0 var(--ink)",
          padding: 28,
          minWidth: 320,
        }}
      >
        <div
          data-on-paper
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Row k="Questions answered" v={String(questionsAnswered)} />
          <Row k="Total XP" v={String(profile?.xp ?? 0)} />
          <Row k="Rank" v={profile?.rank ?? "—"} />
          <Row k="Best streak" v={`x${profile?.bestStreak ?? 0}`} />
        </div>
      </motion.div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <ChunkyButton color="var(--lemon)" onClick={onRestart}>
          Run Again
        </ChunkyButton>
        <Link href="/">
          <ChunkyButton color="var(--paper)">Home</ChunkyButton>
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      data-on-paper
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 32,
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 15,
      }}
    >
      <span data-on-paper-soft style={{ color: "var(--ink-soft)" }}>{k}</span>
      <span style={{ color: "var(--ink)" }}>{v}</span>
    </div>
  );
}
