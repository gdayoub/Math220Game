import type { Question, Difficulty } from "../topics";
import { fmtVector, randInt, randNonZero, type Vec } from "../matrixMath";

function id(p: string) { return `${p}-${Math.random().toString(36).slice(2, 10)}`; }

function dot(a: Vec, b: Vec): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

export function generateOrthogonality(difficulty: Difficulty): Question {
  if (difficulty === "easy") {
    // Are these two vectors orthogonal?
    const u = [randNonZero(-3, 3), randInt(-3, 3), randInt(-3, 3)];
    const force = Math.random() < 0.5;
    let v: Vec;
    if (force) {
      // Build orthogonal: pick v = ((-u_2), u_1, 0) typically
      v = [-u[1], u[0], 0];
      if (v.every((x) => x === 0)) v = [0, -u[2], u[1]];
    } else {
      v = [randInt(-3, 3), randInt(-3, 3), randNonZero(-3, 3)];
    }
    const orth = dot(u, v) === 0;
    return {
      id: id("orth-e"),
      topic: "orthogonality",
      difficulty,
      prompt: `Are $\\mathbf{u} = ${fmtVector(u)}$ and $\\mathbf{v} = ${fmtVector(v)}$ orthogonal?`,
      inputType: "boolean",
      answer: orth,
      steps: [
        `Two vectors are orthogonal iff $\\mathbf{u}\\cdot\\mathbf{v} = 0$.`,
        `$\\mathbf{u}\\cdot\\mathbf{v} = ${u[0]}\\cdot${v[0]} + ${u[1]}\\cdot${v[1]} + ${u[2]}\\cdot${v[2]} = ${dot(u, v)}$.`,
      ],
      commonMistake: "Confusing orthogonal with parallel, or forgetting to sum all coordinate products.",
      conceptTag: "orth-check",
      timeLimitSec: 40,
    };
  }

  if (difficulty === "medium") {
    // Project u onto v: proj_v(u) = ((u . v)/(v . v)) v
    const v = [randNonZero(-3, 3), randNonZero(-3, 3)];
    const u = [randInt(-4, 4), randInt(-4, 4)];
    const k = dot(u, v) / dot(v, v);
    const proj = v.map((x) => k * x);
    return {
      id: id("orth-m"),
      topic: "orthogonality",
      difficulty,
      prompt: `Compute $\\text{proj}_{\\mathbf{v}}\\mathbf{u}$ where $\\mathbf{u} = ${fmtVector(u)}$, $\\mathbf{v} = ${fmtVector(v)}$. Enter as $(x, y)$.`,
      inputType: "vector",
      answer: proj,
      steps: [
        `$\\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u}\\cdot\\mathbf{v}}{\\mathbf{v}\\cdot\\mathbf{v}}\\,\\mathbf{v}$.`,
        `$\\mathbf{u}\\cdot\\mathbf{v} = ${dot(u, v)}$, $\\mathbf{v}\\cdot\\mathbf{v} = ${dot(v, v)}$.`,
        `Scalar = $\\frac{${dot(u, v)}}{${dot(v, v)}}$, projection = $(${proj[0]}, ${proj[1]})$.`,
      ],
      commonMistake: "Dividing by $\\|\\mathbf{v}\\|$ instead of $\\mathbf{v}\\cdot\\mathbf{v}$.",
      conceptTag: "projection",
      timeLimitSec: 90,
    };
  }

  // hard: orthogonal complement dimension question
  const v = [randNonZero(-3, 3), randInt(-3, 3), randInt(-3, 3)];
  // dim(W^perp) where W = span{v} in R^3 → answer is 2
  return {
    id: id("orth-h"),
    topic: "orthogonality",
    difficulty: "hard",
    prompt: `Let $W = \\text{span}\\{${fmtVector(v)}\\} \\subset \\mathbb{R}^3$. Find $\\dim(W^{\\perp})$.`,
    inputType: "scalar",
    answer: 2,
    steps: [
      `For a subspace $W \\subset \\mathbb{R}^n$: $\\dim(W) + \\dim(W^{\\perp}) = n$.`,
      `Here $\\dim(W) = 1$ (one nonzero vector spans a line) and $n = 3$.`,
      `$\\Rightarrow \\dim(W^{\\perp}) = 2$.`,
    ],
    commonMistake: "Computing the orthogonal complement by hand instead of using the dimension theorem.",
    conceptTag: "orth-complement-dim",
    timeLimitSec: 70,
  };
}
