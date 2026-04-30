import type { Question, Difficulty } from "../topics";
import {
  fmtAugmented,
  fmtMatrix,
  randInt,
  randNonZero,
  rank,
  rref,
  type Mat,
} from "../matrixMath";

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Generate a system that is consistent and has a unique solution (square or rectangular).
 * Returns the augmented matrix and the integer solution vector. */
function buildUniqueSystem(rows: number, cols: number, range: number): { aug: Mat; sol: number[] } {
  // Random unimodular-ish matrix: start with identity then apply a few elementary ops
  const A: Mat = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === j ? 1 : 0)),
  );
  // Apply only row operations (keep coefficient matrix invertible by construction).
  const ops = rows === 2 ? 4 : 6;
  for (let k = 0; k < ops; k++) {
    const i = randInt(0, rows - 1);
    let j = randInt(0, rows - 1);
    while (j === i) j = randInt(0, rows - 1);
    const c = randNonZero(-2, 2);
    for (let col = 0; col < cols; col++) A[i][col] += c * A[j][col];
  }
  // Verify the matrix isn't too "clean" — at least 2 nonzero off-diagonal entries
  let offDiag = 0;
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      if (i !== j && A[i][j] !== 0) offDiag++;
  if (offDiag < 2) {
    // One more pass
    const i = 0;
    const j = 1;
    const c = randNonZero(-2, 2);
    for (let col = 0; col < cols; col++) A[i][col] += c * A[j][col];
  }
  const sol = Array.from({ length: cols }, () => randInt(-range, range));
  // b = A * sol
  const b = A.map((row) => row.reduce((acc, v, i) => acc + v * sol[i], 0));
  const aug = A.map((row, i) => [...row, b[i]]);
  return { aug, sol };
}

export function generateRref(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // Solve 2x2 system, ask for x_1
    const { aug, sol } = buildUniqueSystem(2, 2, 4);
    return {
      id: makeId("rref-e"),
      topic: "rref",
      difficulty,
      prompt: `Solve the system. Enter the value of $x_1$.\n\n$$${fmtAugmented(aug)}$$`,
      inputType: "scalar",
      answer: sol[0],
      steps: [
        `Form the augmented matrix shown.`,
        `Apply Gauss-Jordan elimination.`,
        `Reading off RREF gives $x_1 = ${sol[0]},\\ x_2 = ${sol[1]}$.`,
      ],
      commonMistake: "Stopping at row-echelon form instead of reduced row-echelon form.",
      conceptTag: "solve-2x2",
      timeLimitSec: 60,
    };
  }

  if (difficulty === "medium") {
    // 3x3 system, ask for full solution vector
    const { aug, sol } = buildUniqueSystem(3, 3, 4);
    return {
      id: makeId("rref-m"),
      topic: "rref",
      difficulty,
      prompt: `Solve the system. Enter $\\mathbf{x} = (x_1, x_2, x_3)$.\n\n$$${fmtAugmented(aug)}$$`,
      inputType: "vector",
      answer: sol,
      steps: [
        `Augmented matrix is shown.`,
        `Reduce via row operations to RREF.`,
        `RREF identity block on left $\\Rightarrow$ unique solution $(${sol.join(", ")})$.`,
      ],
      commonMistake: "Sign errors when scaling a pivot row before eliminating others.",
      conceptTag: "solve-3x3",
      timeLimitSec: 100,
    };
  }

  // hard: rank question on a 3x4 matrix that may be rank-deficient
  const A: Mat = Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => randInt(-3, 3)),
  );
  // Force rank deficiency 50% of the time by making row 3 a combination
  if (Math.random() < 0.5) {
    const a = randNonZero(-2, 2);
    const b = randNonZero(-2, 2);
    A[2] = A[0].map((v, i) => a * v + b * A[1][i]);
  }
  const r = rank(A);
  const reduced = rref(A);
  return {
    id: makeId("rref-h"),
    topic: "rref",
    difficulty: "hard",
    prompt: `Find the rank of the matrix.\n\n$$A = ${fmtMatrix(A)}$$`,
    inputType: "scalar",
    answer: r,
    steps: [
      `Reduce $A$ to RREF: $${fmtMatrix(reduced)}$`,
      `Count nonzero rows of the RREF.`,
      `$\\text{rank}(A) = ${r}$.`,
    ],
    commonMistake: "Counting columns of leading entries on the original matrix instead of the RREF.",
    conceptTag: "rank",
    timeLimitSec: 90,
  };
}
