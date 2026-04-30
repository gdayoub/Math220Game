import type { Question, Difficulty } from "../topics";
import { fmtMatrix, randInt, randNonZero, type Mat, det } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

/** Build a 2x2 matrix with given integer eigenvalues l1, l2 and integer eigenvectors. */
function buildDiagonalizable2x2(l1: number, l2: number): { A: Mat; v1: number[]; v2: number[] } {
  // Pick simple eigenvectors
  const candidates = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [-1, 1]];
  let v1 = candidates[randInt(0, candidates.length - 1)];
  let v2 = candidates[randInt(0, candidates.length - 1)];
  // Ensure independent
  while (v1[0] * v2[1] - v1[1] * v2[0] === 0) {
    v2 = candidates[randInt(0, candidates.length - 1)];
  }
  const P: Mat = [
    [v1[0], v2[0]],
    [v1[1], v2[1]],
  ];
  const detP = P[0][0] * P[1][1] - P[0][1] * P[1][0];
  // P^{-1}
  const Pinv: Mat = [
    [P[1][1] / detP, -P[0][1] / detP],
    [-P[1][0] / detP, P[0][0] / detP],
  ];
  // A = P D P^{-1}, with D = diag(l1, l2)
  const PD: Mat = [
    [P[0][0] * l1, P[0][1] * l2],
    [P[1][0] * l1, P[1][1] * l2],
  ];
  const A: Mat = [
    [PD[0][0] * Pinv[0][0] + PD[0][1] * Pinv[1][0], PD[0][0] * Pinv[0][1] + PD[0][1] * Pinv[1][1]],
    [PD[1][0] * Pinv[0][0] + PD[1][1] * Pinv[1][0], PD[1][0] * Pinv[0][1] + PD[1][1] * Pinv[1][1]],
  ];
  // Round (should already be integer if eigenvalues/eigenvectors are integers)
  const Arounded = A.map((r) => r.map((x) => Math.round(x))) as Mat;
  return { A: Arounded, v1, v2 };
}

export function generateEigen(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // Triangular 2x2 — eigenvalues are diagonal entries
    const a = randNonZero(-4, 4), b = randInt(-3, 3), c = randNonZero(-4, 4);
    if (a === c) return generateEigen(difficulty);
    const A: Mat = [[a, b], [0, c]];
    const sorted = [a, c].sort((x, y) => x - y);
    return {
      id: id("eigen-e"),
      topic: "eigen",
      difficulty,
      prompt: `Find both eigenvalues of the triangular matrix. Enter them as a comma-separated list (any order).\n\n$$A = ${fmtMatrix(A)}$$`,
      inputType: "vector",
      answer: sorted,
      steps: [
        `For a triangular matrix, eigenvalues are exactly the diagonal entries.`,
        `Diagonal: $${a}, ${c}$.`,
      ],
      commonMistake: "Computing the characteristic polynomial unnecessarily — read off the diagonal directly.",
      conceptTag: "eigval-triangular",
      timeLimitSec: 50,
    };
  }

  if (difficulty === "medium") {
    // Eigenvalues of a general 2x2
    const l1 = randNonZero(-4, 4);
    let l2 = randNonZero(-4, 4);
    while (l2 === l1) l2 = randNonZero(-4, 4);
    const { A } = buildDiagonalizable2x2(l1, l2);
    const sorted = [l1, l2].sort((x, y) => x - y);
    return {
      id: id("eigen-m"),
      topic: "eigen",
      difficulty,
      prompt: `Find both eigenvalues of $A$. Enter as a comma-separated list (any order).\n\n$$A = ${fmtMatrix(A)}$$`,
      inputType: "vector",
      answer: sorted,
      steps: [
        `Solve $\\det(A - \\lambda I) = 0$.`,
        `Trace $= ${A[0][0] + A[1][1]}$, det $= ${det(A)}$.`,
        `Use $\\lambda^2 - \\text{tr}(A)\\lambda + \\det(A) = 0$.`,
        `Eigenvalues: $${l1}, ${l2}$.`,
      ],
      commonMistake: "Sign errors when expanding the characteristic polynomial.",
      conceptTag: "eigval-2x2",
      timeLimitSec: 90,
    };
  }

  // hard: find an eigenvector for a given eigenvalue
  const l1 = randNonZero(-3, 3);
  let l2 = randNonZero(-3, 3);
  while (l2 === l1) l2 = randNonZero(-3, 3);
  const { A, v1 } = buildDiagonalizable2x2(l1, l2);
  return {
    id: id("eigen-h"),
    topic: "eigen",
    difficulty: "hard",
    prompt: `Find an eigenvector of $A$ corresponding to $\\lambda = ${l1}$.\n\n$$A = ${fmtMatrix(A)}$$\n\nEnter as $(x, y)$. Any nonzero scalar multiple is accepted.`,
    inputType: "vector",
    answer: v1,
    steps: [
      `Form $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ and solve.`,
      `Reduce to find the null space of $A - ${l1}I$.`,
      `One choice: $\\mathbf{v} = (${v1[0]}, ${v1[1]})$ (or any nonzero scalar multiple).`,
    ],
    commonMistake: "Forgetting that any nonzero scalar multiple is also a valid eigenvector.",
    conceptTag: "eigenvec-2x2",
    timeLimitSec: 120,
  };
}
