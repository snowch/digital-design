// Copyright © 2026 Christopher Snow

// Module 13's lab, drawn: the joins a text of the whole machine makes between the course's nine
// parts, read from the text alone (`labJoins`), so it follows the text as it changes, and draws a
// text that does not yet elaborate, its open ports showing what is left. A map places the parts in
// the three blocks of lesson 1's drawing: the control unit, the datapath and the memory port; each
// part is a button that shows its joins. A part's joins are drawn as wires: from what feeds each
// input port (another part's output, one of the machine's inputs, a constant, the text's own
// logic) and from each output port to what reads it. A port the text leaves unjoined is drawn
// open. Nothing is compared with the course's text: the drawing shows what the learner wrote. A
// figure may mark the ports a changed line feeds.

import { useState } from "react";

import { labJoins, type JoinPart, type JoinReader, type JoinSource } from "@dd/hdl";

import { format, useViewStrings } from "../strings";

/** The three blocks of lesson 1's drawing, and the parts in each, as that drawing places them. */
const BLOCKS: readonly (readonly [string, readonly string[]])[] = [
  ["control", ["decoder", "system", "controller", "traplogic"]],
  ["datapath", ["registers", "alu", "condition", "cregs"]],
  ["port", ["memory"]],
];

/** A label that may break after a part's name, `controller.` / `FETCHING`, on a narrow screen. */
const breakable = (s: string) =>
  s.split(/(?<=\.)/).flatMap((piece, k) => (k ? [<wbr key={k} />, piece] : [piece]));

function PartJoins({
  part,
  marked,
  partName,
}: {
  part: JoinPart;
  marked: (port: string, written: string) => boolean;
  partName: (instance: string) => string;
}) {
  const t = useViewStrings().machine13;
  const sourceText = (s: JoinSource) =>
    s.kind === "part"
      ? `${partName(s.part)}.${s.port}`
      : s.kind === "input"
        ? format(t.joinsInput, { name: s.name })
        : s.kind === "constant"
          ? s.text
          : s.kind === "text"
            ? format(t.joinsText, { text: s.text })
            : t.joinsOpen;
  const readerText = (r: JoinReader) =>
    r.kind === "part" ? `${partName(r.part)}.${r.port}` : format(t.joinsOutput, { name: r.name });
  const row = (
    key: string,
    mark: boolean,
    open: boolean,
    left: string,
    port: string,
    right: string,
    out: boolean,
  ) => (
    <li
      key={key}
      className={`lab-joins-row${out ? " lab-joins-out" : " lab-joins-in"}${mark ? " lab-joins-marked" : ""}${open ? " lab-joins-open" : ""}`}
    >
      <span className="lab-joins-far" title={left}>
        {breakable(left)}
      </span>
      <span className="lab-joins-wire" aria-hidden="true" />
      <span className="lab-joins-port">{port}</span>
      <span className="lab-joins-wire" aria-hidden="true" />
      <span className="lab-joins-far" title={right}>
        {breakable(right)}
      </span>
    </li>
  );
  return (
    <figure className="lab-joins-part" aria-label={format(t.joinsPartLabel, { part: part.module })}>
      <figcaption className="lab-joins-title">
        <code>{part.module}</code>
      </figcaption>
      <ul className="lab-joins-rows">
        {part.inputs.map((p) =>
          row(
            `in-${p.port}`,
            marked(p.port, p.written),
            p.source.kind === "open",
            sourceText(p.source),
            p.port,
            "",
            false,
          ),
        )}
        {part.outputs.map((p) => {
          const open = p.written === "";
          const read = p.readers.map(readerText);
          if (p.readByText) read.push(t.joinsReadByText);
          return row(
            `out-${p.port}`,
            marked(p.port, p.written),
            open,
            "",
            p.port,
            open ? t.joinsOpen : read.length ? read.join(", ") : t.joinsUnread,
            true,
          );
        })}
      </ul>
    </figure>
  );
}

const NO_MARK = () => false;

/** The part a run's sentence names, by what differs: the part that holds that value, if any. */
export function partNamed(what: string | undefined, halts: boolean): string | undefined {
  if (what === undefined) return undefined;
  if (what === "stop") return halts ? "traplogic" : undefined;
  if (/^R\d+$/.test(what)) return "registers";
  if (/^C[0-4]$/.test(what)) return "cregs";
  if (["timer", "waiting", "display", "lamps"].includes(what) || what.startsWith("byte"))
    return "memory";
  return undefined;
}

/**
 * The joins of a text of the whole machine: a map of the nine parts, and one part's joins drawn.
 * `mapOnly` (a figure that runs the course's text) draws the map alone, no port's join, and marks
 * `marked`, the part a run's sentence names, once there has been a run.
 */
export function LabJoins({
  text,
  mapOnly = false,
  marked,
}: {
  text: string;
  mapOnly?: boolean;
  marked?: string;
}) {
  const t = useViewStrings().machine13;
  const joins = labJoins(text);
  const [chosen, setChosen] = useState<string>("traplogic");
  if (joins.problem)
    return (
      <p className="lab-joins-none" role="note">
        {format(t.joinsNone, { problem: joins.problem })}
      </p>
    );
  const byModule = new Map(joins.parts.map((p) => [p.module, p]));
  const partName = (instance: string) =>
    joins.parts.find((p) => p.name === instance)?.module ?? instance;
  const part = mapOnly ? undefined : (byModule.get(chosen) ?? joins.parts[0]);
  const openCount = (p: JoinPart) =>
    p.inputs.filter((i) => i.source.kind === "open").length +
    p.outputs.filter((o) => o.written === "").length;
  // The parts the chosen part joins to, by the wires the text names at both ends.
  const linked = new Set(
    part
      ? [
          ...part.inputs.flatMap((i) =>
            i.source.kind === "part" ? [partName(i.source.part)] : [],
          ),
          ...part.outputs.flatMap((o) =>
            o.readers.flatMap((r) => (r.kind === "part" ? [partName(r.part)] : [])),
          ),
        ].filter((m) => m !== part.module)
      : [],
  );
  const count = (p: JoinPart | undefined) => {
    const open = p ? openCount(p) : undefined;
    return !p ? t.joinsMissing : open ? format(t.joinsOpenCount, { n: open }) : t.joinsAllJoined;
  };
  return (
    <div className="lab-joins">
      <div className="lab-joins-map" role="group" aria-label={t.joinsMap}>
        {BLOCKS.map(([block, modules]) => (
          <div key={block} className="lab-joins-block">
            <p className="lab-joins-block-name">{t.joinsBlocks[block] ?? block}</p>
            {modules.map((m) => {
              const p = byModule.get(m);
              if (mapOnly)
                return (
                  <div
                    key={m}
                    className={`lab-joins-item${marked === m ? " lab-joins-marked" : ""}`}
                  >
                    <code>{m}</code>
                    <span className="lab-joins-count">{count(p)}</span>
                    {marked === m && <span className="lab-joins-link">{t.joinsRunMark}</span>}
                  </div>
                );
              return (
                <button
                  key={m}
                  type="button"
                  className={`button secondary lab-joins-button${linked.has(m) ? " lab-joins-linked" : ""}`}
                  aria-pressed={part?.module === m}
                  disabled={!p}
                  onClick={() => setChosen(m)}
                >
                  <code>{m}</code>
                  <span className="lab-joins-count">{count(p)}</span>
                  {part && linked.has(m) && (
                    <span className="lab-joins-link">
                      {format(t.joinsLinked, { part: part.module })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {part && <PartJoins part={part} marked={NO_MARK} partName={partName} />}
    </div>
  );
}
