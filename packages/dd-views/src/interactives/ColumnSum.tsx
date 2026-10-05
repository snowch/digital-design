// Copyright © 2026 Chris Snow

// Two words added as a person adds on paper: the words in columns, the sum under a rule, and each
// carry written small above the column it goes into, with an arrow from the column it came from.
// The carries and the sum are the model's (dd-model: columnSum); the drawing only places them.

import { useMemo } from "react";
import { z } from "zod";

import { columnSum, parseBits } from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { withProps } from "./props";

const Props = z
  .object({
    a: z.string().regex(/^[01 ]+$/),
    b: z.string().regex(/^[01 ]+$/),
    labels: z.object({
      /** Beside the row of carries. */
      carries: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
    }),
  })
  .refine((p) => parseBits(p.a).length === parseBits(p.b).length, {
    message: "the two words must be the same width",
  });
type Data = z.infer<typeof Props>;

const CHAR = 7.2;
const COL = 28;
const PAD = 8;
/** The baselines of the rows, top to bottom, and the height of the band the arcs cross. */
const Y_CARRY = 24;
const Y_ARC = 44;
const ARC_RISE = 16;
const Y_A = 68;
const Y_B = 96;
const Y_RULE = 106;
const Y_SUM = 130;

export const ColumnSum = withProps(
  Props,
  function ColumnSum({ data, interactive }: InteractiveProps & { data: Data }) {
    const a = useMemo(() => parseBits(data.a), [data.a]);
    const b = useMemo(() => parseBits(data.b), [data.b]);
    const { carries, sum } = useMemo(() => columnSum(a, b), [a, b]);
    const n = a.length;
    const carryOut = carries[n] === 1;
    // Column i is i places from the right; the carry-out column is drawn only when it has a 1.
    const columns = n + (carryOut ? 1 : 0);
    const left = PAD + Math.ceil(data.labels.carries.length * CHAR) + 12;
    const x = (i: number) => left + (columns - 1 - i) * COL + COL / 2;
    const width = left + columns * COL + PAD;
    const height = Y_SUM + 12;
    const digits = (bits: readonly number[], yy: number, cls: string) =>
      bits.map((bit, k) => (
        <text key={k} className={cls} x={x(bits.length - 1 - k)} y={yy} textAnchor="middle">
          {bit}
        </text>
      ));

    return (
      <div className="column-sum-figure" data-interactive={interactive.id}>
        <svg
          className="column-sum"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${data.labels.title}. ${data.labels.summary}`}
          data-sum={sum.join("")}
          data-carries={[...carries].reverse().join("")}
        >
          <text className="row-name" x={PAD} y={Y_CARRY}>
            {data.labels.carries}
          </text>
          {carries.map((c, i) => {
            if (c !== 1 || i === 0) return null;
            // An arc from just above the column that made the carry to just above the one it
            // goes into, under the carry's digit; its head points along the arc's end.
            const from = x(i - 1) - 3;
            const to = x(i) + 3;
            const control = { x: (x(i - 1) + x(i)) / 2, y: Y_ARC - ARC_RISE };
            const dx = to - control.x;
            const dy = Y_ARC - control.y;
            const len = Math.hypot(dx, dy);
            const [ux, uy] = [dx / len, dy / len];
            const back = { x: to - 7 * ux, y: Y_ARC - 7 * uy };
            const head = `${to},${Y_ARC} ${back.x - 3.5 * uy},${back.y + 3.5 * ux} ${back.x + 3.5 * uy},${back.y - 3.5 * ux}`;
            return (
              <g key={i} className="carry" data-column={i}>
                <text className="carry-digit" x={x(i)} y={Y_CARRY} textAnchor="middle">
                  1
                </text>
                <path
                  className="carry-arrow"
                  d={`M ${from} ${Y_ARC} Q ${control.x} ${control.y} ${back.x} ${back.y}`}
                />
                <polygon className="carry-head" points={head} />
              </g>
            );
          })}
          {digits(a, Y_A, "digit")}
          <text
            className="digit operator"
            x={x(columns - 1) - COL / 2 - 6}
            y={Y_B}
            textAnchor="end"
          >
            +
          </text>
          {digits(b, Y_B, "digit")}
          <line
            className="rule"
            x1={x(columns - 1) - COL / 2}
            x2={x(0) + COL / 2}
            y1={Y_RULE}
            y2={Y_RULE}
          />
          {digits(carryOut ? sum : sum.slice(1), Y_SUM, "digit sum-digit")}
        </svg>
      </div>
    );
  },
);
