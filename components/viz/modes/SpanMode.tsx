"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tex } from "@/components/Tex";
import { CanvasFrame } from "@/components/viz/canvas/CanvasFrame";
import { Arrow } from "@/components/viz/canvas/Arrow";
import { TexLabel } from "@/components/viz/canvas/TexLabel";
import { DraggableTip } from "@/components/viz/canvas/DraggableTip";
import { type Vec2, fmtNum } from "@/lib/viz/linalg2";

type Props = {
  u: Vec2;
  v: Vec2;
  onChange: (u: Vec2, v: Vec2) => void;
  reducedMotion: boolean;
};

export function SpanMode({ u, v, onChange, reducedMotion }: Props) {
  const det = u[0] * v[1] - u[1] * v[0];
  const dependent = Math.abs(det) < 1e-3;

  const tilingPolygon = useMemo(() => {
    if (dependent) return null;
    // Cover canvas with translucent parallelogram tiling.
    const range = 5;
    // Build a grid of parallelogram cells from -k..k along each axis.
    const k = 6;
    const polys: { points: string }[] = [];
    return { range, k, polys };
  }, [dependent]);
  void tilingPolygon;

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
        ariaLabel="Span visualizer"
        renderSvg={(ctx) => {
          const { px, py, range, size } = ctx;
          // Build a clipPath = canvas rect.
          const clipId = "span-clip";
          // For independent: render a big tiled fill and clip to the canvas.
          // We achieve that with a single huge polygon along u+v at large multiples.
          const big = 12;
          const corners: Vec2[] = [
            [u[0] * -big + v[0] * -big, u[1] * -big + v[1] * -big],
            [u[0] * big + v[0] * -big, u[1] * big + v[1] * -big],
            [u[0] * big + v[0] * big, u[1] * big + v[1] * big],
            [u[0] * -big + v[0] * big, u[1] * -big + v[1] * big],
          ];
          const fillPts = corners.map(([x, y]) => `${px(x)},${py(y)}`).join(" ");

          // Dependent: render thick line through origin along the non-zero vector.
          const ref = Math.hypot(u[0], u[1]) > 1e-6 ? u : v;
          const norm = Math.hypot(ref[0], ref[1]);
          const lineEnd: Vec2 =
            norm < 1e-6 ? [0, 0] : [(ref[0] / norm) * range, (ref[1] / norm) * range];

          return (
            <>
              <defs>
                <clipPath id={clipId}>
                  <rect x={0} y={0} width={size} height={size} />
                </clipPath>
                <pattern
                  id="span-hatch"
                  patternUnits="userSpaceOnUse"
                  width={12}
                  height={12}
                  patternTransform="rotate(45)"
                >
                  <line x1={0} y1={0} x2={0} y2={12} stroke="var(--mint)" strokeWidth={3} />
                </pattern>
              </defs>
              {!dependent ? (
                <motion.polygon
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ duration: 0.4 }}
                  points={fillPts}
                  fill="url(#span-hatch)"
                  clipPath={`url(#${clipId})`}
                />
              ) : (
                <motion.line
                  initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  x1={px(-lineEnd[0])}
                  y1={py(-lineEnd[1])}
                  x2={px(lineEnd[0])}
                  y2={py(lineEnd[1])}
                  stroke="var(--mint)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 5px var(--mint))" }}
                />
              )}
              <Arrow ctx={ctx} from={[0, 0]} to={u} color="var(--pink)" />
              <Arrow ctx={ctx} from={[0, 0]} to={v} color="var(--sky)" />
              <DraggableTip
                ctx={ctx}
                x={u[0]}
                y={u[1]}
                onChange={(x, y) => onChange([x, y], v)}
                color="var(--pink)"
                ariaLabel="Vector u"
                range={{ min: -range, max: range }}
              />
              <DraggableTip
                ctx={ctx}
                x={v[0]}
                y={v[1]}
                onChange={(x, y) => onChange(u, [x, y])}
                color="var(--sky)"
                ariaLabel="Vector v"
                range={{ min: -range, max: range }}
              />
            </>
          );
        }}
        renderOverlay={(ctx) => (
          <>
            <TexLabel ctx={ctx} x={u[0]} y={u[1]} dx={10} dy={-4} fontSize={13}>
              {"$\\vec{u}$"}
            </TexLabel>
            <TexLabel ctx={ctx} x={v[0]} y={v[1]} dx={10} dy={-4} fontSize={13}>
              {"$\\vec{v}$"}
            </TexLabel>
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
              <Tex>{`$\\det[\\vec{u}\\;\\vec{v}] = ${fmtNum(det)}$`}</Tex>
            </span>
            <span
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                background: dependent ? "var(--peach)" : "var(--mint)",
                border: "3px solid var(--ink)",
                borderRadius: 12,
                padding: "6px 12px",
                fontSize: 13,
                boxShadow: "0 3px 0 0 var(--ink)",
                color: "var(--ink)",
              }}
            >
              <Tex>{`$\\dim \\mathrm{span} = ${dependent ? 1 : 2}$`}</Tex>
            </span>
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
            Span &amp; basis
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
                "Drag the pink and blue dots. If $\\det[\\vec{u}\\;\\vec{v}] \\neq 0$, the two vectors span all of $\\mathbb{R}^2$ (mint shading). If they're parallel, the span collapses to a line."
              }
            </Tex>
          </p>
        </section>
      </div>
    </div>
  );
}
