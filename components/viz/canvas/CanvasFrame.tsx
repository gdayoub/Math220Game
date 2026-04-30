"use client";
import { ReactNode, useRef } from "react";

export type CanvasCtx = {
  size: number;
  range: number;
  px: (x: number) => number;
  py: (y: number) => number;
  /** Convert from client coordinates (page pixels) to math coordinates. */
  clientToMath: (clientX: number, clientY: number) => [number, number];
  svgRef: React.RefObject<SVGSVGElement | null>;
};

type Props = {
  size?: number;
  range?: number;
  renderSvg: (ctx: CanvasCtx) => ReactNode;
  renderOverlay?: (ctx: CanvasCtx) => ReactNode;
  onPointerDown?: (mathX: number, mathY: number, e: React.PointerEvent) => void;
  onPointerMove?: (mathX: number, mathY: number, e: React.PointerEvent) => void;
  ariaLabel?: string;
};

export function CanvasFrame({
  size = 480,
  range = 5,
  renderSvg,
  renderOverlay,
  onPointerDown,
  onPointerMove,
  ariaLabel,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const px = (x: number) => (x / range) * (size / 2) + size / 2;
  const py = (y: number) => -(y / range) * (size / 2) + size / 2;

  const clientToMath = (cx: number, cy: number): [number, number] => {
    const el = svgRef.current;
    if (!el) return [0, 0];
    const r = el.getBoundingClientRect();
    const sx = ((cx - r.left) / r.width) * size;
    const sy = ((cy - r.top) / r.height) * size;
    const mx = ((sx - size / 2) / (size / 2)) * range;
    const my = -((sy - size / 2) / (size / 2)) * range;
    return [mx, my];
  };

  const ctx: CanvasCtx = { size, range, px, py, clientToMath, svgRef };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        touchAction: "none",
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          if (!onPointerDown) return;
          const [mx, my] = clientToMath(e.clientX, e.clientY);
          onPointerDown(mx, my, e);
        }}
        onPointerMove={(e) => {
          if (!onPointerMove) return;
          const [mx, my] = clientToMath(e.clientX, e.clientY);
          onPointerMove(mx, my, e);
        }}
        style={{
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: 20,
          boxShadow: "0 6px 0 0 var(--ink)",
          display: "block",
          userSelect: "none",
        }}
      >
        <Grid ctx={ctx} />
        <Axes ctx={ctx} />
        {renderSvg(ctx)}
      </svg>
      {renderOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            borderRadius: 20,
          }}
        >
          {renderOverlay(ctx)}
        </div>
      )}
    </div>
  );
}

function Grid({ ctx }: { ctx: CanvasCtx }) {
  const { range, px, py } = ctx;
  const lines = [];
  for (let k = -range; k <= range; k++) {
    if (k === 0) continue;
    lines.push(
      <line
        key={`h-${k}`}
        x1={px(-range)}
        y1={py(k)}
        x2={px(range)}
        y2={py(k)}
        stroke="var(--ink-faint)"
        strokeWidth={1}
        opacity={0.3}
      />,
      <line
        key={`v-${k}`}
        x1={px(k)}
        y1={py(-range)}
        x2={px(k)}
        y2={py(range)}
        stroke="var(--ink-faint)"
        strokeWidth={1}
        opacity={0.3}
      />,
    );
  }
  return <>{lines}</>;
}

function Axes({ ctx }: { ctx: CanvasCtx }) {
  const { range, px, py } = ctx;
  return (
    <>
      <line
        x1={px(-range)}
        y1={py(0)}
        x2={px(range)}
        y2={py(0)}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      <line
        x1={px(0)}
        y1={py(-range)}
        x2={px(0)}
        y2={py(range)}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
    </>
  );
}
