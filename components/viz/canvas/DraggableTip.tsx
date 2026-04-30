"use client";
import { useState, useCallback, useRef } from "react";
import type { CanvasCtx } from "./CanvasFrame";

type Props = {
  ctx: CanvasCtx;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  color?: string;
  radius?: number;
  /** Snap to multiples of this value when shift is held during drag. */
  snap?: number;
  range?: { min: number; max: number };
  ariaLabel?: string;
  disabled?: boolean;
};

/** A circular hit-target on the canvas that drags in math coords. */
export function DraggableTip({
  ctx,
  x,
  y,
  onChange,
  color = "var(--accent-1)",
  radius = 14,
  snap = 0.5,
  range,
  ariaLabel,
  disabled = false,
}: Props) {
  const [active, setActive] = useState(false);
  const dragging = useRef(false);

  const clamp = useCallback(
    (v: number) => {
      if (!range) return v;
      return Math.max(range.min, Math.min(range.max, v));
    },
    [range],
  );

  const handleDown = (e: React.PointerEvent<SVGCircleElement>) => {
    if (disabled) return;
    dragging.current = true;
    setActive(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handleMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!dragging.current) return;
    let [mx, my] = ctx.clientToMath(e.clientX, e.clientY);
    if (e.shiftKey) {
      mx = Math.round(mx / snap) * snap;
      my = Math.round(my / snap) * snap;
    }
    onChange(clamp(mx), clamp(my));
  };

  const handleUp = (e: React.PointerEvent<SVGCircleElement>) => {
    dragging.current = false;
    setActive(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handleKey = (e: React.KeyboardEvent<SVGCircleElement>) => {
    if (disabled) return;
    const step = e.shiftKey ? 1 : 0.1;
    if (e.key === "ArrowLeft") onChange(clamp(x - step), y);
    else if (e.key === "ArrowRight") onChange(clamp(x + step), y);
    else if (e.key === "ArrowDown") onChange(x, clamp(y - step));
    else if (e.key === "ArrowUp") onChange(x, clamp(y + step));
    else return;
    e.preventDefault();
  };

  const cx = ctx.px(x);
  const cy = ctx.py(y);

  return (
    <g>
      {/* Inner visible dot */}
      <circle
        cx={cx}
        cy={cy}
        r={radius / 2}
        fill={color}
        stroke="var(--ink)"
        strokeWidth={2.5}
        pointerEvents="none"
      />
      {/* Outer hit area */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="transparent"
        stroke={active ? color : "transparent"}
        strokeWidth={3}
        opacity={active ? 0.4 : 1}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKey}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(x * 100) / 100}
        aria-valuemin={range?.min}
        aria-valuemax={range?.max}
        style={{
          cursor: disabled ? "default" : dragging.current ? "grabbing" : "grab",
          outline: "none",
        }}
      />
    </g>
  );
}
