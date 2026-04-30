"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tex } from "@/components/Tex";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import {
  CanvasFrame,
  type CanvasCtx,
} from "@/components/viz/canvas/CanvasFrame";
import { Arrow } from "@/components/viz/canvas/Arrow";
import { TexLabel } from "@/components/viz/canvas/TexLabel";
import { DraggableTip } from "@/components/viz/canvas/DraggableTip";
import { PlayScrub } from "@/components/viz/PlayScrub";
import { PresetCarousel } from "@/components/viz/PresetCarousel";
import {
  IDENTITY,
  type Mat2,
  analyze,
  apply,
  fmtMat2,
  fmtNum,
  lerpMat,
  matEq,
  transformedGrid,
} from "@/lib/viz/linalg2";

type Props = {
  matrix: Mat2;
  onMatrixChange: (m: Mat2) => void;
  reducedMotion: boolean;
  /** Bumped externally to force play (e.g. from keyboard handler). */
  playSignal?: number;
};

export function TransformMode({
  matrix,
  onMatrixChange,
  reducedMotion,
  playSignal = 0,
}: Props) {
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [fromMatrix, setFromMatrix] = useState<Mat2>(IDENTITY);
  const [predicted, setPredicted] = useState(false);
  const [showFull, setShowFull] = useState(true);

  const prevMatrixRef = useRef<Mat2>(matrix);
  const skipAnimRef = useRef(false);

  // External matrix change (preset / URL) → animate from previous to new.
  useEffect(() => {
    if (matEq(matrix, prevMatrixRef.current)) return;
    if (skipAnimRef.current) {
      skipAnimRef.current = false;
      prevMatrixRef.current = matrix;
      setT(1);
      return;
    }
    if (reducedMotion) {
      prevMatrixRef.current = matrix;
      setT(1);
      return;
    }
    setFromMatrix(prevMatrixRef.current);
    prevMatrixRef.current = matrix;
    setT(0);
    setPlaying(true);
    setShowFull(false);
    setPredicted(false);
  }, [matrix, reducedMotion]);

  // External play signal (e.g. keyboard space).
  useEffect(() => {
    if (playSignal === 0) return;
    if (t >= 1) {
      setFromMatrix(IDENTITY);
      setT(0);
    }
    setPlaying((p) => !p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSignal]);

  const renderedMatrix = useMemo<Mat2>(
    () => lerpMat(fromMatrix, matrix, t),
    [fromMatrix, matrix, t],
  );

  const eigenInfo = useMemo(() => analyze(matrix), [matrix]);
  const renderedEigen = useMemo(() => analyze(renderedMatrix), [renderedMatrix]);

  const setEntryImmediate = (i: 0 | 1, j: 0 | 1, v: number) => {
    const next: Mat2 = [
      [matrix[0][0], matrix[0][1]],
      [matrix[1][0], matrix[1][1]],
    ];
    next[i][j] = v;
    skipAnimRef.current = true;
    onMatrixChange(next);
  };

  const setBasisTip = (which: "e1" | "e2", x: number, y: number) => {
    const next: Mat2 = [
      [matrix[0][0], matrix[0][1]],
      [matrix[1][0], matrix[1][1]],
    ];
    if (which === "e1") {
      next[0][0] = x;
      next[1][0] = y;
    } else {
      next[0][1] = x;
      next[1][1] = y;
    }
    skipAnimRef.current = true;
    onMatrixChange(next);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <CanvasFrame
          size={480}
          range={5}
          ariaLabel="Matrix transformation visualizer"
          renderSvg={(ctx) => (
            <TransformLayer
              ctx={ctx}
              renderedMatrix={renderedMatrix}
              targetMatrix={matrix}
              eigen={eigenInfo}
              t={t}
              showFull={showFull}
              onSetBasisTip={setBasisTip}
            />
          )}
          renderOverlay={(ctx) => (
            <TransformOverlay
              ctx={ctx}
              renderedMatrix={renderedMatrix}
              renderedEigen={renderedEigen}
              targetMatrix={matrix}
              showFull={showFull}
              t={t}
            />
          )}
        />
        <PlayScrub
          t={t}
          onChange={setT}
          playing={playing}
          onPlayingChange={setPlaying}
          reducedMotion={reducedMotion}
        />
        {!showFull && (
          <div
            data-light-card
            style={{
              background: "var(--paper)",
              border: "4px solid var(--ink)",
              borderRadius: 20,
              boxShadow: "0 5px 0 0 var(--ink)",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <p
              data-on-paper
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--ink)",
                lineHeight: 1.4,
              }}
            >
              <Tex>
                {
                  "Predict: how will the unit square transform under $A$? What's $\\det A$?"
                }
              </Tex>
            </p>
            <ChunkyButton
              size="sm"
              color="var(--lemon)"
              onClick={() => {
                setPredicted(true);
                setShowFull(true);
              }}
            >
              Reveal eigenvectors & det
            </ChunkyButton>
          </div>
        )}
        {predicted && showFull && (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--accent-1)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            ✦ Compare your guess to the eigenvector lines and det readout above.
          </p>
        )}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "flex-start",
            background: "var(--cream-deep)",
            border: "3px solid var(--ink)",
            borderRadius: 999,
            boxShadow: "0 3px 0 0 var(--ink)",
            padding: "6px 12px",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 11,
            color: "var(--ink)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{ fontSize: 13 }}>✦</span>
          Idea &amp; credit: Dr. Katz
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <MatrixEntries matrix={matrix} onChange={setEntryImmediate} />

        <section>
          <h3
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
            Presets
          </h3>
          <PresetCarousel
            current={matrix}
            onPick={(m) => {
              onMatrixChange(m);
            }}
          />
        </section>

        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 5px 0 0 var(--ink)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--ink)",
            lineHeight: 1.5,
          }}
        >
          <p data-on-paper>
            <Tex>
              {`$A = ${fmtMat2(matrix)}$, $\\det A = ${fmtNum(eigenInfo.det)}$`}
            </Tex>
          </p>
          <p data-on-paper>
            {eigenInfo.complex ? (
              <Tex>
                {
                  "Eigenvalues are complex — $A$ rotates rather than stretches. No real eigenvector lines."
                }
              </Tex>
            ) : (
              <Tex>
                {`Eigenvalues: $\\lambda_1 = ${fmtNum(eigenInfo.eigenvalues[0])}$, $\\lambda_2 = ${fmtNum(eigenInfo.eigenvalues[1])}$. Vectors along the purple lines satisfy $A\\vec{v} = \\lambda \\vec{v}$.`}
              </Tex>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

function TransformLayer({
  ctx,
  renderedMatrix,
  targetMatrix,
  eigen,
  t,
  showFull,
  onSetBasisTip,
}: {
  ctx: CanvasCtx;
  renderedMatrix: Mat2;
  targetMatrix: Mat2;
  eigen: ReturnType<typeof analyze>;
  t: number;
  showFull: boolean;
  onSetBasisTip: (which: "e1" | "e2", x: number, y: number) => void;
}) {
  const { px, py, range } = ctx;
  const orig: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const transformed = orig.map(
    ([x, y]) => apply(renderedMatrix, [x, y]) as [number, number],
  );
  const Mi = apply(renderedMatrix, [1, 0]);
  const Mj = apply(renderedMatrix, [0, 1]);
  const detRendered = renderedMatrix[0][0] * renderedMatrix[1][1] - renderedMatrix[0][1] * renderedMatrix[1][0];
  const gridLines = transformedGrid(renderedMatrix, range, 1);

  const draggingDisabled = t < 0.999;

  return (
    <>
      {/* Transformed grid */}
      {gridLines.map((ln, k) => (
        <line
          key={`tg-${k}`}
          x1={px(ln[0][0])}
          y1={py(ln[0][1])}
          x2={px(ln[1][0])}
          y2={py(ln[1][1])}
          stroke="var(--pink)"
          strokeWidth={1}
          opacity={0.35}
        />
      ))}

      {/* Det area — color crossfades through 0 */}
      {showFull && (
        <polygon
          points={transformed.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")}
          fill={detRendered < 0 ? "var(--pink)" : "var(--lemon)"}
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
        opacity={0.45}
      />

      {/* Eigenvector lines */}
      {showFull && eigen.eigenvectors && (
        <g style={{ filter: "drop-shadow(0 0 5px rgba(155,107,255,0.55))" }}>
          {eigen.eigenvectors.map((v, k) => {
            const norm = Math.hypot(v[0], v[1]);
            if (norm < 1e-6) return null;
            const ux = (v[0] / norm) * range;
            const uy = (v[1] / norm) * range;
            return (
              <line
                key={`ev-${k}`}
                x1={px(-ux)}
                y1={py(-uy)}
                x2={px(ux)}
                y2={py(uy)}
                stroke="var(--grape)"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
        </g>
      )}

      {/* Transformed basis vectors */}
      <Arrow ctx={ctx} from={[0, 0]} to={Mi} color="var(--pink)" />
      <Arrow ctx={ctx} from={[0, 0]} to={Mj} color="var(--mint)" />

      {/* Drag handles only on tips when t=1 (settled). */}
      <DraggableTip
        ctx={ctx}
        x={targetMatrix[0][0]}
        y={targetMatrix[1][0]}
        onChange={(x, y) => onSetBasisTip("e1", x, y)}
        color="var(--pink)"
        ariaLabel="Set the tip of A times e1"
        range={{ min: -range, max: range }}
        disabled={draggingDisabled}
      />
      <DraggableTip
        ctx={ctx}
        x={targetMatrix[0][1]}
        y={targetMatrix[1][1]}
        onChange={(x, y) => onSetBasisTip("e2", x, y)}
        color="var(--mint)"
        ariaLabel="Set the tip of A times e2"
        range={{ min: -range, max: range }}
        disabled={draggingDisabled}
      />
    </>
  );
}

function TransformOverlay({
  ctx,
  renderedMatrix,
  renderedEigen,
  targetMatrix,
  showFull,
  t,
}: {
  ctx: CanvasCtx;
  renderedMatrix: Mat2;
  renderedEigen: ReturnType<typeof analyze>;
  targetMatrix: Mat2;
  showFull: boolean;
  t: number;
}) {
  const Mi = apply(renderedMatrix, [1, 0]);
  const Mj = apply(renderedMatrix, [0, 1]);
  return (
    <>
      <TexLabel ctx={ctx} x={Mi[0]} y={Mi[1]} dx={10} dy={-4} fontSize={13}>
        {"$A\\vec{e}_1$"}
      </TexLabel>
      <TexLabel ctx={ctx} x={Mj[0]} y={Mj[1]} dx={10} dy={-4} fontSize={13}>
        {"$A\\vec{e}_2$"}
      </TexLabel>
      {/* Live det readout pinned to upper-left of the canvas */}
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
          color: "var(--ink)",
          boxShadow: "0 3px 0 0 var(--ink)",
        }}
      >
        <Tex>
          {`$\\det = ${fmtNum(
            renderedMatrix[0][0] * renderedMatrix[1][1] -
              renderedMatrix[0][1] * renderedMatrix[1][0],
          )}$`}
        </Tex>
      </span>
      {/* Eigenline labels */}
      {showFull &&
        t > 0.99 &&
        renderedEigen.eigenvectors &&
        renderedEigen.eigenvectors.map((v, k) => {
          const norm = Math.hypot(v[0], v[1]);
          if (norm < 1e-6) return null;
          const ux = (v[0] / norm) * (ctx.range * 0.78);
          const uy = (v[1] / norm) * (ctx.range * 0.78);
          return (
            <TexLabel
              key={`evl-${k}`}
              ctx={ctx}
              x={ux}
              y={uy}
              dx={4}
              dy={-4}
              fontSize={12}
              bg="var(--paper)"
            >
              {`$\\lambda_{${k + 1}} = ${fmtNum(renderedEigen.eigenvalues[k] ?? 0)}$`}
            </TexLabel>
          );
        })}
      {/* Target matrix label, top-right */}
      <span
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          background: "var(--paper)",
          border: "2px solid var(--ink)",
          borderRadius: 10,
          padding: "4px 8px",
          fontSize: 13,
          color: "var(--ink)",
          boxShadow: "0 3px 0 0 var(--ink)",
        }}
      >
        <Tex>{`$A = ${fmtMat2(targetMatrix)}$`}</Tex>
      </span>
    </>
  );
}

function MatrixEntries({
  matrix,
  onChange,
}: {
  matrix: Mat2;
  onChange: (i: 0 | 1, j: 0 | 1, v: number) => void;
}) {
  return (
    <section
      data-light-card
      style={{
        background: "var(--paper)",
        border: "4px solid var(--ink)",
        borderRadius: 24,
        boxShadow: "0 7px 0 0 var(--ink)",
        padding: "20px 22px",
      }}
    >
      <h3
        data-on-paper
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 18,
          color: "var(--ink)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Tex>{"$A$"}</Tex>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>entries</span>
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}
      >
        {[0, 1].flatMap((i) =>
          [0, 1].map((j) => (
            <label
              key={`${i}${j}`}
              data-on-paper
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 11,
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>
                <Tex>{`$a_{${i + 1}${j + 1}}$`}</Tex>
              </span>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.5}
                value={matrix[i][j]}
                onChange={(e) =>
                  onChange(i as 0 | 1, j as 0 | 1, parseFloat(e.target.value))
                }
                style={{ accentColor: "var(--grape)" }}
              />
              <input
                type="number"
                step={0.5}
                value={matrix[i][j]}
                onChange={(e) =>
                  onChange(
                    i as 0 | 1,
                    j as 0 | 1,
                    parseFloat(e.target.value || "0"),
                  )
                }
                style={{
                  background: "var(--cream-deep)",
                  border: "3px solid var(--ink)",
                  borderRadius: 12,
                  boxShadow: "0 3px 0 0 var(--ink)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "var(--ink)",
                }}
              />
            </label>
          )),
        )}
      </div>
    </section>
  );
}
