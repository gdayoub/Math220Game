import type { Question, Difficulty } from "../topics";
import { fmtMatrix, fmtVector, randInt, randNonZero, rank, type Mat } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

export function generateIndependence(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // 2 vectors in R^3 — independent iff not parallel
    const v1 = [randNonZero(-3, 3), randInt(-3, 3), randInt(-3, 3)];
    const isDep = Math.random() < 0.4;
    const v2 = isDep
      ? v1.map((x) => x * randNonZero(-2, 2))
      : [randInt(-3, 3), randNonZero(-3, 3), randInt(-3, 3)];
    const indep = rank([v1, v2]) === 2;
    return {
      id: id("indep-e"),
      topic: "independence",
      difficulty,
      prompt: `Are the vectors $\\mathbf{v}_1 = ${fmtVector(v1)}$ and $\\mathbf{v}_2 = ${fmtVector(v2)}$ linearly independent?`,
      inputType: "boolean",
      answer: indep,
      steps: [
        `Two vectors are dependent iff one is a scalar multiple of the other.`,
        indep ? `No scalar $c$ satisfies $\\mathbf{v}_1 = c\\mathbf{v}_2$, so they are independent.` : `Found $c$ such that $\\mathbf{v}_1 = c\\mathbf{v}_2$, so they are dependent.`,
      ],
      commonMistake: "Confusing 'not equal' with 'independent' — parallel non-equal vectors are still dependent.",
      conceptTag: "indep-2vec",
      timeLimitSec: 45,
    };
  }

  if (difficulty === "medium") {
    // 3 vectors in R^3 — independent iff det != 0
    const cols = 3;
    let A: Mat;
    let depForce = Math.random() < 0.45;
    if (depForce) {
      const v1 = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
      const v2 = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
      const a = randNonZero(-2, 2);
      const b = randNonZero(-2, 2);
      const v3 = v1.map((x, i) => a * x + b * v2[i]);
      A = [v1, v2, v3];
    } else {
      A = Array.from({ length: cols }, () => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)]);
    }
    const r = rank(A);
    const indep = r === cols;
    return {
      id: id("indep-m"),
      topic: "independence",
      difficulty,
      prompt: `Determine whether the columns of $A$ are linearly independent.\n\n$$A = ${fmtMatrix([[A[0][0], A[1][0], A[2][0]], [A[0][1], A[1][1], A[2][1]], [A[0][2], A[1][2], A[2][2]]])}$$`,
      inputType: "boolean",
      answer: indep,
      steps: [
        `Columns are independent iff $\\text{rank}(A) = $ number of columns.`,
        `$\\text{rank}(A) = ${r}$, columns $= ${cols}$.`,
        indep ? `Equal $\\Rightarrow$ independent.` : `Less than $\\Rightarrow$ dependent.`,
      ],
      commonMistake: "Computing rank of the wrong dimension — must compare against number of columns, not rows.",
      conceptTag: "indep-3vec",
      timeLimitSec: 80,
    };
  }

  // hard: span/dimension question — what's dim(span) of these 4 vectors in R^3
  const vecs: Mat = Array.from({ length: 4 }, () => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)]);
  // Make at least one redundant
  if (Math.random() < 0.6) {
    vecs[3] = vecs[0].map((x, i) => 2 * x - vecs[1][i]);
  }
  const r = rank(vecs);
  return {
    id: id("indep-h"),
    topic: "independence",
    difficulty: "hard",
    prompt: `Find $\\dim(\\text{span}\\{\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3, \\mathbf{v}_4\\})$ where the rows of $A$ are the vectors.\n\n$$A = ${fmtMatrix(vecs)}$$`,
    inputType: "scalar",
    answer: r,
    steps: [
      `$\\dim(\\text{span})$ = number of linearly independent vectors = $\\text{rank}(A)$.`,
      `Reduce $A$ to RREF and count nonzero rows.`,
      `Result: $\\dim = ${r}$.`,
    ],
    commonMistake: "Counting the number of vectors instead of the rank.",
    conceptTag: "span-dim",
    timeLimitSec: 100,
  };
}
