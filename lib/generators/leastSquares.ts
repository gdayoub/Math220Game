import type { Question, Difficulty } from "../topics";
import { fmtMatrix, fmtVector, randInt, randNonZero, type Mat, type Vec } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

function dot(a: Vec, b: Vec): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

function transpose(M: Mat): Mat {
  return M[0].map((_, j) => M.map((row) => row[j]));
}

function matVec(M: Mat, v: Vec): Vec {
  return M.map((row) => dot(row, v));
}

function matMul(A: Mat, B: Mat): Mat {
  const Bt = transpose(B);
  return A.map((row) => Bt.map((col) => dot(row, col)));
}

function inv2(M: Mat): Mat | null {
  const a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1];
  const det = a * d - b * c;
  if (det === 0) return null;
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ];
}

export function generateLeastSquares(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // Form normal equations from given A, b
    // Ask for A^T A
    const A: Mat = [
      [randNonZero(-2, 3), randInt(-2, 3)],
      [randInt(-2, 3), randNonZero(-2, 3)],
      [randInt(-2, 3), randInt(-2, 3)],
    ];
    const At = transpose(A);
    const AtA = matMul(At, A);
    return {
      id: id("lsq-e"),
      topic: "leastSquares",
      difficulty,
      prompt: `For the least-squares system $A\\mathbf{x} \\approx \\mathbf{b}$ with $A = ${fmtMatrix(A)}$, compute $A^T A$. Enter as four comma-separated entries: top-left, top-right, bottom-left, bottom-right.`,
      inputType: "vector",
      answer: [AtA[0][0], AtA[0][1], AtA[1][0], AtA[1][1]],
      steps: [
        `Normal equations: $A^T A \\mathbf{x} = A^T \\mathbf{b}$.`,
        `$A^T A = ${fmtMatrix(AtA)}$.`,
      ],
      commonMistake: "Computing $A A^T$ instead of $A^T A$ — they have different dimensions.",
      conceptTag: "normal-eq-AtA",
      timeLimitSec: 100,
    };
  }

  if (difficulty === "medium") {
    // Solve a 2-variable least-squares problem: find x_hat
    // Build A (3x2) and b such that least-squares solution is integer-friendly
    const xhat = [randNonZero(-3, 3), randNonZero(-3, 3)];
    const A: Mat = [
      [1, randInt(-2, 2)],
      [1, randInt(-2, 2)],
      [1, randInt(-2, 2)],
    ];
    // Make A^T A invertible by ensuring not all column-2 entries equal
    if (A[0][1] === A[1][1] && A[1][1] === A[2][1]) A[0][1] += 1;
    // Choose b not exactly in col(A) by adding a perturbation orthogonal-ish
    const exact = matVec(A, xhat);
    const b = exact.map((v, i) => v + (i === 0 ? 1 : i === 1 ? -1 : 0));
    // Solve x_hat = (A^T A)^-1 A^T b
    const At = transpose(A);
    const AtA = matMul(At, A);
    const Atb = matVec(At, b);
    const inv = inv2(AtA)!;
    const sol = matVec(inv, Atb);
    return {
      id: id("lsq-m"),
      topic: "leastSquares",
      difficulty,
      prompt: `Find the least-squares solution $\\hat{\\mathbf{x}}$ for $A\\mathbf{x} = \\mathbf{b}$ where $A = ${fmtMatrix(A)}$, $\\mathbf{b} = ${fmtVector(b)}$. Enter as $(x_1, x_2)$.`,
      inputType: "vector",
      answer: [Number(sol[0].toFixed(4)), Number(sol[1].toFixed(4))],
      steps: [
        `Solve $A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b}$.`,
        `$A^T A = ${fmtMatrix(AtA)}$, $A^T\\mathbf{b} = ${fmtVector(Atb)}$.`,
        `Invert and multiply: $\\hat{\\mathbf{x}} \\approx (${sol[0].toFixed(2)}, ${sol[1].toFixed(2)})$.`,
      ],
      commonMistake: "Trying to solve $A\\mathbf{x} = \\mathbf{b}$ directly — usually no solution exists.",
      conceptTag: "lsq-solve",
      timeLimitSec: 180,
    };
  }

  // hard: when does LS have unique solution? Conceptual T/F
  return {
    id: id("lsq-h"),
    topic: "leastSquares",
    difficulty: "hard",
    prompt: `True or false: The least-squares problem $A\\mathbf{x} \\approx \\mathbf{b}$ has a unique solution if and only if the columns of $A$ are linearly independent.`,
    inputType: "boolean",
    answer: true,
    steps: [
      `$A^T A$ is invertible iff $A$ has linearly independent columns.`,
      `Unique LS solution exists iff $A^T A$ is invertible.`,
      `Therefore the statement is true.`,
    ],
    commonMistake: "Confusing 'rows' with 'columns' — independence of columns is what matters here.",
    conceptTag: "lsq-uniqueness",
    timeLimitSec: 60,
  };
}
