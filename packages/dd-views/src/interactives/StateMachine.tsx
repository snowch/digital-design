// Module 5: a state machine, running, shown as the chain the course teaches in one figure. The
// state diagram, the encoded table, the circuit (next-state logic, the state register's
// flip-flops, the output logic), the timing trace and the text are views of one simulator. The
// learner sets the inputs, presses "Clock CLK", and every view moves together: the state the
// register holds is marked in the diagram and the table, and so is the row the next edge will
// apply, read from the next-state logic's own output, N, which is what reaches the flip-flops'
// D pins.

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  MACHINE_NETS,
  libraryCircuit,
  machineById,
  machineText,
  rowFor,
  stateOfCode,
  type Machine,
  type MachineRow,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";
import { formatWord, isKnown, type Circuit, type Word } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings, type ViewStrings } from "../strings";
import { TimingDiagram } from "../TimingDiagram";
import { useSettleSim } from "../useSim";
import { withProps } from "./props";
import { Step, runScript } from "./script";

const PANES = ["diagram", "table", "circuit", "trace", "text"] as const;
type Pane = (typeof PANES)[number];

const Props = z.object({
  /** A machine of `MACHINES`; its circuit is the library circuit of the same id. */
  machine: z.string(),
  show: z.array(z.enum(PANES)).default(["diagram", "table", "circuit", "trace"]),
  /** Steps run before the figure first shows, and again at "Start again": a reset, say. */
  prime: z.array(Step).default([]),
  /** The text pane's style: states as codes, or as an enumerated type. */
  textStyle: z.enum(["codes", "enum"]).default("codes"),
});

type Inputs = Record<string, 0 | 1>;

/** A row's condition as the diagram and the table write it: `OK 0, FAIL 1`. */
export function conditionText(m: Machine, row: MachineRow, strings: ViewStrings): string[] {
  const parts = m.inputs
    .filter((i) => row.when[i] !== undefined)
    .map((i) => format(strings.machine.literal, { name: i, value: row.when[i] as number }));
  return parts.length ? parts : [strings.machine.always];
}

/** The state a word names, or undefined for a code no state has (or an unknown word). */
function stateOf(m: Machine, value: Word | undefined) {
  return value && isKnown(value) ? stateOfCode(m, formatWord(value)) : undefined;
}

const BOX_H = 44;
const boxW = (name: string) => Math.max(76, name.length * 9 + 22);

interface Arrow {
  readonly from: string;
  readonly to: string;
  readonly rows: readonly number[];
}

/** The rows grouped into one arrow per pair of states, in the table's order. */
function arrowsOf(m: Machine): Arrow[] {
  const out: Arrow[] = [];
  m.rows.forEach((r, i) => {
    const a = out.find((x) => x.from === r.from && x.to === r.to);
    if (a) (a.rows as number[]).push(i);
    else out.push({ from: r.from, to: r.to, rows: [i] });
  });
  return out;
}

/** Where a line from the centre of a box towards (dx, dy) leaves the box. */
function edgePoint(cx: number, cy: number, w: number, dx: number, dy: number) {
  const tx = dx === 0 ? Infinity : w / 2 / Math.abs(dx);
  const ty = dy === 0 ? Infinity : BOX_H / 2 / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

/** Lines of a label as text, each line its own tspan, centred or anchored to one side. */
function Label({
  x,
  y,
  lines,
  anchor,
  up,
  className,
}: {
  x: number;
  y: number;
  lines: readonly string[];
  anchor: "start" | "middle" | "end";
  up?: boolean;
  className: string;
}) {
  const first = up ? y - (lines.length - 1) * 14 : y;
  return (
    <text x={x} y={first} textAnchor={anchor} className={className}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={first + i * 14}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function StateDiagram({
  machine: m,
  current,
  nextRow,
}: {
  machine: Machine;
  current?: string;
  nextRow?: number;
}) {
  const strings = useViewStrings();
  const [w, h] = m.size ?? [400, 380];
  const centre = { x: w / 2, y: h / 2 };
  const at = (name: string) => {
    const s = m.states.find((x) => x.name === name);
    return { x: s?.at?.[0] ?? 0, y: s?.at?.[1] ?? 0, w: boxW(name) };
  };
  const arrows = arrowsOf(m);
  const label = (a: Arrow) =>
    a.rows.flatMap((r, i) => [
      ...(i > 0 ? [strings.machine.or] : []),
      ...conditionText(m, m.rows[r] as MachineRow, strings),
    ]);
  return (
    <div className="state-diagram-wrap">
      <svg
        className="state-diagram"
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: `${w}px`, height: `${h}px` }}
        role="img"
        aria-label={format(strings.machine.diagramLabel, {
          states: m.states.map((s) => s.name).join(", "),
        })}
      >
        <defs>
          <marker
            id={`arrow-${m.id}`}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={8}
            markerHeight={8}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="state-arrowhead" />
          </marker>
        </defs>
        {arrows.map((a) => {
          const taken = nextRow !== undefined && a.rows.includes(nextRow);
          const cls = `state-arrow${taken ? " state-arrow-next" : ""}`;
          const p = at(a.from);
          const lines = label(a);
          const given = m.rows[a.rows[0] as number]?.labelAt;
          if (a.from === a.to) {
            // A loop on the side of the box away from the middle of the drawing.
            const top = p.y <= centre.y;
            const y0 = top ? p.y - BOX_H / 2 : p.y + BOX_H / 2;
            const dir = top ? -1 : 1;
            const d = `M ${p.x - 12} ${y0} C ${p.x - 26} ${y0 + dir * 34}, ${p.x + 26} ${y0 + dir * 34}, ${p.x + 12} ${y0}`;
            return (
              <g
                key={`${a.from}-${a.to}`}
                className={cls}
                data-rows={a.rows.map((r) => r + 1).join(" ")}
              >
                <path d={d} fill="none" markerEnd={`url(#arrow-${m.id})`} />
                <Label
                  x={given?.[0] ?? p.x}
                  y={given?.[1] ?? (top ? y0 - 36 : y0 + 46)}
                  lines={lines}
                  anchor="middle"
                  up={given ? false : top}
                  className="state-arrow-label"
                />
              </g>
            );
          }
          const q = at(a.to);
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Two arrows between one pair of states run side by side, each offset to its right.
          const pair = arrows.some((b) => b.from === a.to && b.to === a.from);
          const off = pair ? 8 : 0;
          const nx = -uy;
          const ny = ux;
          const start = edgePoint(p.x, p.y, p.w, ux, uy);
          const end = edgePoint(q.x, q.y, q.w, -ux, -uy);
          const x1 = start.x + nx * off;
          const y1 = start.y + ny * off;
          const x2 = end.x + nx * off;
          const y2 = end.y + ny * off;
          const mx = (x1 + x2) / 2 + nx * 12;
          const my = (y1 + y2) / 2 + ny * 12;
          const anchor = nx > 0.3 ? "start" : nx < -0.3 ? "end" : "middle";
          const lift = ny < -0.3;
          return (
            <g
              key={`${a.from}-${a.to}`}
              className={cls}
              data-rows={a.rows.map((r) => r + 1).join(" ")}
            >
              <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#arrow-${m.id})`} />
              <Label
                x={given?.[0] ?? mx}
                y={given?.[1] ?? (lift ? my : my + 10)}
                lines={lines}
                anchor={given ? "middle" : anchor}
                up={given ? false : lift}
                className="state-arrow-label"
              />
            </g>
          );
        })}
        {m.states.map((s) => {
          const p = at(s.name);
          const here = s.name === current;
          return (
            <g
              key={s.name}
              className={`state-node${here ? " state-node-current" : ""}`}
              data-state={s.name}
            >
              <rect x={p.x - p.w / 2} y={p.y - BOX_H / 2} width={p.w} height={BOX_H} rx={6} />
              <text x={p.x} y={p.y - 3} textAnchor="middle" className="state-name">
                {s.name}
              </text>
              <text x={p.x} y={p.y + 14} textAnchor="middle" className="state-code">
                {s.code}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MachineTable({
  machine: m,
  current,
  nextRow,
}: {
  machine: Machine;
  current?: string;
  nextRow?: number;
}) {
  const strings = useViewStrings();
  const named = (name: string) => {
    const s = m.states.find((x) => x.name === name);
    return `${name} ${s?.code ?? ""}`;
  };
  return (
    <div className="truth-table-wrap machine-table-wrap">
      <table className="truth-table machine-table">
        <caption>{strings.machine.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{strings.machine.row}</th>
            <th scope="col">{strings.machine.state}</th>
            {m.inputs.map((i) => (
              <th scope="col" key={i}>
                {i}
              </th>
            ))}
            <th scope="col">{strings.machine.next}</th>
          </tr>
        </thead>
        <tbody>
          {m.rows.map((r, i) => {
            const cls = [
              r.from === current ? "machine-row-state" : "",
              i === nextRow ? "row-current" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <tr
                key={i}
                className={cls || undefined}
                aria-current={i === nextRow ? "true" : undefined}
              >
                <th scope="row">{i + 1}</th>
                <td>{named(r.from)}</td>
                {m.inputs.map((n) => (
                  <td key={n} className="machine-input">
                    {r.when[n] === undefined ? strings.machine.any : String(r.when[n])}
                  </td>
                ))}
                <td>{named(r.to)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="machine-table-note">{strings.machine.anyNote}</p>
    </div>
  );
}

/** The values a run of the machine's circuit leaves, for tests and the figure's first view. */
export function primedSim(circuit: Circuit, prime: readonly Step[]) {
  return runScript(circuit, prime);
}

export const StateMachine = withProps(
  Props,
  function StateMachine({ data, interactive }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const m = useMemo(() => machineById(data.machine), [data.machine]);
    const circuit = useMemo(() => libraryCircuit(data.machine), [data.machine]);
    const sim = useSettleSim(circuit, undefined, data.prime);
    const [scope, setScope] = useState("");
    const read = (name: string) => {
      const net =
        circuit.outputs.find((o) => o.name === name)?.net ??
        circuit.nets.find((n) => n.name === name)?.id;
      return net === undefined ? undefined : sim.values[net];
    };
    const sWord = read(MACHINE_NETS.stateOutput);
    const nWord = read(MACHINE_NETS.next);
    const current = stateOf(m, sWord);
    const next = stateOf(m, nWord);
    const inputs: Inputs = Object.fromEntries(
      m.inputs.map((i) => {
        const v = read(i);
        return [i, v && isKnown(v) && v.value === 1n ? 1 : 0];
      }),
    );
    const rst = read("RST");
    const resetting = rst !== undefined && isKnown(rst) && rst.value === 1n;
    const applies = current && !resetting ? rowFor(m, current.name, inputs) : undefined;
    const nextRow = applies?.index;
    const show = new Set<Pane>(data.show);
    const word = (v: Word | undefined) => (v ? formatWord(v) : "");
    const names = Object.fromEntries(m.states.map((s) => [s.code, s.name]));

    let status: string;
    if (!current) status = format(strings.machine.noState, { code: word(sWord) });
    else if (resetting)
      status = format(strings.machine.resetting, {
        state: current.name,
        code: current.code,
        next: next?.name ?? strings.machine.noName,
        nextCode: word(nWord),
      });
    else
      status = format(strings.machine.status, {
        state: current.name,
        code: current.code,
        row: (nextRow ?? 0) + 1,
        next: next?.name ?? strings.machine.noName,
        nextCode: word(nWord),
      });

    return (
      <div className="state-machine" data-interactive={interactive.id}>
        <div className="machine-inputs" role="group" aria-label={strings.machine.inputsLabel}>
          {[...m.inputs, "RST"].map((i) => {
            const v = read(i);
            const on = v !== undefined && isKnown(v) && v.value === 1n;
            return (
              <button
                key={i}
                type="button"
                className={`button secondary machine-input-button${on ? " on" : ""}`}
                aria-pressed={on}
                onClick={() => sim.toggle(i)}
              >
                {format(strings.machine.inputButton, { name: i, value: on ? 1 : 0 })}
              </button>
            );
          })}
        </div>
        <div className="explorer-actions">
          <button type="button" className="button primary" onClick={() => sim.clock("CLK")}>
            {format(strings.explorer.clock, { name: "CLK" })}
          </button>
          <button type="button" className="button secondary" onClick={() => sim.reset()}>
            {strings.explorer.reset}
          </button>
        </div>
        <p role="status" className="machine-status">
          {status}
        </p>
        {show.has("diagram") && (
          <StateDiagram
            machine={m}
            {...(current ? { current: current.name } : {})}
            {...(nextRow !== undefined ? { nextRow } : {})}
          />
        )}
        {show.has("table") && (
          <MachineTable
            machine={m}
            {...(current ? { current: current.name } : {})}
            {...(nextRow !== undefined ? { nextRow } : {})}
          />
        )}
        {show.has("circuit") && (
          <CircuitView
            circuit={circuit}
            values={sim.values}
            title={strings.machine.circuitTitle}
            onToggleInput={(name) => sim.toggle(name)}
            scope={scope}
            onScope={setScope}
          />
        )}
        {show.has("trace") && (
          <TimingDiagram
            circuit={circuit}
            trace={sim.sim.trace}
            title={strings.machine.traceTitle}
            signals={[
              "CLK",
              "RST",
              ...m.inputs,
              { net: MACHINE_NETS.stateOutput, label: MACHINE_NETS.stateOutput, names },
              ...m.outputs,
            ]}
          />
        )}
        {show.has("text") && (
          <pre className="hdl-generated machine-text" aria-label={strings.machine.textLabel}>
            {machineText(m, { style: data.textStyle })}
          </pre>
        )}
      </div>
    );
  },
);
