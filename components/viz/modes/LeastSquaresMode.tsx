"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tex } from "@/components/Tex";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { CanvasFrame } from "@/components/viz/canvas/CanvasFrame";
import { type Vec2, fmtNum } from "@/lib/viz/linalg2";

type Props = {
  points: Vec2[];
  onChange: (pts: Vec2[]) => void;
  reducedMotion: boolean;
};

function fit(pts: Vec2[]): { b0: number; b1: number; rss: number } | null {
  if (pts.length < 2) return null;
  const n = pts.length;
  const sx = pts.reduce((s, [x]) => s + x, 0);
  const sy = pts.reduce((s, [, y]) => s + y, 0);
  const sxx = pts.reduce((s, [x]) => s + x * x, 0);
  const sxy = pts.reduce((s, [x, y]) => s + x * y, 0);
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const b1 = (n * sxy - sx * sy) / denom;
  const b0 = (sy - b1 * sx) / n;
  const rss = pts.reduce((s, [x, y]) => {
    const r = y - (b0 + b1 * x);
    return s + r * r;
  }, 0);
  return { b0, b1, rss };
}

export function LeastSquaresMode({ points, onChange, reducedMotion }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const f = useMemo(() => fit(points), [points]);

  const handleCanvasDown = (mx: number, my: number, e: React.PointerEvent) => {
    // Find nearest point within hit radius
    const hitRadiusMath = 0.4;
    let nearest = -1;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.hypot(p[0] - mx, p[1] - my);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    if (nearest >= 0 && nearestDist < hitRadiusMath) {
      if (e.shiftKey) {
        onChange(points.filter((_, i) => i !== nearest));
      } else {
        setDragIdx(nearest);
      }
    } else {
      onChange([...points, [mx, my]]);
    }
  };

  const handleCanvasMove = (mx: number, my: number) => {
    if (dragIdx === null) return;
    const next = points.slice();
    next[dragIdx] = [mx, my];
    onChange(next);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, auto) minmax(280px, 1fr)",
        gap: 28,
        alignItems: "start",
      }}
    >
      <CanvasFrame
        size={480}
        range={5}
        ariaLabel="Least squares regression"
        onPointerDown={handleCanvasDown}
        onPointerMove={handleCanvasMove}
        renderSvg={(ctx) => {
          const { px, py, range } = ctx;
          const lineX1 = -range,
            lineX2 = range;
          return (
            <g
              onPointerUp={() => setDragIdx(null)}
              onPointerCancel={() => setDragIdx(null)}
            >
              {f && (
                <>
                  {/* residual drop-lines */}
                  {points.map(([x, y], i) => {
                    const yhat = f.b0 + f.b1 * x;
                    return (
                      <motion.line
                        key={`r-${i}`}
                        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.7 }}
                        transition={{ duration: 0.5, delay: 0.05 * i }}
                        x1={px(x)}
                        y1={py(y)}
                        x2={px(x)}
                        y2={py(yhat)}
                        stroke="var(--peach)"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                      />
                    );
                  })}
                  <motion.line
                    initial={reducedMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                    x1={px(lineX1)}
                    y1={py(f.b0 + f.b1 * lineX1)}
                    x2={px(lineX2)}
                    y2={py(f.b0 + f.b1 * lineX2)}
                    stroke="var(--mint)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px var(--mint))" }}
                  />
                </>
              )}
              {points.map(([x, y], i) => (
                <circle
                  key={`p-${i}`}
                  cx={px(x)}
                  cy={py(y)}
                  r={7}
                  fill="var(--pink)"
                  stroke="var(--ink)"
                  strokeWidth={2.5}
                  style={{ cursor: "grab" }}
                />
              ))}
            </g>
          );
        }}
        renderOverlay={(ctx) => (
          <>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                background: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: 10,
                padding: "4px 10px",
                fontSize: 13,
                boxShadow: "0 3px 0 0 var(--ink)",
              }}
            >
              {f ? (
                <Tex>{`$y = ${fmtNum(f.b0)} + ${fmtNum(f.b1)}x$`}</Tex>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                  }}
                >
                  Click to add points
                </span>
              )}
            </span>
            {f && (
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  background: "var(--peach)",
                  border: "3px solid var(--ink)",
                  borderRadius: 12,
                  padding: "6px 12px",
                  fontSize: 13,
                  boxShadow: "0 3px 0 0 var(--ink)",
                  color: "var(--ink)",
                }}
              >
                <Tex>{`$\\mathrm{RSS} = ${fmtNum(f.rss, 3)}$`}</Tex>
              </span>
            )}
            {void ctx}
          </>
        )}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 5px 0 0 var(--ink)",
            padding: "16px 18px",
          }}
        >
          <h3
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--ink)",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Least squares
          </h3>
          <p
            data-on-paper
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--ink)",
              lineHeight: 1.5,
            }}
          >
            <Tex>
              {
                "Click to add a point, drag to move, $\\textsf{Shift}$+click to remove. The mint line minimizes $\\mathrm{RSS} = \\sum (y_i - \\hat y_i)^2$. The peach drop-lines are residuals."
              }
            </Tex>
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ChunkyButton size="sm" color="var(--cream-deep)" onClick={() => onChange([])}>
              Clear
            </ChunkyButton>
            <ChunkyButton
              size="sm"
              color="var(--cream-deep)"
              onClick={() =>
                onChange([
                  [-3, -2],
                  [-1, -0.5],
                  [0, 0.5],
                  [1, 1.2],
                  [3, 3.1],
                ])
              }
            >
              Sample (linear)
            </ChunkyButton>
            <ChunkyButton
              size="sm"
              color="var(--cream-deep)"
              onClick={() =>
                onChange([
                  [-3, 2],
                  [-1, -1],
                  [0, 0],
                  [2, 2.5],
                  [3, -1],
                ])
              }
            >
              Sample (noisy)
            </ChunkyButton>
          </div>
        </section>
      </div>
    </div>
  );
}
