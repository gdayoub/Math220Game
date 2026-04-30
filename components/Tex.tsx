"use client";
import katex from "katex";
import { useMemo } from "react";

/** Render a string that may contain inline ($..$) and block ($$..$$) math. */
export function Tex({ children }: { children: string }) {
  const html = useMemo(() => renderMixed(children), [children]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderMixed(input: string): string {
  // Handle $$ blocks first, then $ inline
  let s = input;
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: true, throwOnError: false });
    } catch {
      return _m;
    }
  });
  s = s.replace(/\$([^$\n]+?)\$/g, (_m, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: false, throwOnError: false });
    } catch {
      return _m;
    }
  });
  // Convert line breaks to <br/>
  return s.replace(/\n/g, "<br/>");
}
