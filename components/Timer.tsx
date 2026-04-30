"use client";
import { useEffect, useRef, useState } from "react";

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

  const pct = (remaining / totalSec) * 100;
  const danger = remaining <= 5;
  return (
    <div className="w-full">
      <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-1">
        <span className="text-[var(--color-fg-dim)]">Time</span>
        <span className={danger ? "text-[var(--color-accent)] text-glow" : ""}>
          {remaining.toFixed(1)}s
        </span>
      </div>
      <div className="h-1 w-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${
            danger ? "bg-[var(--color-accent)]" : "bg-[var(--color-accent-strong)]"
          } ${danger ? "pulse-border" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
