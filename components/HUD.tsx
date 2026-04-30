"use client";
import { motion } from "framer-motion";
import { Stat } from "./ui/Stat";
import { Heart } from "./ui/Heart";

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
  xp,
  rank,
  streak,
  lives,
  maxLives,
  questionIndex,
  totalQuestions,
  characterGlyph,
  characterColor,
}: Props) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      data-light-card
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        background: "var(--paper)",
        border: "4px solid var(--ink)",
        borderRadius: 999,
        boxShadow: "0 6px 0 0 var(--ink)",
        padding: "10px 22px",
        flexWrap: "wrap",
        rowGap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          rowGap: 8,
        }}
      >
        {characterGlyph && (
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 40,
              height: 40,
              background: characterColor,
              border: "3px solid var(--ink)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: characterGlyph.length > 1 ? 13 : 18,
              color: "var(--ink)",
              boxShadow: "0 3px 0 0 var(--ink)",
            }}
          >
            {characterGlyph}
          </motion.div>
        )}
        <span data-on-paper>
          <Stat label="Rank" value={rank} accent />
        </span>
        <span data-on-paper>
          <Stat label="XP" value={xp.toLocaleString()} />
        </span>
        <motion.div
          animate={streak >= 3 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: streak >= 3 ? "var(--lemon)" : "var(--cream-deep)",
            border: "3px solid var(--ink)",
            borderRadius: 999,
            padding: "4px 14px",
            boxShadow: "0 3px 0 0 var(--ink)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 11,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
            }}
          >
            Streak
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
            }}
          >
            x{streak}
          </span>
        </motion.div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "nowrap",
        }}
      >
        {typeof questionIndex === "number" && typeof totalQuestions === "number" && (
          <span data-on-paper>
            <Stat label="Q" value={`${questionIndex + 1} / ${totalQuestions}`} />
          </span>
        )}
        {typeof lives === "number" && typeof maxLives === "number" && (
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart key={i} filled={i < lives} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
