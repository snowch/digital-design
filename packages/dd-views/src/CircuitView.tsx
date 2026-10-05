// A circuit, drawn. Values on the wires come from a simulator; the view never computes one.
// A composite is a closed box until opened, and opening it shows its own gates in place of the
// whole circuit, with a breadcrumb back. Colour never carries a value alone: every wire has its
// level in a label at its source, unknown wires are dashed, and the signal table beside the
// drawing says the same in text.

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

import { formatWord, type Circuit, type Word } from "@dd/sim";

import { labelFor, nameRepeatsKind } from "./parts";
import { drawingAt, netOfWire, sceneOf, type PartBox } from "./scene";
import { GateSymbol, isShaped } from "./symbols";
import { useViewStrings } from "./strings";

export interface CircuitViewProps {
  readonly circuit: Circuit;
  /** Net values by net id, from a simulator. Absent: wires are drawn without values. */
  readonly values?: readonly Word[];
  /** Full component paths to mark, as the diagnosis names them. */
  readonly highlight?: readonly string[];
  /** The composite being looked inside; empty for the whole circuit. */
  readonly scope?: string;
  readonly onScope?: (path: string) => void;
  /** Makes the input pins buttons that call this. */
  readonly onToggleInput?: (name: string) => void;
  readonly title: string;
  /** Show the table of inputs and outputs as text. Default true. */
  readonly table?: boolean;
  readonly children?: ReactNode;
}

type Level = "high" | "low" | "unknown" | "none";

export function levelOf(value: Word | undefined): Level {
  if (!value) return "none";
  if (value.known !== (1n << BigInt(value.width)) - 1n) return "unknown";
  if (value.width === 1) return value.value === 1n ? "high" : "low";
  return value.value === 0n ? "low" : "high";
}

/**
 * A value as the views write it: a bit as 0, 1 or X; a word of up to eight bits in binary, so each
 * bit can be read off against the flip-flop that holds it; a wider word in hexadecimal.
 */
export function valueLabel(value: Word | undefined): string {
  if (!value) return "";
  return value.width <= 8 ? formatWord(value) : formatWord(value, 16);
}

function fullPath(scope: string, local: string): string {
  return scope ? `${scope}/${local}` : local;
}

export function CircuitView({
  circuit,
  values,
  highlight = [],
  scope = "",
  onScope,
  onToggleInput,
  title,
  table = true,
  children,
}: CircuitViewProps) {
  const strings = useViewStrings();
  const id = useId();
  const { drawing, circuit: sub } = useMemo(() => drawingAt(circuit, scope), [circuit, scope]);
  const scene = useMemo(() => sceneOf(drawing), [drawing]);
  const highlighted = new Set(highlight);
  // The net under the pointer, or the one last tapped: every wire of it lights up together.
  const [hot, setHot] = useState<number | undefined>();
  // The trail of opened blocks, each named by its instance name, or by its kind's label when the
  // name says no more (the `dff` block of the `dff` circuit). Two levels with one label collapse
  // into the deeper one, and the trail is drawn only when there is a block to open or to leave.
  const crumbs = scope ? scope.split("/") : [];
  const levels: { path: string; label: string }[] = [{ path: "", label: labelFor(circuit.name) }];
  for (let i = 0; i < crumbs.length; i++) {
    const path = crumbs.slice(0, i + 1).join("/");
    const block = circuit.composites.find((c) => c.path === path);
    const name = crumbs[i] ?? "";
    const label = block && nameRepeatsKind(name, block.kind) ? labelFor(block.kind) : name;
    const last = levels[levels.length - 1];
    if (last && last.label === label) levels[levels.length - 1] = { path, label };
    else levels.push({ path, label });
  }
  const canOpen = drawing.parts.some((part) => sub.composites.some((c) => c.path === part.id));
  const showTrail = onScope !== undefined && (levels.length > 1 || canOpen);

  const pinKey = (box: PartBox, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggleInput?.(box.part.name ?? box.part.id);
    }
  };

  return (
    <div className="circuit-view">
      {showTrail && (
        <nav className="circuit-crumbs" aria-label={strings.circuit.where}>
          {levels.map((level, i) => (
            <span key={level.path}>
              {i > 0 && <span aria-hidden="true"> / </span>}
              <button
                type="button"
                className="crumb"
                onClick={() => onScope(level.path)}
                disabled={level.path === scope}
              >
                {level.label}
              </button>
            </span>
          ))}
        </nav>
      )}
      <div className="circuit-scroll">
        <svg
          className="circuit"
          viewBox={`0 0 ${scene.width} ${scene.height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          style={{
            // At its own size, or up to a quarter larger where the panel has room; never smaller.
            width: `min(100%, ${scene.width * 1.25}px)`,
            minWidth: `${scene.width}px`,
            height: "auto",
          }}
        >
          <title id={`${id}-title`}>{title}</title>
          <g className="wires">
            {scene.wires.map((w, i) => {
              const net = netOfWire(sub, w.from);
              const value = net !== undefined ? values?.[net] : undefined;
              const level = levelOf(value);
              const name = net !== undefined ? (sub.nets[net]?.name ?? "") : "";
              const isHot = net !== undefined && hot === net;
              return (
                <g
                  key={i}
                  className={`wire wire-${level}${isHot ? " wire-hot" : ""}`}
                  data-net={name}
                  onMouseEnter={() => setHot(net)}
                  onMouseLeave={() => setHot((h) => (h === net ? undefined : h))}
                  onClick={() => setHot((h) => (h === net ? undefined : net))}
                >
                  <title>{value ? `${name} = ${valueLabel(value)}` : name}</title>
                  {isHot && <path d={w.d} fill="none" className="wire-halo" />}
                  <path d={w.d} fill="none" className="wire-hit" />
                  <path d={w.d} fill="none" />
                  <circle cx={w.end.x} cy={w.end.y} r={3} />
                </g>
              );
            })}
          </g>
          <g className="parts">
            {scene.boxes.map((box) => {
              const { part } = box;
              const isPin = part.kind === "input" || part.kind === "output";
              const path = fullPath(scope, part.id);
              const marked = highlighted.has(path);
              const composite = sub.composites.find((c) => c.path === part.id);
              const outNet =
                part.kind === "input"
                  ? sub.inputs.find((p) => p.name === part.name)?.net
                  : part.kind === "output"
                    ? sub.outputs.find((p) => p.name === part.name)?.net
                    : undefined;
              const pinValue = outNet !== undefined ? values?.[outNet] : undefined;
              if (isPin) {
                const clickable = part.kind === "input" && onToggleInput;
                const label = `${part.name ?? part.id}${pinValue ? ` = ${valueLabel(pinValue)}` : ""}`;
                return (
                  <g
                    key={part.id}
                    className={`pin pin-${part.kind} pin-${levelOf(pinValue)}${clickable ? " pin-button" : ""}`}
                    transform={`translate(${box.x} ${box.y})`}
                    {...(clickable
                      ? {
                          role: "button",
                          tabIndex: 0,
                          "aria-label": `${label}. ${strings.circuit.toggle}`,
                          onClick: () => onToggleInput(part.name ?? part.id),
                          onKeyDown: (e: KeyboardEvent) => pinKey(box, e),
                        }
                      : { role: "img", "aria-label": label })}
                  >
                    <rect width={box.w} height={box.h} rx={4} />
                    <text x={box.w / 2} y={box.h / 2 + 4} textAnchor="middle" className="pin-name">
                      {part.name ?? part.id}
                    </text>
                    {pinValue && (
                      <text
                        x={box.w + 6}
                        y={box.h / 2 + 4}
                        textAnchor="start"
                        className="value-label"
                      >
                        {valueLabel(pinValue)}
                      </text>
                    )}
                  </g>
                );
              }
              const openable = composite && onScope;
              return (
                <g
                  key={part.id}
                  className={`part part-${part.kind}${marked ? " part-marked" : ""}${composite ? " part-composite" : ""}`}
                  transform={`translate(${box.x} ${box.y})`}
                  data-path={path}
                  {...(openable
                    ? {
                        role: "button",
                        tabIndex: 0,
                        "aria-label": `${box.label} ${part.id}. ${strings.circuit.open}`,
                        onClick: () => onScope(fullPath(scope, part.id)),
                        onKeyDown: (e: KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onScope(fullPath(scope, part.id));
                          }
                        },
                      }
                    : { role: "img", "aria-label": `${box.label} ${part.id}` })}
                >
                  <title>
                    {marked ? `${part.id}: ${strings.circuit.marked}` : `${box.label} ${part.id}`}
                  </title>
                  {marked && (
                    <rect
                      x={-6}
                      y={-6}
                      width={box.w + 12}
                      height={box.h + 12}
                      rx={8}
                      className="mark"
                    />
                  )}
                  {isShaped(part.kind) ? (
                    <GateSymbol kind={part.kind} />
                  ) : (
                    <rect x={2} y={2} width={box.w - 4} height={box.h - 4} rx={4} className="box" />
                  )}
                  {!isShaped(part.kind) && (
                    <text x={box.w / 2} y={-5} textAnchor="middle" className="part-label">
                      {box.label}
                    </text>
                  )}
                  {!nameRepeatsKind(part.id, part.kind) && !part.id.startsWith("fault/") && (
                    <text x={box.w / 2} y={box.h + 12} textAnchor="middle" className="part-name">
                      {part.id}
                    </text>
                  )}
                  {!isShaped(part.kind) &&
                    part.kind !== "const" &&
                    part.kind !== "open" &&
                    box.inputs.map((p) => (
                      <text key={p.port} x={6} y={p.at.y - box.y + 3} className="port-label">
                        {p.port}
                      </text>
                    ))}
                  {!isShaped(part.kind) &&
                    part.kind !== "const" &&
                    part.kind !== "open" &&
                    box.outputs.map((p) => (
                      <text
                        key={p.port}
                        x={box.w - 6}
                        y={p.at.y - box.y + 3}
                        textAnchor="end"
                        className="port-label"
                      >
                        {p.port}
                      </text>
                    ))}
                  {box.outputs.map((p) => {
                    const net =
                      sub.components.find((c) => c.path === part.id)?.outputs[p.port] ??
                      composite?.outputs[p.port];
                    const v = net !== undefined ? values?.[net] : undefined;
                    return v ? (
                      <text
                        key={p.port}
                        x={p.at.x - box.x + 4}
                        y={p.at.y - box.y - 5}
                        className={`value-label value-${levelOf(v)}`}
                      >
                        {valueLabel(v)}
                      </text>
                    ) : null;
                  })}
                </g>
              );
            })}
          </g>
          {children}
        </svg>
      </div>
      <p className="wire-readout" aria-live="polite">
        {hot !== undefined
          ? `${sub.nets[hot]?.name ?? ""}${values?.[hot] ? ` = ${valueLabel(values[hot] as Word)}` : ""}`
          : "\u00a0"}
      </p>
      {table && values && <SignalTable circuit={sub} values={values} />}
    </div>
  );
}

/** Inputs and outputs with their values, as text. */
export function SignalTable({
  circuit,
  values,
  caption,
}: {
  circuit: Circuit;
  values: readonly Word[];
  caption?: string;
}) {
  const strings = useViewStrings();
  const rows = [
    ...circuit.inputs.map((p) => ({ role: strings.circuit.input, ...p })),
    ...circuit.outputs.map((p) => ({ role: strings.circuit.output, ...p })),
  ];
  return (
    <table className="signal-table">
      <caption>{caption ?? strings.circuit.signals}</caption>
      <thead>
        <tr>
          <th scope="col">{strings.circuit.signal}</th>
          <th scope="col">{strings.circuit.role}</th>
          <th scope="col">{strings.circuit.value}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.role}-${r.name}`}>
            <th scope="row">{r.name}</th>
            <td>{r.role}</td>
            <td className={`value-${levelOf(values[r.net])}`}>{valueLabel(values[r.net])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
