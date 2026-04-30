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
  const { eigenvalues, eigenvectors, det } = useMemo(() => analyze(matrix), [matrix]);

  const px = (x: number) => (x / range) * (size / 2) + size / 2;
  const py = (y: number) => -(y / range) * (size / 2) + size / 2;

  // Original unit square corners: (0,0), (1,0), (1,1), (0,1)
  const orig = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const transformed = orig.map(([x, y]) => apply(matrix, [x, y]));

  // Original i, j basis vectors
  const i = [1, 0], j = [0, 1];
  const Mi = apply(matrix, i);
  const Mj = apply(matrix, j);

  // Transformed grid lines
  const gridLines = transformedGrid(matrix, range, 1);

  return (
    <div className="inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ background: "#0a0a0a", border: "1px solid var(--color-border)" }}
      >
        {/* Background reference grid (faded) */}
        {Array.from({ length: range * 2 + 1 }).map((_, k) => {
          const v = k - range;
          return (
            <g key={`ref-${k}`}>
              <line
                x1={px(-range)} y1={py(v)} x2={px(range)} y2={py(v)}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1}
              />
              <line
                x1={px(v)} y1={py(-range)} x2={px(v)} y2={py(range)}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Axes */}
        <line x1={px(-range)} y1={py(0)} x2={px(range)} y2={py(0)} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        <line x1={px(0)} y1={py(-range)} x2={px(0)} y2={py(range)} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

        {/* Transformed grid (red, faded) */}
        {gridLines.map((ln, k) => (
          <line
            key={`tg-${k}`}
            x1={px(ln[0][0])} y1={py(ln[0][1])} x2={px(ln[1][0])} y2={py(ln[1][1])}
            stroke="rgba(239,68,68,0.18)" strokeWidth={1}
          />
        ))}

        {/* Determinant area: transformed unit square */}
        {showDetArea && (
          <polygon
            points={transformed.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")}
            fill="rgba(239,68,68,0.18)"
            stroke="rgba(239,68,68,0.6)"
            strokeWidth={1.5}
          />
        )}

        {/* Original unit square (outline) */}
        <polygon
          points={orig.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Eigenvector overlays */}
        {showEigen && eigenvectors && eigenvectors.length > 0 &&
          eigenvectors.map((v, k) => {
            const norm = Math.hypot(v[0], v[1]);
            if (norm < 1e-6) return null;
            const ux = (v[0] / norm) * range, uy = (v[1] / norm) * range;
            return (
              <g key={`ev-${k}`}>
                <line
                  x1={px(-ux)} y1={py(-uy)} x2={px(ux)} y2={py(uy)}
                  stroke="#ef4444" strokeWidth={2}
                  style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.8))" }}
                />
                <text
                  x={px(ux * 0.8)} y={py(uy * 0.8)} fill="#fca5a5"
                  fontSize="11" fontFamily="monospace"
                  textAnchor="middle"
                >
                  λ={fmt(eigenvalues[k])}
                </text>
              </g>
            );
          })
        }

        {/* Transformed basis vectors */}
        <Arrow from={[0, 0]} to={Mi} color="#22c55e" px={px} py={py} label="Mi" />
        <Arrow from={[0, 0]} to={Mj} color="#facc15" px={px} py={py} label="Mj" />
      </svg>

      <div className="mt-3 flex gap-6 font-mono text-xs uppercase tracking-widest">
        <span>
          <span className="text-[var(--color-fg-dim)]">det </span>
          <span className={det < 0 ? "text-[var(--color-accent)] text-glow" : "text-[var(--color-fg)]"}>
            {fmt(det)}
          </span>
        </span>
        <span>
          <span className="text-[var(--color-fg-dim)]">eigvals </span>
          {eigenvalues.length === 0
            ? <span className="text-[var(--color-fg-dim)]">complex (rotation)</span>
            : <span>{eigenvalues.map(fmt).join(", ")}</span>}
        </span>
      </div>
    </div>
  );
}

function Arrow({
  from, to, color, px, py, label,
}: {
  from: number[]; to: number[]; color: string; px: (x: number) => number; py: (y: number) => number; label: string;
}) {
  const x1 = px(from[0]), y1 = py(from[1]);
  const x2 = px(to[0]), y2 = py(to[1]);
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ahx = (dx / len) * 8, ahy = (dy / len) * 8;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <polygon
        points={`${x2},${y2} ${x2 - ahx + ahy * 0.5},${y2 - ahy - ahx * 0.5} ${x2 - ahx - ahy * 0.5},${y2 - ahy + ahx * 0.5}`}
        fill={color}
      />
      <text x={x2 + 4} y={y2 - 4} fill={color} fontSize="11" fontFamily="monospace">{label}</text>
    </g>
  );
}

function apply(M: Mat2, v: number[]): number[] {
  return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
}

function analyze(M: Mat2): { eigenvalues: number[]; eigenvectors: number[][] | null; det: number } {
  const a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1];
  const det = a * d - b * c;
  const tr = a + d;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-9) return { eigenvalues: [], eigenvectors: null, det };
  const sq = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + sq) / 2, l2 = (tr - sq) / 2;
  const evec = (l: number): number[] => {
    // (A - lI) v = 0
    // [[a-l, b], [c, d-l]]
    if (Math.abs(b) > 1e-9) return [b, l - a];
    if (Math.abs(c) > 1e-9) return [l - d, c];
    // Diagonal case
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
    // Vertical-line image: x = v, y in [-range, range]
    const a = apply(M, [v, -range]);
    const b = apply(M, [v, range]);
    lines.push([a, b]);
    // Horizontal-line image: y = v, x in [-range, range]
    const c = apply(M, [-range, v]);
    const d = apply(M, [range, v]);
    lines.push([c, d]);
  }
  return lines;
}
