"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tex } from "@/components/Tex";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { rrefWithSteps } from "@/lib/viz/rrefSteps";
import { fmtNum } from "@/lib/viz/linalg2";

type Props = {
  augmented: number[][];
  onChange: (m: number[][]) => void;
  reducedMotion: boolean;
};

type SubMode = "system" | "inverse";

const MAX_ROWS = 4;
const MIN_ROWS = 2;
const MAX_COLS = 6;
const MIN_COLS = 2;

function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

/** Resize matrix to (rows × cols), preserving overlap, zero-filling new cells. */
function resize(matrix: number[][], rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => matrix[i]?.[j] ?? 0),
  );
}

/** Build [A | I_n] from a square A. */
function buildInverseAug(A: number[][]): number[][] {
  const n = A.length;
  const I = identity(n);
  return A.map((row, i) => [...row, ...I[i]]);
}

/** LaTeX for an augmented matrix with the divider at `barCol` (number of cols on the LEFT). */
function fmtAugAt(m: number[][], barCol: number): string {
  if (m.length === 0) return "";
  const n = m[0].length;
  const colSpec =
    "c".repeat(barCol) + "|" + "c".repeat(Math.max(0, n - barCol));
  return (
    "\\left[\\begin{array}{" +
    colSpec +
    "}" +
    m
      .map((row) => row.map((x) => fmtNum(x)).join(" & "))
      .join(" \\\\ ") +
    "\\end{array}\\right]"
  );
}

/** LaTeX for a plain matrix (bmatrix) with no divider. */
function fmtBmat(m: number[][]): string {
  if (m.length === 0) return "";
  return (
    "\\begin{bmatrix}" +
    m.map((row) => row.map((x) => fmtNum(x)).join(" & ")).join(" \\\\ ") +
    "\\end{bmatrix}"
  );
}

function multiply(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const n = B[0]?.length ?? 0;
  const k = B.length;
  const out: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) s += A[i][p] * B[p][j];
      if (Math.abs(s) < 1e-9) s = 0;
      else if (Math.abs(s - Math.round(s)) < 1e-7) s = Math.round(s);
      else s = Number(s.toFixed(4));
      row.push(s);
    }
    out.push(row);
  }
  return out;
}

function isIdentity(m: number[][], n: number): boolean {
  if (m.length !== n) return false;
  for (let i = 0; i < n; i++) {
    if (m[i].length < n) return false;
    for (let j = 0; j < n; j++) {
      const want = i === j ? 1 : 0;
      if (Math.abs(m[i][j] - want) > 1e-6) return false;
    }
  }
  return true;
}

export function RrefMode({ augmented, onChange, reducedMotion }: Props) {
  const [subMode, setSubMode] = useState<SubMode>(() =>
    detectSubMode(augmented),
  );
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);

  const rows = augmented.length;
  const totalCols = augmented[0]?.length ?? 0;
  const barCol = subMode === "inverse" ? rows : totalCols - 1;

  const { steps, final } = useMemo(() => rrefWithSteps(augmented), [augmented]);

  const totalStops = steps.length + 1;
  const safeIdx = Math.min(stepIdx, totalStops - 1);
  const currentMatrix = safeIdx === 0 ? augmented : steps[safeIdx - 1].after;
  const currentStep = safeIdx === 0 ? null : steps[safeIdx - 1];

  useEffect(() => {
    if (!auto) return;
    if (reducedMotion) {
      setStepIdx(totalStops - 1);
      setAuto(false);
      return;
    }
    if (safeIdx >= totalStops - 1) {
      setAuto(false);
      return;
    }
    const id = setTimeout(() => setStepIdx((i) => i + 1), 900);
    return () => clearTimeout(id);
  }, [auto, safeIdx, totalStops, reducedMotion]);

  const setEntry = (i: number, j: number, v: number) => {
    if (subMode === "inverse" && j >= rows) return; // right half locked
    const next = augmented.map((r) => r.slice());
    next[i][j] = v;
    onChange(next);
    setStepIdx(0);
    setAuto(false);
  };

  const reset = () => {
    setStepIdx(0);
    setAuto(false);
  };

  const switchSystem = () => {
    setSubMode("system");
    setStepIdx(0);
    setAuto(false);
  };

  const switchInverse = () => {
    // Take a square left half from current matrix (or pad).
    const n = Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows));
    const A = resize(augmented, n, n);
    onChange(buildInverseAug(A));
    setSubMode("inverse");
    setStepIdx(0);
    setAuto(false);
  };

  const setRows = (n: number) => {
    n = Math.max(MIN_ROWS, Math.min(MAX_ROWS, n));
    if (n === rows) return;
    if (subMode === "inverse") {
      const A = resize(augmented, n, n);
      onChange(buildInverseAug(A));
    } else {
      onChange(resize(augmented, n, totalCols));
    }
    setStepIdx(0);
    setAuto(false);
  };

  const setCols = (c: number) => {
    if (subMode === "inverse") return;
    c = Math.max(MIN_COLS, Math.min(MAX_COLS, c));
    if (c === totalCols) return;
    onChange(resize(augmented, rows, c));
    setStepIdx(0);
    setAuto(false);
  };

  // Inverse-mode result.
  const inverseResult = useMemo(() => {
    if (subMode !== "inverse") return null;
    const n = rows;
    const left = final.map((r) => r.slice(0, n));
    const right = final.map((r) => r.slice(n, 2 * n));
    if (isIdentity(left, n)) return { ok: true as const, inverse: right };
    return { ok: false as const };
  }, [subMode, rows, final]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)",
        gap: 28,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "22px 26px",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            key={safeIdx}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            data-on-paper
            style={{
              color: "var(--ink)",
              fontSize: 20,
              textAlign: "center",
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Tex>{`$$${fmtAugAt(currentMatrix, barCol)}$$`}</Tex>
          </motion.div>

          {currentStep && (
            <motion.div
              key={`s-${safeIdx}`}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-on-paper
              style={{
                background: "var(--lemon)",
                border: "3px solid var(--ink)",
                borderRadius: 14,
                boxShadow: "0 4px 0 0 var(--ink)",
                padding: "10px 16px",
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                fontSize: 16,
              }}
            >
              <Tex>{`$${currentStep.latex}$`}</Tex>
            </motion.div>
          )}
          {!currentStep && (
            <p
              data-on-paper
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {subMode === "inverse"
                ? "Initial: A | I (we'll row-reduce until the left half becomes I)"
                : "Initial augmented matrix"}
            </p>
          )}
        </section>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <ChunkyButton
            size="sm"
            color="var(--paper)"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={safeIdx === 0}
          >
            ← Prev
          </ChunkyButton>
          <ChunkyButton
            size="sm"
            color="var(--lemon)"
            onClick={() => setStepIdx((i) => Math.min(totalStops - 1, i + 1))}
            disabled={safeIdx >= totalStops - 1}
          >
            Next →
          </ChunkyButton>
          <ChunkyButton
            size="sm"
            color="var(--mint)"
            onClick={() => setAuto((p) => !p)}
            disabled={reducedMotion || totalStops <= 1}
          >
            {auto ? "Pause" : "Auto-play"}
          </ChunkyButton>
          <ChunkyButton size="sm" color="var(--paper)" onClick={reset}>
            Reset
          </ChunkyButton>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Step {safeIdx} / {totalStops - 1}
          </span>
        </section>

        <ResultPanel
          subMode={subMode}
          rows={rows}
          barCol={barCol}
          final={final}
          inverseResult={inverseResult}
          originalA={
            subMode === "inverse"
              ? augmented.map((r) => r.slice(0, rows))
              : null
          }
        />
      </div>

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
          {/* SubMode toggle */}
          <div
            role="tablist"
            aria-label="RREF mode"
            style={{ display: "flex", gap: 8, marginBottom: 14 }}
          >
            <SubModeBtn
              active={subMode === "system"}
              onClick={switchSystem}
              color="var(--lemon)"
            >
              System
            </SubModeBtn>
            <SubModeBtn
              active={subMode === "inverse"}
              onClick={switchInverse}
              color="var(--grape)"
              textColor="var(--on-dark-text)"
            >
              Find inverse
            </SubModeBtn>
          </div>

          {/* Size controls */}
          <div
            data-on-paper
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 14,
              flexWrap: "wrap",
              fontFamily: "var(--font-display)",
              fontSize: 12,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 800,
            }}
          >
            <Stepper
              label={subMode === "inverse" ? "n" : "Rows"}
              value={rows}
              min={MIN_ROWS}
              max={MAX_ROWS}
              onChange={setRows}
            />
            {subMode === "system" && (
              <Stepper
                label="Cols"
                value={totalCols}
                min={MIN_COLS}
                max={MAX_COLS}
                onChange={setCols}
              />
            )}
          </div>

          <h3
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            {subMode === "inverse" ? "Enter A (right half locked to I)" : "Augmented matrix"}
          </h3>
          <AugmentedGrid
            matrix={augmented}
            barCol={barCol}
            lockedFrom={subMode === "inverse" ? rows : undefined}
            onChange={setEntry}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {subMode === "system" ? (
              <>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange([
                      [1, 2, 3, 4],
                      [2, 4, 6, 8],
                      [1, 1, 1, 1],
                    ]);
                    setStepIdx(0);
                  }}
                >
                  Sample
                </ChunkyButton>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange([
                      [1, 1, 1, 6],
                      [0, 2, 1, 8],
                      [2, 1, 0, 5],
                    ]);
                    setStepIdx(0);
                  }}
                >
                  Random-ish
                </ChunkyButton>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange([
                      [1, 2, 0],
                      [2, 4, 0],
                    ]);
                    setStepIdx(0);
                  }}
                >
                  Inconsistent?
                </ChunkyButton>
              </>
            ) : (
              <>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange(buildInverseAug([
                      [2, 1],
                      [1, 1],
                    ]));
                    setStepIdx(0);
                  }}
                >
                  Sample (2×2)
                </ChunkyButton>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange(buildInverseAug([
                      [1, 2, 3],
                      [0, 1, 4],
                      [5, 6, 0],
                    ]));
                    setStepIdx(0);
                  }}
                >
                  Sample (3×3)
                </ChunkyButton>
                <ChunkyButton
                  size="sm"
                  color="var(--cream-deep)"
                  onClick={() => {
                    onChange(buildInverseAug([
                      [1, 2],
                      [2, 4],
                    ]));
                    setStepIdx(0);
                  }}
                >
                  Singular
                </ChunkyButton>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function detectSubMode(m: number[][]): SubMode {
  const n = m.length;
  if (n === 0) return "system";
  const cols = m[0].length;
  if (cols !== 2 * n) return "system";
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const want = i === j ? 1 : 0;
      if (Math.abs(m[i][n + j] - want) > 1e-6) return "system";
    }
  }
  return "inverse";
}

function ResultPanel({
  subMode,
  rows,
  barCol,
  final,
  inverseResult,
  originalA,
}: {
  subMode: SubMode;
  rows: number;
  barCol: number;
  final: number[][];
  inverseResult: { ok: true; inverse: number[][] } | { ok: false } | null;
  originalA: number[][] | null;
}) {
  if (subMode === "inverse" && inverseResult) {
    return (
      <section
        data-light-card
        style={{
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: 20,
          boxShadow: "0 5px 0 0 var(--ink)",
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
        }}
      >
        {inverseResult.ok ? (
          <>
            <p
              data-on-paper
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "var(--ink)",
                lineHeight: 1.5,
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              <Tex>{`$A^{-1} = ${fmtBmat(inverseResult.inverse)}$`}</Tex>
            </p>
            {originalA && (() => {
              const product = multiply(originalA, inverseResult.inverse);
              const verified = isIdentity(product, rows);
              return (
                <div
                  data-on-paper
                  style={{
                    background: verified ? "var(--mint)" : "var(--lemon)",
                    border: "3px solid var(--ink)",
                    borderRadius: 14,
                    boxShadow: "0 3px 0 0 var(--ink)",
                    padding: "10px 14px",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--ink)",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginRight: 6,
                    }}
                  >
                    {verified ? "✓ Verified" : "Check"}
                  </span>
                  <Tex>{`$A \\cdot A^{-1} = ${fmtBmat(product)}$`}</Tex>
                </div>
              );
            })()}
          </>
        ) : (
          <p
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--pink-deep)",
              lineHeight: 1.4,
            }}
          >
            ⚠ {`A is singular — left half didn't reduce to ${rows}×${rows} identity. No inverse exists.`}
          </p>
        )}
      </section>
    );
  }

  // System mode: detect inconsistency (row of zeros with nonzero RHS).
  const inconsistent = final.some((row) => {
    const rhs = row[barCol];
    const lhsZero = row.slice(0, barCol).every((x) => Math.abs(x) < 1e-9);
    return lhsZero && Math.abs(rhs) > 1e-9;
  });
  return (
    <section
      data-light-card
      style={{
        background: "var(--paper)",
        border: "4px solid var(--ink)",
        borderRadius: 20,
        boxShadow: "0 5px 0 0 var(--ink)",
        padding: "14px 18px",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <p data-on-paper style={{ color: "var(--ink)", marginBottom: 6 }}>
        <Tex>{`Final RREF: $${fmtAugAt(final, barCol)}$`}</Tex>
      </p>
      <p
        data-on-paper
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 12,
          color: inconsistent ? "var(--pink-deep)" : "var(--mint-deep)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {inconsistent ? "⚠ Inconsistent — no solution" : "✓ Consistent"}
      </p>
    </section>
  );
}

function SubModeBtn({
  active,
  onClick,
  color,
  textColor = "var(--ink)",
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  textColor?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? color : "var(--cream-deep)",
        border: active ? "3px solid var(--ink)" : "3px solid var(--ink)",
        borderRadius: 999,
        boxShadow: "0 3px 0 0 var(--ink)",
        padding: "8px 12px",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 12,
        color: active ? textColor : "var(--ink)",
        cursor: "pointer",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ marginRight: 4 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        style={stepperBtn}
      >
        −
      </button>
      <span
        style={{
          minWidth: 22,
          textAlign: "center",
          color: "var(--ink)",
          fontSize: 14,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        style={stepperBtn}
      >
        +
      </button>
    </div>
  );
}

const stepperBtn: React.CSSProperties = {
  background: "var(--paper)",
  border: "2px solid var(--ink)",
  borderRadius: 8,
  boxShadow: "0 2px 0 0 var(--ink)",
  width: 24,
  height: 24,
  fontSize: 14,
  fontWeight: 800,
  color: "var(--ink)",
  cursor: "pointer",
  padding: 0,
  fontFamily: "var(--font-display)",
};

function AugmentedGrid({
  matrix,
  barCol,
  lockedFrom,
  onChange,
}: {
  matrix: number[][];
  barCol: number;
  lockedFrom?: number;
  onChange: (i: number, j: number, v: number) => void;
}) {
  const cols = matrix[0]?.length ?? 0;
  // Build template: barCol cells, bar (4px), remaining cells.
  const leftCount = barCol;
  const rightCount = cols - barCol;
  const template = `repeat(${leftCount}, minmax(36px, 1fr)) 4px repeat(${rightCount}, minmax(36px, 1fr))`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: template,
        gap: 6,
        alignItems: "center",
        overflowX: "auto",
      }}
    >
      {matrix.flatMap((row, i) => {
        const cells: React.ReactNode[] = [];
        for (let j = 0; j < cols; j++) {
          if (j === barCol) {
            cells.push(
              <div
                key={`bar-${i}`}
                style={{
                  width: 3,
                  height: 30,
                  background: "var(--ink)",
                  margin: "0 2px",
                }}
              />,
            );
          }
          const locked = lockedFrom !== undefined && j >= lockedFrom;
          cells.push(
            <input
              key={`${i}-${j}`}
              type="number"
              step={1}
              value={row[j]}
              readOnly={locked}
              onChange={(e) => onChange(i, j, parseFloat(e.target.value || "0"))}
              style={{
                ...cellStyle,
                background: locked ? "var(--cream)" : "var(--cream-deep)",
                color: locked ? "var(--ink-soft)" : "var(--ink)",
                cursor: locked ? "not-allowed" : "text",
              }}
              aria-readonly={locked}
            />,
          );
        }
        return cells;
      })}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  background: "var(--cream-deep)",
  border: "2px solid var(--ink)",
  borderRadius: 8,
  boxShadow: "0 2px 0 0 var(--ink)",
  padding: "6px 8px",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 14,
  color: "var(--ink)",
  textAlign: "center",
  minWidth: 0,
  width: "100%",
};
