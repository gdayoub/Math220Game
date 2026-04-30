export type Mat2 = [[number, number], [number, number]];
export type Vec2 = [number, number];

export const IDENTITY: Mat2 = [[1, 0], [0, 1]];

export function apply(M: Mat2, v: Vec2): Vec2 {
  return [
    M[0][0] * v[0] + M[0][1] * v[1],
    M[1][0] * v[0] + M[1][1] * v[1],
  ];
}

export function det2(M: Mat2): number {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

export function lerpMat(A: Mat2, B: Mat2, t: number): Mat2 {
  return [
    [A[0][0] * (1 - t) + B[0][0] * t, A[0][1] * (1 - t) + B[0][1] * t],
    [A[1][0] * (1 - t) + B[1][0] * t, A[1][1] * (1 - t) + B[1][1] * t],
  ];
}

export function matEq(a: Mat2, b: Mat2, eps = 1e-6): boolean {
  return (
    Math.abs(a[0][0] - b[0][0]) < eps &&
    Math.abs(a[0][1] - b[0][1]) < eps &&
    Math.abs(a[1][0] - b[1][0]) < eps &&
    Math.abs(a[1][1] - b[1][1]) < eps
  );
}

export type Eigen = {
  eigenvalues: number[];
  eigenvectors: Vec2[] | null;
  det: number;
  complex: boolean;
};

export function analyze(M: Mat2): Eigen {
  const a = M[0][0],
    b = M[0][1],
    c = M[1][0],
    d = M[1][1];
  const det = a * d - b * c;
  const tr = a + d;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-9)
    return { eigenvalues: [], eigenvectors: null, det, complex: true };
  const sq = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + sq) / 2,
    l2 = (tr - sq) / 2;
  const evec = (l: number): Vec2 => {
    if (Math.abs(b) > 1e-9) return [b, l - a];
    if (Math.abs(c) > 1e-9) return [l - d, c];
    if (Math.abs(a - l) < 1e-9) return [1, 0];
    return [0, 1];
  };
  return {
    eigenvalues: [l1, l2],
    eigenvectors: [evec(l1), evec(l2)],
    det,
    complex: false,
  };
}

export function transformedGrid(
  M: Mat2,
  range: number,
  step = 1,
): [Vec2, Vec2][] {
  const lines: [Vec2, Vec2][] = [];
  for (let v = -range; v <= range; v += step) {
    if (v === 0) continue;
    lines.push([apply(M, [v, -range]), apply(M, [v, range])]);
    lines.push([apply(M, [-range, v]), apply(M, [range, v])]);
  }
  return lines;
}

export function fmtNum(x: number, digits = 2): string {
  if (Math.abs(x) < 1e-6) return "0";
  if (Math.abs(x - Math.round(x)) < 1e-3) return String(Math.round(x));
  return x.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

/** LaTeX bmatrix from a 2×2. Uses fmtNum for entries. */
export function fmtMat2(M: Mat2): string {
  return (
    `\\begin{bmatrix}${fmtNum(M[0][0])} & ${fmtNum(M[0][1])} \\\\ ` +
    `${fmtNum(M[1][0])} & ${fmtNum(M[1][1])}\\end{bmatrix}`
  );
}

export function fmtVec2(v: Vec2): string {
  return `\\begin{bmatrix}${fmtNum(v[0])} \\\\ ${fmtNum(v[1])}\\end{bmatrix}`;
}

/** True if vectors are parallel (same line through origin), regardless of sign. */
export function parallel2(u: Vec2, v: Vec2, eps = 1e-3): boolean {
  const cross = u[0] * v[1] - u[1] * v[0];
  const nu = Math.hypot(u[0], u[1]);
  const nv = Math.hypot(v[0], v[1]);
  if (nu < eps || nv < eps) return false;
  return Math.abs(cross) / (nu * nv) < eps;
}
