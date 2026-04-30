"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HUD } from "@/components/HUD";
import { Timer } from "@/components/Timer";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { Button } from "@/components/ui/Button";
import type { Question, Confidence } from "@/lib/topics";
import type { Profile } from "@/lib/profile";
import { useClient } from "@/lib/clientStore";
import { getCharacter } from "@/lib/characters";

type Mode = "survival" | "weakness" | "speed" | "boss" | "viz";

const MODE_CONFIG: Record<Mode, { title: string; lives: number | null; total: number | null }> = {
  survival: { title: "SURVIVAL", lives: 3, total: null },
  weakness: { title: "WEAKNESS TRAINING", lives: null, total: null },
  speed: { title: "SPEED RUN", lives: null, total: 10 },
  boss: { title: "BOSS BATTLE", lives: null, total: 10 },
  viz: { title: "VISUALIZATION", lives: null, total: null },
};

export default function PlayPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: modeParam } = use(params);
  const mode = modeParam as Mode;
  const search = useSearchParams();
  const bossTopic = search.get("topic") ?? undefined;
  const baseCfg = MODE_CONFIG[mode] ?? MODE_CONFIG.survival;
  const { selectedCharacter } = useClient();
  const character = getCharacter(selectedCharacter);
  // Apply character lives bonus
  const cfg = {
    ...baseCfg,
    lives: baseCfg.lives !== null ? baseCfg.lives + (character?.bonusLives ?? 0) : null,
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<unknown>("");
  const [confidence, setConfidence] = useState<Confidence>("maybe");
  const [feedback, setFeedback] = useState<{ correct: boolean; xpDelta: number } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(cfg.lives ?? 0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [gameOver, setGameOver] = useState<null | "won" | "lost">(null);
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Initial profile + first question
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
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
        body: JSON.stringify({ mode, bossTopic, questionsAnsweredInRun: idx }),
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
    const data: { correct: boolean; xpDelta: number; profile: Profile } = await res.json();
    setProfile(data.profile);
    setFeedback({ correct: data.correct, xpDelta: data.xpDelta });
    if (data.correct) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
      setShowSolution(true);
      if (cfg.lives !== null) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setGameOver("lost");
        }
      }
    }
  }, [question, userAnswer, confidence, streak, feedback, lives, cfg.lives]);

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

  // Time expired = wrong
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
    const data: { correct: boolean; xpDelta: number; profile: Profile } = await res.json();
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

  // Keyboard: Enter submits or advances
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (gameOver) return;
        if (feedback) advance();
        else submit();
      } else if (e.key === " " && !feedback) {
        // Space toggles solution preview pre-answer (penalty handled implicitly by guess)
      } else if (e.key === "1" && !feedback) setConfidence("sure");
      else if (e.key === "2" && !feedback) setConfidence("maybe");
      else if (e.key === "3" && !feedback) setConfidence("guess");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, submit, advance, gameOver]);

  if (gameOver) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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

      <div className="px-6 pt-3">
        <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-2">
          <Link href="/" className="text-[var(--color-fg-dim)] hover:text-[var(--color-accent)]">
            ← exit
          </Link>
          <span className="text-[var(--color-accent)]">{cfg.title}</span>
          <span className="text-[var(--color-fg-dim)]">[ENTER] submit/next</span>
        </div>
        {question && (
          <Timer
            totalSec={Math.round(question.timeLimitSec * (character?.timeMultiplier ?? 1))}
            active={!feedback && !loading}
            resetKey={question.id}
            onExpire={handleExpire}
          />
        )}
      </div>

      <main className="flex-1 px-6 py-6 max-w-3xl w-full mx-auto">
        {loading || !question ? (
          <div className="font-mono text-[var(--color-fg-dim)] uppercase text-xs tracking-widest animate-pulse">
            Loading next question…
          </div>
        ) : (
          <div className="space-y-6">
            <QuestionCard question={question} feedback={feedback} showSolution={showSolution} />

            {!feedback && (
              <>
                <AnswerInput question={question} onChange={setUserAnswer} />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <ConfidencePicker value={confidence} onChange={setConfidence} />
                  <Button onClick={submit}>Submit ⏎</Button>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-fg-dim)]">
                  [1] sure · [2] maybe · [3] guess
                </p>
              </>
            )}

            {feedback && (
              <div className="flex flex-col gap-3 relative">
                <div
                  className={`font-mono text-2xl uppercase tracking-[0.3em] ${
                    feedback.correct
                      ? "text-[var(--color-success)] text-glow"
                      : "text-[var(--color-accent)]"
                  }`}
                >
                  {feedback.correct ? "▸ CORRECT" : "▸ INCORRECT"}
                </div>
                <div
                  key={feedback.xpDelta + "-" + Date.now()}
                  className={`font-mono text-3xl float-up ${
                    feedback.xpDelta >= 0
                      ? "text-[var(--color-success)] text-glow"
                      : "text-[var(--color-accent)]"
                  }`}
                  style={{ position: "absolute", right: 0, top: 0 }}
                >
                  {feedback.xpDelta >= 0 ? "+" : ""}
                  {feedback.xpDelta} XP
                </div>
                {!showSolution && (
                  <Button variant="ghost" onClick={() => setShowSolution(true)}>
                    Show solution
                  </Button>
                )}
                <Button onClick={advance}>Next ⏎</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1
        className={`font-mono text-5xl tracking-[0.3em] text-glow ${
          outcome === "won" ? "text-[var(--color-success)]" : "text-[var(--color-accent)]"
        }`}
      >
        {outcome === "won" ? "RUN COMPLETE" : "RUN OVER"}
      </h1>
      <div className="border border-[var(--color-border)] p-6 font-mono text-sm space-y-2 min-w-[280px]">
        <Row k="Questions answered" v={String(questionsAnswered)} />
        <Row k="Total XP" v={String(profile?.xp ?? 0)} />
        <Row k="Rank" v={profile?.rank ?? "—"} />
        <Row k="Best streak" v={`x${profile?.bestStreak ?? 0}`} />
      </div>
      <div className="flex gap-3">
        <Button onClick={onRestart}>Run Again</Button>
        <Link href="/">
          <Button variant="ghost">Home</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-8">
      <span className="text-[var(--color-fg-dim)]">{k}</span>
      <span className="text-[var(--color-accent)]">{v}</span>
    </div>
  );
}
