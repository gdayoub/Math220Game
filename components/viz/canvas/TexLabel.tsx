"use client";
import { Tex } from "@/components/Tex";
import type { CSSProperties } from "react";
import type { CanvasCtx } from "./CanvasFrame";

type Props = {
  ctx: CanvasCtx;
  /** Math-coord anchor */
  x: number;
  y: number;
  children: string;
  /** "center" | "start" | "end" — horizontal align relative to anchor */
  align?: "center" | "start" | "end";
  /** Pixel offset from the anchor (after coord conversion) */
  dx?: number;
  dy?: number;
  fontSize?: number;
  bg?: string;
  ariaLabel?: string;
};

/** KaTeX label positioned over the SVG canvas via HTML overlay (NOT foreignObject). */
export function TexLabel({
  ctx,
  x,
  y,
  children,
  align = "start",
  dx = 0,
  dy = 0,
  fontSize = 14,
  bg,
  ariaLabel,
}: Props) {
  const left = ctx.px(x) + dx;
  const top = ctx.py(y) + dy;
  const transform =
    align === "center"
      ? "translate(-50%, -50%)"
      : align === "end"
        ? "translate(-100%, -50%)"
        : "translate(0, -50%)";
  const style: CSSProperties = {
    position: "absolute",
    left,
    top,
    transform,
    fontSize,
    color: "var(--ink)",
    background: bg,
    padding: bg ? "2px 6px" : 0,
    borderRadius: bg ? 8 : 0,
    border: bg ? "2px solid var(--ink)" : undefined,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    lineHeight: 1,
  };
  return (
    <span style={style} aria-label={ariaLabel}>
      <Tex>{children}</Tex>
    </span>
  );
}
