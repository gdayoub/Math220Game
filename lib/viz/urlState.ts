import type { Mat2, Vec2 } from "./linalg2";

export type VizMode = "transform" | "eigen" | "rref" | "span" | "lsq";

const VALID: VizMode[] = ["transform", "eigen", "rref", "span", "lsq"];

export type VizState = {
  mode: VizMode;
  matrix: Mat2;
  augmented: number[][] | null;
  span: { u: Vec2; v: Vec2 } | null;
  points: Vec2[] | null;
};

export const DEFAULT_STATE: VizState = {
  mode: "transform",
  matrix: [[1, 0], [0, 1]],
  augmented: null,
  span: null,
  points: null,
};

function parseNums(s: string | null, expected: number): number[] | null {
  if (!s) return null;
  const parts = s.split(",").map((x) => Number(x));
  if (parts.length !== expected || parts.some((x) => !Number.isFinite(x))) return null;
  return parts;
}

function parsePts(s: string | null): Vec2[] | null {
  if (!s) return null;
  const parts = s.split(";").map((p) => p.split(",").map(Number));
  if (parts.some((p) => p.length !== 2 || p.some((x) => !Number.isFinite(x)))) return null;
  return parts.map((p) => [p[0], p[1]] as Vec2);
}

export function decodeUrl(params: URLSearchParams): VizState {
  const modeRaw = params.get("mode") as VizMode | null;
  const mode: VizMode = modeRaw && VALID.includes(modeRaw) ? modeRaw : "transform";

  const m = parseNums(params.get("m"), 4);
  const matrix: Mat2 = m
    ? [[m[0], m[1]], [m[2], m[3]]]
    : DEFAULT_STATE.matrix;

  let augmented: number[][] | null = null;
  const aug = params.get("aug");
  if (aug) {
    const rows = aug.split(";").map((r) => r.split(",").map(Number));
    if (rows.length > 0 && rows.every((r) => r.length === rows[0].length && r.every(Number.isFinite))) {
      augmented = rows;
    }
  }

  let span: { u: Vec2; v: Vec2 } | null = null;
  const u = parseNums(params.get("u"), 2);
  const v = parseNums(params.get("v"), 2);
  if (u && v) span = { u: [u[0], u[1]], v: [v[0], v[1]] };

  const points = parsePts(params.get("pts"));

  return { mode, matrix, augmented, span, points };
}

export function encodeUrl(s: VizState): string {
  const p = new URLSearchParams();
  if (s.mode !== "transform") p.set("mode", s.mode);
  if (s.mode === "transform" || s.mode === "eigen") {
    const M = s.matrix;
    if (!(M[0][0] === 1 && M[0][1] === 0 && M[1][0] === 0 && M[1][1] === 1)) {
      p.set("m", `${M[0][0]},${M[0][1]},${M[1][0]},${M[1][1]}`);
    }
  }
  if (s.mode === "rref" && s.augmented) {
    p.set("aug", s.augmented.map((r) => r.join(",")).join(";"));
  }
  if (s.mode === "span" && s.span) {
    p.set("u", `${s.span.u[0]},${s.span.u[1]}`);
    p.set("v", `${s.span.v[0]},${s.span.v[1]}`);
  }
  if (s.mode === "lsq" && s.points) {
    p.set("pts", s.points.map((q) => `${q[0]},${q[1]}`).join(";"));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}
