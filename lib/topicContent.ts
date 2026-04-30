import type { Topic } from "./topics";

export type TopicContent = {
  /** Short paragraph: what is this and why it matters. May contain inline `$…$` math. */
  blurb: string;
  /** High-yield formulas. `body` is a LaTeX string (no delimiters — rendered in display mode). */
  formulas: Array<{ label: string; body: string }>;
  /** One worked example. `title` and each `step` may mix prose with `$…$` inline math. */
  example: { title: string; steps: string[] };
  /** Common mistake to watch for. Plain prose. */
  pitfall: string;
};

export const TOPIC_CONTENT: Record<Topic, TopicContent> = {
  rref: {
    blurb:
      "Reduced row echelon form is the canonical \"simplest\" version of a matrix under row operations. Row reduction lets you read off solutions to $Ax = b$, the rank, and which columns are pivot columns.",
    formulas: [
      {
        label: "Rank from RREF",
        body: "\\text{rank}(A) = \\#\\text{ pivots in }\\mathrm{RREF}(A)",
      },
      {
        label: "Rank–nullity",
        body: "\\dim\\mathrm{Nul}(A) \\;=\\; n - \\text{rank}(A) \\qquad (n = \\#\\text{ cols})",
      },
      {
        label: "Free vs pivot variables",
        body: "\\text{free vars} = \\text{columns without a pivot}",
      },
    ],
    example: {
      title:
        "Reduce $A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 2 & 4 & 7 \\end{bmatrix}$",
      steps: [
        "$R_2 \\leftarrow R_2 - 2R_1$ gives $\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 0 & 1 \\end{bmatrix}$",
        "$R_1 \\leftarrow R_1 - 3R_2$ gives $\\begin{bmatrix} 1 & 2 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$",
        "Pivots in cols 1 and 3 → $\\text{rank}(A) = 2$; col 2 has no pivot, so $x_2$ is free.",
      ],
    },
    pitfall:
      "Stopping at row-echelon form (REF) instead of reduced row-echelon form (RREF). RREF requires you to also clear the column ABOVE each pivot.",
  },

  independence: {
    blurb:
      "A set of vectors is linearly independent if no vector is a combination of the others. Equivalently, the only solution to $c_1 v_1 + \\cdots + c_k v_k = 0$ is $c_1 = \\cdots = c_k = 0$.",
    formulas: [
      {
        label: "Independence test",
        body: "\\{v_1,\\ldots,v_k\\}\\ \\text{indep.} \\iff [\\,v_1\\,|\\,\\cdots\\,|\\,v_k\\,]\\ \\text{has trivial null space}",
      },
      {
        label: "Span",
        body: "\\mathrm{Span}(S) = \\{\\, c_1 v_1 + \\cdots + c_k v_k \\;:\\; c_i \\in \\mathbb{R} \\,\\}",
      },
      {
        label: "Quick dependence shortcut",
        body: "k > n \\;\\Longrightarrow\\; v_1,\\ldots,v_k \\in \\mathbb{R}^n\\ \\text{are dependent}",
      },
    ],
    example: {
      title: "Are $v_1 = (1, 2)$ and $v_2 = (2, 4)$ independent?",
      steps: [
        "Solve $c_1 \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix} + c_2 \\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix} = \\mathbf{0}$",
        "Both equations reduce to $c_1 + 2c_2 = 0$, i.e. $c_1 = -2c_2$ (one free parameter).",
        "Non-trivial solution exists → DEPENDENT.",
      ],
    },
    pitfall:
      "Confusing \"spans\" with \"is a basis for\". Span doesn't require independence — a redundant set still spans, it's just bigger than it needs to be.",
  },

  basis: {
    blurb:
      "A basis is a linearly independent spanning set. Every vector in the space has a UNIQUE representation as a linear combination of basis vectors. The dimension is the size of any basis.",
    formulas: [
      {
        label: "Dimension",
        body: "\\dim V = |B|\\ \\text{for any basis } B \\text{ of } V",
      },
      {
        label: "Standard basis of $\\mathbb{R}^n$",
        body: "\\{\\, e_1,\\, e_2,\\, \\ldots,\\, e_n \\,\\} \\quad\\text{where } e_i \\text{ has a 1 in slot } i",
      },
      {
        label: "Column / null space dimensions",
        body: "\\dim\\mathrm{Col}(A) = \\text{rank}(A) \\qquad \\dim\\mathrm{Nul}(A) = n - \\text{rank}(A)",
      },
    ],
    example: {
      title:
        "Find a basis for $\\mathrm{Col}(A)$ where $A = \\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\\\ 3 & 6 \\end{bmatrix}$",
      steps: [
        "Each column is a multiple of $(1, 2, 3)^\\top$ — col 2 $= 2 \\cdot$ col 1.",
        "RREF identifies col 1 as the only pivot column.",
        "Basis: $\\left\\{\\, \\begin{pmatrix} 1 \\\\ 2 \\\\ 3 \\end{pmatrix} \\right\\}$, so $\\dim\\mathrm{Col}(A) = 1$.",
      ],
    },
    pitfall:
      "Using ROW vectors of $A$ as a basis for $\\mathrm{Col}(A)$. Col is the span of COLUMNS — pick the original columns matching pivot positions in RREF.",
  },

  eigen: {
    blurb:
      "$\\lambda$ is an eigenvalue of $A$ if $A v = \\lambda v$ for some nonzero $v$. The vector $v$ is the eigenvector — a direction that $A$ only stretches or flips, never rotates off-axis.",
    formulas: [
      {
        label: "Characteristic equation",
        body: "\\det(A - \\lambda I) = 0",
      },
      {
        label: "$2\\times 2$ shortcut",
        body: "\\lambda^2 - \\text{tr}(A)\\,\\lambda + \\det(A) = 0",
      },
      {
        label: "Sum and product of eigenvalues",
        body: "\\sum_i \\lambda_i = \\text{tr}(A) \\qquad \\prod_i \\lambda_i = \\det(A)",
      },
      {
        label: "Triangular shortcut",
        body: "A\\ \\text{triangular} \\;\\Longrightarrow\\; \\text{eigenvalues are the diagonal entries}",
      },
    ],
    example: {
      title:
        "Find eigenvalues of $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 3 \\end{bmatrix}$",
      steps: [
        "$A$ is upper triangular → $\\lambda \\in \\{2,\\,3\\}$.",
        "$\\lambda = 2$: solve $(A - 2I)\\,v = 0 \\Rightarrow v = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$.",
        "$\\lambda = 3$: solve $(A - 3I)\\,v = 0 \\Rightarrow v = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$.",
      ],
    },
    pitfall:
      "Solving $(A - \\lambda I)v = 0$ with the WRONG $\\lambda$ and getting $v = 0$. If your eigenvector is the zero vector, you've made an arithmetic mistake or used a non-eigenvalue.",
  },

  orthogonality: {
    blurb:
      "Two vectors are orthogonal if $u \\cdot v = 0$. Projections decompose a vector into a component along a direction plus a component perpendicular to it. Orthogonality makes a lot of linear algebra easier.",
    formulas: [
      {
        label: "Dot product",
        body: "u \\cdot v = u^\\top v = u_1 v_1 + u_2 v_2 + \\cdots + u_n v_n",
      },
      {
        label: "Projection of $u$ onto $v$",
        body: "\\mathrm{proj}_v(u) = \\frac{u \\cdot v}{v \\cdot v}\\, v",
      },
      {
        label: "Orthogonal complement",
        body: "\\dim W + \\dim W^{\\perp} = n \\qquad W \\cap W^{\\perp} = \\{0\\}",
      },
      {
        label: "Orthogonal matrix",
        body: "Q^{\\top} Q = I \\iff Q^{-1} = Q^{\\top}",
      },
    ],
    example: {
      title: "Project $u = (3, 4)$ onto $v = (1, 0)$",
      steps: [
        "$u \\cdot v = 3 \\cdot 1 + 4 \\cdot 0 = 3$",
        "$v \\cdot v = 1 \\cdot 1 + 0 \\cdot 0 = 1$",
        "$\\mathrm{proj}_v(u) = \\dfrac{3}{1}\\,(1, 0) = (3, 0)$",
      ],
    },
    pitfall:
      "Confusing orthogonal (perpendicular) with orthonormal (perpendicular AND unit length). Always check whether you need to normalize.",
  },

  leastSquares: {
    blurb:
      "When $Ax = b$ has no exact solution (overdetermined), the least-squares solution minimizes $\\|Ax - b\\|$. Geometrically: project $b$ onto $\\mathrm{Col}(A)$ — the closest reachable point.",
    formulas: [
      {
        label: "Normal equations",
        body: "A^{\\top} A\\,\\hat{x} = A^{\\top} b",
      },
      {
        label: "Closed form",
        body: "\\hat{x} = (A^{\\top} A)^{-1} A^{\\top} b \\quad \\text{(when } A^{\\top} A \\text{ is invertible)}",
      },
      {
        label: "Residual is orthogonal to $\\mathrm{Col}(A)$",
        body: "(b - A\\hat{x}) \\perp \\mathrm{Col}(A) \\iff A^{\\top}(b - A\\hat{x}) = 0",
      },
    ],
    example: {
      title: "Best fit $y = mx$ through $(1, 1)$ and $(2, 3)$",
      steps: [
        "$A = \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}, \\quad b = \\begin{pmatrix} 1 \\\\ 3 \\end{pmatrix}$",
        "$A^{\\top} A = 1^2 + 2^2 = 5, \\qquad A^{\\top} b = 1 \\cdot 1 + 2 \\cdot 3 = 7$",
        "$\\hat{x} = m = \\dfrac{7}{5} = 1.4$",
      ],
    },
    pitfall:
      "Forgetting to check that $A^\\top A$ is invertible. It is, if and only if $A$ has linearly independent COLUMNS.",
  },

  matrixOps: {
    blurb:
      "Matrices act on vectors via multiplication: $(AB)v = A(Bv)$. The inverse $A^{-1}$ reverses $A$'s action so that $A^{-1} A = I$. Singular matrices ($\\det = 0$) collapse a dimension and have no inverse.",
    formulas: [
      {
        label: "$2\\times 2$ inverse",
        body: "A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\;\\Longrightarrow\\; A^{-1} = \\frac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}",
      },
      {
        label: "Determinant of a product",
        body: "\\det(AB) = \\det(A)\\,\\det(B)",
      },
      {
        label: "Inverse of a product (order flips!)",
        body: "(AB)^{-1} = B^{-1} A^{-1}",
      },
      {
        label: "Transpose of a product (order flips!)",
        body: "(AB)^{\\top} = B^{\\top} A^{\\top}",
      },
    ],
    example: {
      title:
        "Invert $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 3 \\end{bmatrix}$",
      steps: [
        "$\\det(A) = 2 \\cdot 3 - 1 \\cdot 1 = 5$",
        "$A^{-1} = \\dfrac{1}{5}\\begin{bmatrix} 3 & -1 \\\\ -1 & 2 \\end{bmatrix}$",
        "Check: $A \\cdot A^{-1} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}\\;\\checkmark$",
      ],
    },
    pitfall:
      "Assuming $AB = BA$. Matrix multiplication is NOT commutative — order matters everywhere, especially in $(AB)^{-1}$ and $(AB)^{\\top}$.",
  },
};
