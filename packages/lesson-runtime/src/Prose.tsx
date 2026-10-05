// Copyright © 2026 Chris Snow

// Markdown prose, rendered the same way everywhere: GitHub tables and lists, maths through KaTeX.
// The app imports KaTeX's stylesheet once; this component only produces the markup.

import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const REMARK = [remarkGfm, remarkMath];
const REHYPE = [rehypeKatex];

export function Prose({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={className ? `prose ${className}` : "prose"}>
      <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE}>
        {markdown}
      </Markdown>
    </div>
  );
}
