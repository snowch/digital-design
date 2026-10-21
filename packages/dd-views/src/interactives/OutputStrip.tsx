// Copyright © 2026 Christopher Snow

// Module 0: the eight lowest wires of the part that adds, each with its worth above it. The
// machine is paused before instruction 3; the part that adds has already worked out its answer
// and holds it on 64 wires. This figure shows the eight of least worth, so a learner can read
// which wires give 1 before any circuit is opened: the values come from the simulator's own
// wires (`sliceNet`), hidden until the learner commits to a prediction, and the wires that give
// 1 are marked once they do. The 56 wires of higher worth are named, not drawn.

import { useMemo } from "react";

import { sliceDigits } from "@dd/dd-model";
import type { Simulator } from "@dd/sim";

import { format, useViewStrings } from "../strings";

/** The worth of each of the eight wires, the highest first. */
const WORTHS = [128, 64, 32, 16, 8, 4, 2, 1] as const;

export function OutputStrip({ sim, shown }: { sim: Simulator; shown: boolean }) {
  const strings = useViewStrings();
  const t = strings.meet.strip;
  const digits = useMemo(() => sliceDigits(sim, 8), [sim]);
  const ones = useMemo(
    () =>
      WORTHS.filter((_, k) => digits[WORTHS.length - 1 - k] === "1")
        .map(String)
        .join(" and "),
    [digits],
  );
  return (
    <figure className="output-strip">
      <figcaption>{t.caption}</figcaption>
      <table className="strip-table">
        <thead>
          <tr>
            <th scope="row">{t.worthHeading}</th>
            {WORTHS.map((w) => (
              <th key={w} scope="col">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{t.wireHeading}</th>
            {WORTHS.map((w, k) => {
              const on = digits[WORTHS.length - 1 - k] === "1";
              return (
                <td key={w} className={shown ? (on ? "strip-one" : "strip-zero") : undefined}>
                  {shown ? digits[WORTHS.length - 1 - k] : t.hidden}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      {shown && <p role="status">{ones ? format(t.ones, { worths: ones }) : ""}</p>}
      {shown && <p>{t.higher}</p>}
    </figure>
  );
}
