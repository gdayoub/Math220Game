"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  totalSec: number;
  active: boolean;
  resetKey: string | number;
  onExpire: () => void;
};

export function Timer({ totalSec, active, resetKey, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalSec);
  const startRef = useRef<number>(Date.now());
  const expiredRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    expiredRef.current = false;
    setRemaining(totalSec);
  }, [resetKey, totalSec]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const rem = Math.max(0, totalSec - elapsed);
      setRemaining(rem);
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }, 100);
    return () => clearInterval(id);
  }, [active, totalSec, onExpire]);

  const pct = Math.max(0, Math.min(100, (remaining / totalSec) * 100));
  const fill =
    pct > 50
      ? "var(--mint)"
      : pct > 20
        ? "var(--lemon)"
        : "var(--pink)";

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 11,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Time
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 14,
            color: pct <= 20 ? "var(--pink-deep)" : "var(--ink)",
          }}
        >
          {remaining.toFixed(1)}s
        </span>
      </div>
      <div
        style={{
          height: 22,
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: 999,
          boxShadow: "0 4px 0 0 var(--ink)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={{ height: "100%", background: fill }}
        />
      </div>
    </div>
  );
}
