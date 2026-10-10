// Copyright © 2026 Christopher Snow

// Markdown prose, rendered the same way everywhere: GitHub tables and lists, maths through
// KaTeX. The app imports KaTeX's stylesheet once; this component only produces the markup. A
// course that draws its own inline code (a mark before a name, say) supplies `code`; the
// platform renders the same words either way. `inline` renders one line inside another element,
// such as an objective in its list: no paragraph, so the line keeps the element's own layout.
import type { ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useStrings } from "./StringsContext";

const REMARK = [remarkGfm, remarkMath];
const REHYPE = [rehypeKatex];

export function Prose({
  markdown,
  className,
  inline = false,
}: {
  markdown: string;
  className?: string;
  inline?: boolean;
}) {
  const strings = useStrings();
  const components = {
    ...(strings.code ? { code: strings.code } : {}),
    ...(inline ? { p: ({ children }: { children?: ReactNode }) => <>{children}</> } : {}),
  } as Components;
  const markup = (
    <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={components}>
      {markdown}
    </Markdown>
  );
  return inline ? (
    <span className={className ? `prose-inline ${className}` : "prose-inline"}>{markup}</span>
  ) : (
    <div className={className ? `prose ${className}` : "prose"}>{markup}</div>
  );
}
