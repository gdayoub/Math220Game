export type Mat = number[][];

export type RrefStep =
  | { kind: "swap"; i: number; j: number; before: Mat; after: Mat; latex: string; description: string }
  | { kind: "scale"; i: number; k: number; before: Mat; after: Mat; latex: string; description: string }
  | { kind: "add"; i: number; j: number; k: number; before: Mat; after: Mat; latex: string; description: string };

function clone(M: Mat): Mat {
  return M.map((r) => r.slice());
}

function clean(x: number): number {
  if (Math.abs(x) < 1e-9) return 0;
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return r;
  return Number(x.toFixed(6));
}

function fmtK(k: number): string {
  if (k === 1) return "";
  if (k === -1) return "-";
  if (Math.abs(k - Math.round(k)) < 1e-9) return String(Math.round(k));
  for (const den of [2, 3, 4, 5, 6, 8]) {
    const n = k * den;
    if (Math.abs(n - Math.round(n)) < 1e-6) {
      return `\\tfrac{${Math.round(n)}}{${den}}`;
    }
  }
  return k.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

/** RREF with elementary-row-op recording. Caps at 50 steps. */
export function rrefWithSteps(rows: Mat): { final: Mat; steps: RrefStep[] } {
  const M: Mat = clone(rows);
  const steps: RrefStep[] = [];
  const m = M.length;
  if (m === 0) return { final: M, steps };
  const n = M[0].length;
  let lead = 0;

  const push = (s: RrefStep) => {
    if (steps.length < 50) steps.push(s);
  };

  for (let r = 0; r < m; r++) {
    if (lead >= n) break;
    let i = r;
    while (i < m && Math.abs(M[i][lead]) < 1e-10) i++;
    if (i === m) {
      lead++;
      r--;
      continue;
    }
    if (i !== r) {
      const before = clone(M);
      [M[i], M[r]] = [M[r], M[i]];
      push({
        kind: "swap",
        i: r,
        j: i,
        before,
        after: clone(M),
        latex: `R_{${r + 1}} \\leftrightarrow R_{${i + 1}}`,
        description: `Swap row ${r + 1} with row ${i + 1}`,
      });
    }
    const lv = M[r][lead];
    if (Math.abs(lv - 1) > 1e-10) {
      const before = clone(M);
      const k = 1 / lv;
      for (let j = 0; j < n; j++) M[r][j] = clean(M[r][j] / lv);
      push({
        kind: "scale",
        i: r,
        k,
        before,
        after: clone(M),
        latex: `R_{${r + 1}} \\leftarrow ${fmtK(k) || ""}R_{${r + 1}}`,
        description: `Scale row ${r + 1} so its pivot becomes 1`,
      });
    }
    for (let k = 0; k < m; k++) {
      if (k !== r) {
        const lv2 = M[k][lead];
        if (Math.abs(lv2) > 1e-10) {
          const before = clone(M);
          for (let j = 0; j < n; j++) M[k][j] = clean(M[k][j] - lv2 * M[r][j]);
          const sign = lv2 > 0 ? "-" : "+";
          const mag = Math.abs(lv2);
          const coeff = fmtK(mag);
          push({
            kind: "add",
            i: k,
            j: r,
            k: -lv2,
            before,
            after: clone(M),
            latex: `R_{${k + 1}} \\leftarrow R_{${k + 1}} ${sign} ${coeff}R_{${r + 1}}`,
            description: `Eliminate column ${lead + 1} in row ${k + 1}`,
          });
        }
      }
    }
    lead++;
  }
  return { final: M, steps };
}
