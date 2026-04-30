"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tex } from "@/components/Tex";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { CanvasFrame } from "@/components/viz/canvas/CanvasFrame";
import { Arrow } from "@/components/viz/canvas/Arrow";
import { TexLabel } from "@/components/viz/canvas/TexLabel";
import { DraggableTip } from "@/components/viz/canvas/DraggableTip";
import { PresetCarousel } from "@/components/viz/PresetCarousel";
import {
  type Mat2,
  type Vec2,
  analyze,
  apply,
  fmtMat2,
  fmtNum,
  parallel2,
} from "@/lib/viz/linalg2";

type Props = {
  matrix: Mat2;
  onMatrixChange: (m: Mat2) => void;
  reducedMotion: boolean;
};

export function EigenMode({ matrix, onMatrixChange, reducedMotion }: Props) {
  const [v, setV] = useState<Vec2>([1, 0]);
  const [autoCycle, setAutoCycle] = useState(false);
  const angleRef = useRef(0);

  const eigen = useMemo(() => analyze(matrix), [matrix]);
  const Av = apply(matrix, v);

  // Detect alignment with eigenvector lines
  const alignedIdx = useMemo(() => {
    if (!eigen.eigenvectors) return -1;
    return eigen.eigenvectors.findIndex((ev) => parallel2(v, ev, 0.04));
  }, [eigen.eigenvectors, v]);

  useEffect(() => {
    if (!autoCycle) return;
    if (reducedMotion) {
      setAutoCycle(false);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      angleRef.current = (angleRef.current + dt * 0.6) % (Math.PI * 2);
      setV([Math.cos(angleRef.current), Math.sin(angleRef.current)]);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoCycle, reducedMotion]);

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
        ariaLabel="Eigenvector demonstration"
        renderSvg={(ctx) => {
          const { px, py, range } = ctx;
          return (
            <>
              {/* Unit circle */}
              <circle
                cx={px(0)}
                cy={py(0)}
                r={(1 / range) * (ctx.size / 2)}
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              {/* Eigenlines */}
              {!eigen.complex &&
                eigen.eigenvectors &&
                eigen.eigenvectors.map((ev, k) => {
                  const norm = Math.hypot(ev[0], ev[1]);
                  if (norm < 1e-6) return null;
                  const ux = (ev[0] / norm) * range;
                  const uy = (ev[1] / norm) * range;
                  const isAligned = alignedIdx === k;
                  return (
                    <line
                      key={k}
                      x1={px(-ux)}
                      y1={py(-uy)}
                      x2={px(ux)}
                      y2={py(uy)}
                      stroke="var(--grape)"
                      strokeWidth={isAligned ? 4 : 2.5}
                      strokeLinecap="round"
                      opacity={isAligned ? 1 : 0.65}
                      style={
                        isAligned
                          ? { filter: "drop-shadow(0 0 6px var(--grape))" }
                          : undefined
                      }
                    />
                  );
                })}
              {/* v and Av */}
              <Arrow ctx={ctx} from={[0, 0]} to={v} color="var(--sky)" />
              <Arrow ctx={ctx} from={[0, 0]} to={Av} color="var(--lemon)" width={5} glow={alignedIdx >= 0} />
              <DraggableTip
                ctx={ctx}
                x={v[0]}
                y={v[1]}
                onChange={(x, y) => {
                  setAutoCycle(false);
                  setV([x, y]);
                }}
                color="var(--sky)"
                ariaLabel="Test vector v"
                range={{ min: -range, max: range }}
              />
            </>
          );
        }}
        renderOverlay={(ctx) => (
          <>
            <TexLabel ctx={ctx} x={v[0]} y={v[1]} dx={10} dy={-4} fontSize={13}>
              {"$\\vec{v}$"}
            </TexLabel>
            <TexLabel ctx={ctx} x={Av[0]} y={Av[1]} dx={10} dy={-4} fontSize={13}>
              {"$A\\vec{v}$"}
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
              <Tex>{`$A = ${fmtMat2(matrix)}$`}</Tex>
            </span>
            {alignedIdx >= 0 && eigen.eigenvalues[alignedIdx] !== undefined && (
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 10,
                  background: "var(--lemon)",
                  border: "3px solid var(--ink)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  boxShadow: "0 4px 0 0 var(--ink)",
                  fontSize: 16,
                }}
              >
                <Tex>
                  {`$A\\vec{v} = ${fmtNum(eigen.eigenvalues[alignedIdx])}\\,\\vec{v}$`}
                </Tex>
              </span>
            )}
            {eigen.complex && (
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 10,
                  background: "var(--cream-deep)",
                  border: "3px solid var(--ink)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  boxShadow: "0 4px 0 0 var(--ink)",
                  fontSize: 13,
                  maxWidth: 300,
                }}
              >
                <Tex>
                  {
                    "Complex eigenvalues — $A$ rotates $\\vec{v}$. No real eigenvector lines."
                  }
                </Tex>
              </span>
            )}
          </>
        )}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
            Eigenvector demo
          </h3>
          <p
            data-on-paper
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--ink)",
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          >
            <Tex>
              {
                "Drag the blue dot to spin $\\vec{v}$ around. When $\\vec{v}$ aligns with a purple eigenline, $A\\vec{v}$ snaps onto the same line — that's $A\\vec{v} = \\lambda \\vec{v}$."
              }
            </Tex>
          </p>
          <ChunkyButton
            size="sm"
            color="var(--sky)"
            onClick={() => setAutoCycle((p) => !p)}
            disabled={reducedMotion}
          >
            {autoCycle ? "Stop auto-cycle" : "Auto-cycle 360°"}
          </ChunkyButton>
        </section>

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
          {eigen.complex ? (
            <p data-on-paper style={{ color: "var(--ink)" }}>
              <Tex>
                {
                  "$A$ has complex eigenvalues — pure rotation. Try Stretch or Reflect to see real eigenvectors."
                }
              </Tex>
            </p>
          ) : (
            <p data-on-paper style={{ color: "var(--ink)" }}>
              <Tex>
                {`Eigenvalues: $\\lambda_1 = ${fmtNum(eigen.eigenvalues[0])}$, $\\lambda_2 = ${fmtNum(eigen.eigenvalues[1])}$`}
              </Tex>
            </p>
          )}
        </section>

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
            Try a different matrix
          </h3>
          <PresetCarousel current={matrix} onPick={(m) => onMatrixChange(m)} />
        </section>
      </div>
    </div>
  );
}
