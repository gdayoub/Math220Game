import type { Question, Difficulty } from "../topics";
import { fmtMatrix, fmtVector, randInt, randNonZero, type Mat, det as detM, inv as invM } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

function matMul(A: Mat, B: Mat): Mat {
  const n = A.length, m = B[0].length, k = B.length;
  const C: Mat = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) s += A[i][p] * B[p][j];
      C[i][j] = s;
    }
  return C;
}

function matVec(M: Mat, v: number[]): number[] {
  return M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
}

export function generateMatrixOps(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // 2x2 determinant
    const A: Mat = [[randNonZero(-4, 4), randInt(-4, 4)], [randInt(-4, 4), randNonZero(-4, 4)]];
    const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return {
      id: id("ops-e"),
      topic: "matrixOps",
      difficulty,
      prompt: `Compute $\\det(A)$.\n\n$$A = ${fmtMatrix(A)}$$`,
      inputType: "scalar",
      answer: d,
      steps: [
        `For $2\\times 2$: $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$.`,
        `$= ${A[0][0]}\\cdot${A[1][1]} - ${A[0][1]}\\cdot${A[1][0]} = ${d}$.`,
      ],
      commonMistake: "Sign error — it's $ad - bc$, not $ab - cd$.",
      conceptTag: "det-2x2",
      timeLimitSec: 40,
    };
  }

  if (difficulty === "medium") {
    // Matrix-vector product
    const A: Mat = Array.from({ length: 3 }, () => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)]);
    const v = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
    const Av = matVec(A, v);
    return {
      id: id("ops-m"),
      topic: "matrixOps",
      difficulty,
      prompt: `Compute $A\\mathbf{v}$.\n\n$$A = ${fmtMatrix(A)},\\quad \\mathbf{v} = ${fmtVector(v)}$$\n\nEnter as $(y_1, y_2, y_3)$.`,
      inputType: "vector",
      answer: Av,
      steps: [
        `Each entry: row of $A$ dotted with $\\mathbf{v}$.`,
        `$A\\mathbf{v} = (${Av.join(", ")})$.`,
      ],
      commonMistake: "Computing column-by-column instead of row-by-row, or transposing accidentally.",
      conceptTag: "matvec",
      timeLimitSec: 90,
    };
  }

  // hard: 3x3 determinant — by cofactor or row-reduction
  // Build a matrix with controlled determinant
  const A: Mat = Array.from({ length: 3 }, () => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)]);
  const d = Math.round(detM(A));
  return {
    id: id("ops-h"),
    topic: "matrixOps",
    difficulty: "hard",
    prompt: `Compute $\\det(A)$ for the $3\\times 3$ matrix.\n\n$$A = ${fmtMatrix(A)}$$`,
    inputType: "scalar",
    answer: d,
    steps: [
      `Expand by cofactors along row 1: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$.`,
      `Or row-reduce and track scaling/swaps.`,
      `$\\det(A) = ${d}$.`,
    ],
    commonMistake: "Forgetting the alternating sign in cofactor expansion.",
    conceptTag: "det-3x3",
    timeLimitSec: 150,
  };
}
