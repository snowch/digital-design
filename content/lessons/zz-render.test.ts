// Copyright © 2026 Christopher Snow

import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { LESSONS } from "./index";
it("render", () => {
  const id = process.env.LESSON!;
  const l = LESSONS.find((x) => x.id === id)!;
  const out: string[] = [`# ${l.title}`, ...l.objectives.map((o) => `- ${o}`)];
  for (const s of l.sections) {
    out.push(`\n## ${s.title} (${s.kind})\n`, s.prose);
    for (const x of s.interactives) {
      out.push(`\n[figure ${x.kind}: ${x.caption}]`);
      if (x.lead) out.push(`LEAD: ${x.lead}`);
      const p = x.props as Record<string, unknown>;
      for (const k of ["question", "explain", "outcomes"])
        if (typeof p[k] === "string") out.push(`${k.toUpperCase()}: ${p[k]}`);
      if (Array.isArray(p.options))
        out.push(`OPTIONS: ${(p.options as { label: string }[]).map((o) => o.label).join(" | ")}`);
      if (Array.isArray(p.faults))
        for (const f of p.faults as { label: string; outcome?: string }[])
          out.push(`FAULT ${f.label}: ${f.outcome ?? ""}`);
      if (x.kind === "challenge") {
        const c = l.challenges.find((c) => c.id === (p.challengeId as string))!;
        out.push(
          `CHALLENGE ${c.title}\n${c.task}`,
          ...c.fields.map((f) => `FIELD ${f.label}`),
          ...c.hints.map((h, i) => `HINT ${i + 1}: ${h}`),
        );
      }
    }
  }
  out.push(`\n## Model vs reality\n${l.modelVsReality}`);
  writeFileSync(
    `/tmp/claude-0/-home-user-digital-design/30a517c2-c20e-5ad7-a63a-a0cceb68b01c/scratchpad/${id}.md`,
    out.join("\n"),
  );
});
