import type { Question } from "./topics";
import { approxEqual, parallelTo, vecEqual, matEqual } from "./matrixMath";

function setEqual(a: number[], b: number[], eps = 1e-4): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((x, i) => Math.abs(x - sb[i]) < eps);
}

/** Returns true if the user answer matches the canonical answer. */
export function gradeAnswer(q: Question, user: unknown): boolean {
  switch (q.inputType) {
    case "scalar": {
      const u = parseScalar(user);
      const a = q.answer as number;
      return u !== null && approxEqual(u, a);
    }
    case "vector": {
      const u = parseVector(user);
      const a = q.answer as number[];
      if (!u) return false;
      // Eigenvector concept: parallel match (any nonzero scalar multiple)
      if (q.conceptTag.startsWith("eigenvec")) return parallelTo(u, a);
      // Eigenvalue lists: order-insensitive
      if (q.conceptTag.startsWith("eigval")) return setEqual(u, a);
      return vecEqual(u, a);
    }
    case "matrix": {
      const u = parseMatrix(user);
      const a = q.answer as number[][];
      return !!u && matEqual(u, a);
    }
    case "multiple-choice":
      return String(user) === String(q.answer);
    case "boolean":
      return Boolean(user) === Boolean(q.answer);
    default:
      return false;
  }
}

export function parseScalar(s: unknown): number | null {
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  if (typeof s !== "string") return null;
  const trimmed = s.trim();
  if (!trimmed) return null;
  // Allow fractions like "3/4" or "-1/2"
  const frac = trimmed.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (frac) {
    const n = Number(frac[1]);
    const d = Number(frac[2]);
    if (d === 0) return null;
    return n / d;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function parseVector(s: unknown): number[] | null {
  if (Array.isArray(s)) {
    const parsed = s.map((x) => parseScalar(x));
    return parsed.every((x) => x !== null) ? (parsed as number[]) : null;
  }
  if (typeof s !== "string") return null;
  const parts = s.split(/[,\s]+/).map((p) => p.trim()).filter(Boolean);
  const parsed = parts.map((p) => parseScalar(p));
  return parsed.every((x) => x !== null) ? (parsed as number[]) : null;
}

export function parseMatrix(s: unknown): number[][] | null {
  if (Array.isArray(s) && s.every((row) => Array.isArray(row))) {
    const parsed = (s as unknown[][]).map((row) => row.map((x) => parseScalar(x)));
    return parsed.every((row) => row.every((x) => x !== null))
      ? (parsed as number[][])
      : null;
  }
  return null;
}
