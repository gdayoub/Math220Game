"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  /** 0..1 progress */
  t: number;
  onChange: (t: number) => void;
  playing: boolean;
  onPlayingChange: (p: boolean) => void;
  /** seconds for full 0→1 sweep */
  duration?: number;
  reducedMotion?: boolean;
};

/** Slider + play/pause/reset that animates t from 0 → 1 via rAF. */
export function PlayScrub({
  t,
  onChange,
  playing,
  onPlayingChange,
  duration = 1.2,
  reducedMotion = false,
}: Props) {
  const tRef = useRef(t);
  tRef.current = t;
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      startedAt.current = null;
      return;
    }
    if (reducedMotion) {
      onChange(1);
      onPlayingChange(false);
      return;
    }
    let raf = 0;
    const step = (now: number) => {
      if (startedAt.current === null) {
        startedAt.current = now - tRef.current * duration * 1000;
      }
      const elapsed = (now - startedAt.current) / 1000;
      const next = Math.min(1, elapsed / duration);
      onChange(next);
      if (next < 1) raf = requestAnimationFrame(step);
      else onPlayingChange(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, reducedMotion, onChange, onPlayingChange]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--cream-deep)",
        border: "3px solid var(--ink)",
        borderRadius: 16,
        boxShadow: "0 4px 0 0 var(--ink)",
      }}
    >
      <ScrubBtn
        onClick={() => {
          if (t >= 1) {
            onChange(0);
            onPlayingChange(true);
          } else {
            onPlayingChange(!playing);
          }
        }}
        ariaLabel={playing ? "Pause animation" : "Play animation"}
      >
        {playing ? "❚❚" : t >= 1 ? "↻" : "▶"}
      </ScrubBtn>
      <ScrubBtn
        onClick={() => {
          onChange(0);
          onPlayingChange(false);
        }}
        ariaLabel="Reset animation"
      >
        ⏮
      </ScrubBtn>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={t}
        onChange={(e) => {
          onChange(parseFloat(e.target.value));
          onPlayingChange(false);
        }}
        aria-label="Transformation progress"
        style={{ flex: 1, accentColor: "var(--accent-2)" }}
      />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 12,
          color: "var(--ink-soft)",
          minWidth: 40,
          textAlign: "right",
        }}
      >
        t = {t.toFixed(2)}
      </span>
    </div>
  );
}

function ScrubBtn({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      style={{
        background: "var(--paper)",
        border: "3px solid var(--ink)",
        borderRadius: 12,
        boxShadow: "0 3px 0 0 var(--ink)",
        padding: "6px 12px",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 14,
        color: "var(--ink)",
        cursor: "pointer",
        minWidth: 38,
      }}
    >
      {children}
    </motion.button>
  );
}
