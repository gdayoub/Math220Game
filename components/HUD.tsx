"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "./effects/AnimatedCounter";

type Props = {
  xp: number;
  rank: string;
  streak: number;
  lives?: number;
  maxLives?: number;
  questionIndex?: number;
  totalQuestions?: number;
  characterGlyph?: string;
  characterColor?: string;
};

export function HUD({
  xp, rank, streak, lives, maxLives, questionIndex, totalQuestions,
  characterGlyph, characterColor,
}: Props) {
  const [pop, setPop] = useState(false);
  const prevRef = useRef(streak);
  useEffect(() => {
    if (streak > prevRef.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 450);
      return () => clearTimeout(t);
    }
    prevRef.current = streak;
  }, [streak]);

  return (
    <div className="flex items-center justify-between gap-6 border-b border-[var(--color-border)] px-6 py-3 font-mono text-xs uppercase tracking-widest">
      <div className="flex items-center gap-6">
        {characterGlyph && (
          <span
            className="text-2xl"
            style={{ color: characterColor, textShadow: `0 0 10px ${characterColor}` }}
          >
            {characterGlyph}
          </span>
        )}
        <Stat label="Rank" value={rank} accent />
        <Stat label="XP" value={<AnimatedCounter value={xp} />} />
        <div className="flex gap-2 items-baseline">
          <span className="text-[var(--color-fg-dim)]">Streak</span>
          <span
            className={`inline-block ${streak >= 3 ? "text-[var(--color-accent)] text-glow" : ""} ${pop ? "combo-pop" : ""}`}
            style={{ fontSize: streak >= 5 ? "1.4em" : streak >= 3 ? "1.15em" : undefined }}
          >
            x{streak}
          </span>
        </div>
      </div>
      <div className="flex gap-6 items-center">
        {typeof questionIndex === "number" && typeof totalQuestions === "number" && (
          <Stat label="Q" value={`${questionIndex + 1}/${totalQuestions}`} />
        )}
        {typeof lives === "number" && typeof maxLives === "number" && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-fg-dim)]">LIVES</span>
            <div className="flex gap-1">
              {Array.from({ length: maxLives }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-4 w-4 transition-all ${
                    i < lives
                      ? "bg-[var(--color-accent)] glow-red"
                      : "border border-[var(--color-border)]"
                  }`}
                  style={i < lives ? { transform: "rotate(45deg)" } : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="text-[var(--color-fg-dim)]">{label}</span>
      <span className={accent ? "text-[var(--color-accent)] text-glow" : ""}>{value}</span>
    </div>
  );
}
