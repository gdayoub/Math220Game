"use client";
import type { CanvasCtx } from "./CanvasFrame";

type Props = {
  ctx: CanvasCtx;
  from: [number, number];
  to: [number, number];
  color: string;
  width?: number;
  glow?: boolean;
};

/** Plain SVG arrow drawn in math coordinates via the canvas ctx. */
export function Arrow({ ctx, from, to, color, width = 4, glow = false }: Props) {
  const { px, py } = ctx;
  const x1 = px(from[0]),
    y1 = py(from[1]);
  const x2 = px(to[0]),
    y2 = py(to[1]);
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ahx = (dx / len) * 12,
    ahy = (dy / len) * 12;
  return (
    <g style={glow ? { filter: "drop-shadow(0 0 6px rgba(155, 107, 255, 0.55))" } : undefined}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${x2 - ahx + ahy * 0.6},${y2 - ahy - ahx * 0.6} ${x2 - ahx - ahy * 0.6},${y2 - ahy + ahx * 0.6}`}
        fill={color}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
    </g>
  );
}
