"use client";
import { useMemo } from "react";

type Mat2 = [[number, number], [number, number]];

type Props = {
  matrix: Mat2;
  size?: number;
  range?: number;
  showEigen?: boolean;
  showDetArea?: boolean;
};

export function TransformCanvas({
  matrix,
  size = 480,
  range = 5,
  showEigen = true,
  showDetArea = true,
}: Props) {
  const { eigenvalues, eigenvectors, det } = useMemo(
    () => analyze(matrix),
    [matrix],
  );

  const px = (x: number) => (x / range) * (size / 2) + size / 2;
  const py = (y: number) => -(y / range) * (size / 2) + size / 2;

  const orig = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const transformed = orig.map(([x, y]) => apply(matrix, [x, y]));

  const i = [1, 0],
    j = [0, 1];
  const Mi = apply(matrix, i);
  const Mj = apply(matrix, j);

  const gridLines = transformedGrid(matrix, range, 1);

  return (
    <div style={{ display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: 20,
          boxShadow: "0 6px 0 0 var(--ink)",
          display: "block",
        }}
      >
        {/* Reference grid */}
        {Array.from({ length: range * 2 + 1 }).map((_, k) => {
          const v = k - range;
          return (
            <g key={`ref-${k}`}>
              <line
                x1={px(-range)}
                y1={py(v)}
                x2={px(range)}
                y2={py(v)}
                stroke="var(--ink-faint)"
                strokeWidth={1}
                opacity={0.3}
              />
              <line
                x1={px(v)}
                y1={py(-range)}
                x2={px(v)}
                y2={py(range)}
                stroke="var(--ink-faint)"
                strokeWidth={1}
                opacity={0.3}
              />
            </g>
          );
        })}

        {/* Axes */}
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

        {/* Transformed grid */}
        {gridLines.map((ln, k) => (
          <line
            key={`tg-${k}`}
            x1={px(ln[0][0])}
            y1={py(ln[0][1])}
            x2={px(ln[1][0])}
            y2={py(ln[1][1])}
            stroke="#FF6BAD"
            strokeWidth={1}
            opacity={0.35}
          />
        ))}

        {/* Determinant area */}
        {showDetArea && (
          <polygon
            points={transformed
              .map(([x, y]) => `${px(x)},${py(y)}`)
              .join(" ")}
            fill="#FFD93D"
            fillOpacity={0.35}
            stroke="var(--ink)"
            strokeWidth={2}
          />
        )}

        {/* Original unit square outline */}
        <polygon
          points={orig.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />

        {/* Eigenvector overlays */}
        {showEigen &&
          eigenvectors &&
          eigenvectors.length > 0 &&
          eigenvectors.map((v, k) => {
            const norm = Math.hypot(v[0], v[1]);
            if (norm < 1e-6) return null;
            const ux = (v[0] / norm) * range,
              uy = (v[1] / norm) * range;
            return (
              <g key={`ev-${k}`}>
                <line
                  x1={px(-ux)}
                  y1={py(-uy)}
                  x2={px(ux)}
                  y2={py(uy)}
                  stroke="#9B6BFF"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <text
                  x={px(ux * 0.85)}
                  y={py(uy * 0.85)}
                  fill="var(--ink)"
                  fontSize={14}
                  fontFamily="var(--font-display)"
                  fontWeight={800}
                  textAnchor="middle"
                >
                  λ={fmt(eigenvalues[k])}
                </text>
              </g>
            );
          })}

        {/* Transformed basis vectors */}
        <Arrow from={[0, 0]} to={Mi} color="#FF6BAD" px={px} py={py} label="Mi" />
        <Arrow from={[0, 0]} to={Mj} color="#5EE2B8" px={px} py={py} label="Mj" />
      </svg>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 24,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 14,
          flexWrap: "wrap",
        }}
      >
        <span>
          <span style={{ color: "var(--ink-soft)", marginRight: 6 }}>det</span>
          <span style={{ color: det < 0 ? "var(--pink-deep)" : "var(--ink)" }}>
            {fmt(det)}
          </span>
        </span>
        <span>
          <span style={{ color: "var(--ink-soft)", marginRight: 6 }}>eigvals</span>
          {eigenvalues.length === 0 ? (
            <span style={{ color: "var(--ink-faint)" }}>complex (rotation)</span>
          ) : (
            <span style={{ color: "var(--ink)" }}>
              {eigenvalues.map(fmt).join(", ")}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

function Arrow({
  from,
  to,
  color,
  px,
  py,
  label,
}: {
  from: number[];
  to: number[];
  color: string;
  px: (x: number) => number;
  py: (y: number) => number;
  label: string;
}) {
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
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${x2 - ahx + ahy * 0.6},${y2 - ahy - ahx * 0.6} ${x2 - ahx - ahy * 0.6},${y2 - ahy + ahx * 0.6}`}
        fill={color}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      <text
        x={x2 + 6}
        y={y2 - 6}
        fill="var(--ink)"
        fontSize={13}
        fontFamily="var(--font-display)"
        fontWeight={800}
      >
        {label}
      </text>
    </g>
  );
}

function apply(M: Mat2, v: number[]): number[] {
  return [
    M[0][0] * v[0] + M[0][1] * v[1],
    M[1][0] * v[0] + M[1][1] * v[1],
  ];
}

function analyze(M: Mat2): {
  eigenvalues: number[];
  eigenvectors: number[][] | null;
  det: number;
} {
  const a = M[0][0],
    b = M[0][1],
    c = M[1][0],
    d = M[1][1];
  const det = a * d - b * c;
  const tr = a + d;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-9) return { eigenvalues: [], eigenvectors: null, det };
  const sq = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + sq) / 2,
    l2 = (tr - sq) / 2;
  const evec = (l: number): number[] => {
    if (Math.abs(b) > 1e-9) return [b, l - a];
    if (Math.abs(c) > 1e-9) return [l - d, c];
    if (Math.abs(a - l) < 1e-9) return [1, 0];
    return [0, 1];
  };
  return {
    eigenvalues: [l1, l2],
    eigenvectors: [evec(l1), evec(l2)],
    det,
  };
}

function fmt(x: number): string {
  if (Math.abs(x) < 1e-6) return "0";
  if (Math.abs(x - Math.round(x)) < 1e-3) return String(Math.round(x));
  return x.toFixed(2);
}

function transformedGrid(M: Mat2, range: number, step: number): number[][][] {
  const lines: number[][][] = [];
  for (let v = -range; v <= range; v += step) {
    if (v === 0) continue;
    lines.push([apply(M, [v, -range]), apply(M, [v, range])]);
    lines.push([apply(M, [-range, v]), apply(M, [range, v])]);
  }
  return lines;
}
