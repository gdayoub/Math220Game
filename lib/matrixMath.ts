import { create, all, Matrix } from "mathjs";

const math = create(all, { number: "Fraction" });
const mathNum = create(all, { number: "number" });

export type Mat = number[][];
export type Vec = number[];

export function matrix(rows: Mat) {
  return mathNum.matrix(rows);
}

export function det(m: Mat): number {
  return mathNum.det(m as unknown as Matrix);
}

export function inv(m: Mat): Mat {
  return mathNum.inv(m as unknown as Matrix) as unknown as Mat;
}

export function multiply(a: Mat, b: Mat): Mat {
  return mathNum.multiply(a, b) as unknown as Mat;
}

export function matVec(m: Mat, v: Vec): Vec {
  return mathNum.multiply(m, v) as unknown as Vec;
}

export function transpose(m: Mat): Mat {
  return mathNum.transpose(m) as unknown as Mat;
}

/** Reduced row-echelon form using exact fractions, returned as numbers. */
export function rref(rows: Mat): Mat {
  const M: number[][] = rows.map((r) => r.slice());
  const m = M.length;
  if (m === 0) return M;
  const n = M[0].length;
  let lead = 0;
  for (let r = 0; r < m; r++) {
    if (lead >= n) break;
    let i = r;
    while (i < m && Math.abs(M[i][lead]) < 1e-10) i++;
    if (i === m) {
      lead++;
      r--;
      continue;
    }
    [M[i], M[r]] = [M[r], M[i]];
    const lv = M[r][lead];
    for (let j = 0; j < n; j++) M[r][j] = M[r][j] / lv;
    for (let k = 0; k < m; k++) {
      if (k !== r) {
        const lv2 = M[k][lead];
        for (let j = 0; j < n; j++) M[k][j] = M[k][j] - lv2 * M[r][j];
      }
    }
    lead++;
  }
  // Clean up tiny floats
  return M.map((row) =>
    row.map((x) => {
      if (Math.abs(x) < 1e-9) return 0;
      const rounded = Math.round(x);
      if (Math.abs(x - rounded) < 1e-9) return rounded;
      return Number(x.toFixed(6));
    }),
  );
}

export function rank(rows: Mat): number {
  const R = rref(rows);
  let r = 0;
  for (const row of R) {
    if (row.some((x) => Math.abs(x) > 1e-9)) r++;
  }
  return r;
}

export function eig(m: Mat): { values: number[]; vectors: Mat | null } {
  try {
    const result = mathNum.eigs(m) as unknown as {
      values: number[] | { toArray: () => number[] };
      eigenvectors?: Array<{ value: number; vector: number[] | { toArray: () => number[] } }>;
    };
    const vals = Array.isArray(result.values)
      ? result.values
      : result.values.toArray();
    const vecs: Mat = (result.eigenvectors ?? []).map((ev) =>
      Array.isArray(ev.vector) ? ev.vector : ev.vector.toArray(),
    );
    return {
      values: vals.map((v) => (typeof v === "number" ? v : Number(v))),
      vectors: vecs.length ? vecs : null,
    };
  } catch {
    return { values: [], vectors: null };
  }
}

export function fmtMatrix(m: Mat): string {
  // KaTeX bmatrix
  return (
    "\\begin{bmatrix}" +
    m
      .map((row) => row.map((x) => fmtNum(x)).join(" & "))
      .join(" \\\\ ") +
    "\\end{bmatrix}"
  );
}

export function fmtAugmented(m: Mat): string {
  if (m.length === 0) return "";
  const n = m[0].length;
  const cols = "c".repeat(n - 1) + "|c";
  return (
    "\\left[\\begin{array}{" +
    cols +
    "}" +
    m.map((row) => row.map((x) => fmtNum(x)).join(" & ")).join(" \\\\ ") +
    "\\end{array}\\right]"
  );
}

export function fmtVector(v: Vec): string {
  return "\\begin{bmatrix}" + v.map((x) => fmtNum(x)).join(" \\\\ ") + "\\end{bmatrix}";
}

export function fmtNum(x: number): string {
  if (Number.isInteger(x)) return String(x);
  // Try to render simple fractions
  for (const den of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) {
    const num = x * den;
    if (Math.abs(num - Math.round(num)) < 1e-6) {
      const n = Math.round(num);
      if (n === 0) return "0";
      return `\\frac{${n}}{${den}}`;
    }
  }
  return x.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function approxEqual(a: number, b: number, eps = 1e-4): boolean {
  return Math.abs(a - b) < eps;
}

export function vecEqual(a: Vec, b: Vec, eps = 1e-4): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => approxEqual(x, b[i], eps));
}

export function matEqual(a: Mat, b: Mat, eps = 1e-4): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, i) => row.length === b[i].length && vecEqual(row, b[i], eps));
}

/** Compare a user vector to target up to a nonzero scalar (for eigenvectors). */
export function parallelTo(user: Vec, target: Vec, eps = 1e-3): boolean {
  if (user.length !== target.length) return false;
  if (user.every((x) => Math.abs(x) < eps)) return false;
  let scale: number | null = null;
  for (let i = 0; i < user.length; i++) {
    if (Math.abs(target[i]) < eps) {
      if (Math.abs(user[i]) > eps) return false;
      continue;
    }
    const s = user[i] / target[i];
    if (scale === null) scale = s;
    else if (Math.abs(s - scale) > eps) return false;
  }
  return scale !== null && Math.abs(scale) > eps;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randNonZero(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
}

export { math, mathNum };
