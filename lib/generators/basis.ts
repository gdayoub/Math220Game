import type { Question, Difficulty } from "../topics";
import { fmtMatrix, fmtVector, randInt, randNonZero, rank, rref, type Mat } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

export function generateBasis(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // Dimension of column space (= rank) of a small matrix
    const A: Mat = Array.from({ length: 3 }, () => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)]);
    if (Math.random() < 0.5) {
      A[2] = A[0].map((x, i) => x + A[1][i]);
    }
    const r = rank(A);
    return {
      id: id("basis-e"),
      topic: "basis",
      difficulty,
      prompt: `What is the dimension of $\\text{Col}(A)$?\n\n$$A = ${fmtMatrix(A)}$$`,
      inputType: "scalar",
      answer: r,
      steps: [
        `$\\dim(\\text{Col}(A)) = \\text{rank}(A)$.`,
        `Reduce: $${fmtMatrix(rref(A))}$. Pivot columns count: $${r}$.`,
      ],
      commonMistake: "Confusing $\\dim(\\text{Col})$ with the number of columns.",
      conceptTag: "dim-col",
      timeLimitSec: 60,
    };
  }

  if (difficulty === "medium") {
    // Dimension of null space via rank-nullity: nullity = n - rank
    const rows = 3, cols = 4;
    const A: Mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(-3, 3)));
    if (Math.random() < 0.5) {
      A[2] = A[0].map((x, i) => randNonZero(-2, 2) * x + A[1][i]);
    }
    const r = rank(A);
    const nullity = cols - r;
    return {
      id: id("basis-m"),
      topic: "basis",
      difficulty,
      prompt: `Find $\\dim(\\text{Nul}(A))$ for the $3\\times 4$ matrix.\n\n$$A = ${fmtMatrix(A)}$$`,
      inputType: "scalar",
      answer: nullity,
      steps: [
        `Rank-nullity: $\\dim(\\text{Nul}(A)) = n - \\text{rank}(A)$ with $n =$ number of columns.`,
        `$\\text{rank}(A) = ${r}$, $n = ${cols}$.`,
        `$\\Rightarrow \\dim(\\text{Nul}(A)) = ${cols} - ${r} = ${nullity}$.`,
      ],
      commonMistake: "Using number of rows instead of columns for $n$ in the rank-nullity theorem.",
      conceptTag: "rank-nullity",
      timeLimitSec: 90,
    };
  }

  // hard: coordinates relative to a basis
  // Find [v]_B where B = {b1, b2} basis of R^2 and v = a*b1 + b*b2
  const b1 = [randNonZero(-3, 3), randInt(-3, 3)];
  let b2 = [randInt(-3, 3), randNonZero(-3, 3)];
  // Ensure independent
  while (b1[0] * b2[1] - b1[1] * b2[0] === 0) b2 = [randInt(-3, 3), randNonZero(-3, 3)];
  const a = randInt(-3, 3), c = randInt(-3, 3);
  const v = [a * b1[0] + c * b2[0], a * b1[1] + c * b2[1]];
  return {
    id: id("basis-h"),
    topic: "basis",
    difficulty: "hard",
    prompt: `Let $B = \\{\\mathbf{b}_1, \\mathbf{b}_2\\}$ be a basis of $\\mathbb{R}^2$ with $\\mathbf{b}_1 = ${fmtVector(b1)}$, $\\mathbf{b}_2 = ${fmtVector(b2)}$. Find $[\\mathbf{v}]_B$ where $\\mathbf{v} = ${fmtVector(v)}$. Enter as $(a_1, a_2)$.`,
    inputType: "vector",
    answer: [a, c],
    steps: [
      `Solve $a_1 \\mathbf{b}_1 + a_2 \\mathbf{b}_2 = \\mathbf{v}$ — i.e. $[\\mathbf{b}_1\\ \\mathbf{b}_2] [a_1, a_2]^T = \\mathbf{v}$.`,
      `Apply Gauss-Jordan or use the inverse of $[\\mathbf{b}_1\\ \\mathbf{b}_2]$.`,
      `$[\\mathbf{v}]_B = (${a}, ${c})$.`,
    ],
    commonMistake: "Reading off the standard coordinates of $\\mathbf{v}$ instead of solving for the coefficients.",
    conceptTag: "coords-basis",
    timeLimitSec: 120,
  };
}
