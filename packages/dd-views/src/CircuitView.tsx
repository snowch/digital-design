// Copyright © 2026 Christopher Snow

// A circuit, drawn. Values on the wires come from a simulator; the view never computes one.
// A composite is a closed box until opened, and opening it shows its own gates in place of the
// whole circuit, with a breadcrumb back. Colour never carries a value alone: every wire has its
// level in a label at its source, unknown wires are dashed, and the signal table beside the
// drawing says the same in text.

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

import { DrillDown, StateInspector, drillLevels } from "@dd/primitives";
import { formatWord, type Circuit, type Word } from "@dd/sim";

import { labelFor, nameRepeatsKind } from "./parts";
import { drawingAt, netOfWire, sceneOf, type PartBox } from "./scene";
import { straighten } from "./straighten";
import { GateSymbol, isShaped } from "./symbols";
import { useOverflows } from "./useWidth";
import { useViewStrings } from "./strings";
import { readingText } from "./WordInputs";

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
  /** Readings of each word in the table, as numbers (Module 3). */
  readonly readings?: readonly ("unsigned" | "signed")[];
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
 * bit can be read off against the flip-flop that holds it; a wider word in hexadecimal, written as
 * Module 1 writes it (`FF48`: capitals, a digit per four bits, no prefix), with X for a digit
 * any of whose bits is unknown.
 */
export function valueLabel(value: Word | undefined): string {
  if (!value) return "";
  if (value.width <= 8) return formatWord(value);
  const full = (1n << BigInt(value.width)) - 1n;
  // Module 6: a wide word with unknown bits, a digit per four bits as well, X where any of the
  // four is unknown, so an unknown 16-bit word is XXXX and fits beside its wire.
  if (value.known !== full) {
    const digits = Math.ceil(value.width / 4);
    return Array.from({ length: digits }, (_, i) => {
      const shift = BigInt((digits - 1 - i) * 4);
      const nibble = (full >> shift) & 15n;
      return ((value.known >> shift) & nibble) === nibble
        ? ((value.value >> shift) & nibble).toString(16).toUpperCase()
        : "X";
    }).join("");
  }
  return value.value
    .toString(16)
    .toUpperCase()
    .padStart(Math.ceil(value.width / 4), "0");
}

/** A constant part's value in binary, as its params give it. */
function constText(circuit: Circuit, path: string): string {
  const c = circuit.components.find((x) => x.path === path);
  const width = Number(c?.params?.["width"] ?? 1);
  return BigInt(String(c?.params?.["value"] ?? "0"))
    .toString(2)
    .padStart(width, "0");
}

/** Blocks drawn closed for good: a split or a join holds no gates worth opening. */
const SEALED = new Set([
  "split-4",
  "join-4",
  // Module 5: the state machines' words of two and three bits.
  "split-2",
  "split-3",
  "join-2",
  "join-3",
  // Module 6: a word selector holds one Module 3 selector per bit, and a memory or a ROM built as
  // a component holds only the simulator's primitive; a 16-bit register's sixteen flip-flops
  // teach nothing the four-bit register did not.
  "word-selector-2",
  "word-selector-4",
  "word-selector-16",
  "memory",
  "rom",
  "word-register-16",
  "split-address",
  "split-bytes",
  "join-bytes",
  // Module 7: the bits of a word, a join and the top bit inside the ALU's groups.
  "word-piece",
  "word-join",
  "top-bit",
]);

/** Whether a block of this kind is drawn closed for good, so a learner never sees inside it. */
export function isSealed(kind: string): boolean {
  return SEALED.has(kind);
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
  readings = [],
  children,
}: CircuitViewProps) {
  const strings = useViewStrings();
  const id = useId();
  // A read-only drawing is straightened: parts nudged up or down so its wires run straight.
  const { drawing, circuit: sub } = useMemo(() => {
    const at = drawingAt(circuit, scope);
    return { ...at, drawing: straighten(at.drawing) };
  }, [circuit, scope]);
  const scene = useMemo(() => sceneOf(drawing), [drawing]);
  const highlighted = new Set(highlight);
  // The net under the pointer, focused, or last pressed: every wire of it lights up together.
  // A wire's name and value show while it is pointed at or focused, and stay after a press or a
  // tap until another wire is pressed, so a phone, which has no pointing, shows them too.
  const [hovered, setHovered] = useState<number | undefined>();
  const [pressed, setPressed] = useState<number | undefined>();
  const hot = hovered ?? pressed;
  const [scrollRef, overflows] = useOverflows<HTMLDivElement>();
  // The trail of opened blocks, each named by its instance name, or by its kind's label when the
  // name says no more (the `dff` block of the `dff` circuit). Two levels with one label collapse
  // into the deeper one, and the trail is drawn only when there is a block to open or to leave.
  const levels = drillLevels(scope, labelFor(circuit.name), (path, name) => {
    const block = circuit.composites.find((c) => c.path === path);
    return block && nameRepeatsKind(name, block.kind) ? labelFor(block.kind) : name;
  });
  const canOpen = drawing.parts.some((part) =>
    sub.composites.some((c) => c.path === part.id && !SEALED.has(c.kind)),
  );
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
        <DrillDown
          className="circuit-crumbs"
          label={strings.circuit.where}
          levels={levels}
          current={scope}
          onGo={onScope}
        />
      )}
      {overflows && <p className="scroll-note">{strings.circuit.scrollNote}</p>}
      <div className="circuit-scroll" ref={scrollRef}>
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
              const wide = net !== undefined && (sub.nets[net]?.width ?? 1) > 1;
              return (
                <g
                  key={i}
                  className={`wire wire-${level}${wide ? " wire-word" : ""}${isHot ? " wire-hot" : ""}`}
                  data-net={name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${name}. ${strings.circuit.showWire}`}
                  onMouseEnter={() => setHovered(net)}
                  onMouseLeave={() => setHovered((h) => (h === net ? undefined : h))}
                  onFocus={() => setHovered(net)}
                  onBlur={() => setHovered((h) => (h === net ? undefined : h))}
                  onClick={() => setPressed(net)}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPressed(net);
                    }
                  }}
                >
                  <title>{value ? `${name} = ${valueLabel(value)}` : name}</title>
                  {isHot && <path d={w.d} fill="none" className="wire-halo" />}
                  <path d={w.d} fill="none" className="wire-hit" />
                  <path d={w.d} fill="none" />
                  <circle cx={w.end.x} cy={w.end.y} r={3} />
                  {w.junctions.map((j) => (
                    <circle key={`${j.x},${j.y}`} cx={j.x} cy={j.y} r={3} className="junction" />
                  ))}
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
              const composite = sub.composites.find(
                (c) => c.path === part.id && !SEALED.has(c.kind),
              );
              const outNet =
                part.kind === "input"
                  ? sub.inputs.find((p) => p.name === part.name)?.net
                  : part.kind === "output"
                    ? sub.outputs.find((p) => p.name === part.name)?.net
                    : undefined;
              const pinValue = outNet !== undefined ? values?.[outNet] : undefined;
              if (isPin) {
                // A word's pin is not a button; its bits are set under the drawing.
                const oneBit = outNet === undefined || (sub.nets[outNet]?.width ?? 1) === 1;
                // Inside an opened block a pin is the block's port, not an input of the circuit:
                // pressing it would set whichever top-level input shares its name.
                const clickable = part.kind === "input" && oneBit && scope === "" && onToggleInput;
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
                    {pinValue &&
                      (part.kind === "input" && pinValue.width > 1 ? (
                        // A word's wire is wide and turns close to its pin, so the word's value
                        // sits above the pin rather than across the wire (Module 3). A value wider
                        // than its pin (64 bits, Module 7) ends at the pin's right edge, so the
                        // wires turning just past the pin stay clear of it.
                        <text
                          x={valueLabel(pinValue).length * 7.5 > box.w ? box.w : box.w / 2}
                          y={-5}
                          textAnchor={valueLabel(pinValue).length * 7.5 > box.w ? "end" : "middle"}
                          className="value-label"
                        >
                          {valueLabel(pinValue)}
                        </text>
                      ) : (
                        <text
                          x={box.w + 6}
                          y={box.h / 2 + 4}
                          textAnchor="start"
                          className="value-label"
                        >
                          {valueLabel(pinValue)}
                        </text>
                      ))}
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
                    <GateSymbol kind={part.kind} h={box.h} />
                  ) : (
                    <rect x={2} y={2} width={box.w - 4} height={box.h - 4} rx={4} className="box" />
                  )}
                  {!isShaped(part.kind) && (
                    // A block's name sits clear of the value written by its first output.
                    <text x={box.w / 2} y={-8} textAnchor="middle" className="part-label">
                      {box.label}
                    </text>
                  )}
                  {part.kind === "const" && (
                    // A fixed value shows its bits inside its box, so a drawing says what it is
                    // even before anything runs (Module 3).
                    <text
                      x={box.w / 2}
                      y={box.h / 2 + 4}
                      textAnchor="middle"
                      className="const-value"
                    >
                      {constText(sub, part.id)}
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
                    // An output pin shows its own value, so a part driving one does not repeat
                    // it at its port, where ports 20 pixels apart would stack the labels. An
                    // output no wire leaves feeds nothing, so its value is not written either.
                    const shownAtPin = sub.outputs.some((o) => o.net === net);
                    const wired = scene.wires.some(
                      (w) => w.from.part === part.id && w.from.port === p.port,
                    );
                    return v && wired && !shownAtPin ? (
                      <text
                        key={p.port}
                        x={p.at.x - box.x + 6}
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
      {table && values && <SignalTable circuit={sub} values={values} readings={readings} />}
    </div>
  );
}

/** Inputs and outputs with their values, as text. */
export function SignalTable({
  circuit,
  values,
  caption,
  readings = [],
}: {
  circuit: Circuit;
  values: readonly Word[];
  caption?: string;
  readings?: readonly ("unsigned" | "signed")[];
}) {
  const strings = useViewStrings();
  const rows = [
    ...circuit.inputs.map((p) => ({ role: strings.circuit.input, ...p })),
    ...circuit.outputs.map((p) => ({ role: strings.circuit.output, ...p })),
  ];
  return (
    <StateInspector
      className={`signal-table${readings.length ? " with-readings" : ""}`}
      caption={caption ?? strings.circuit.signals}
      headings={[
        strings.circuit.signal,
        strings.circuit.role,
        strings.circuit.value,
        ...readings.map((r) => strings.readings.names[r]),
      ]}
      rows={rows.map((r) => ({
        key: `${r.role}-${r.name}`,
        name: r.name,
        cells: [
          { text: r.role },
          { text: valueLabel(values[r.net]), className: `value-${levelOf(values[r.net])}` },
          ...readings.map((k) => ({ text: readingText(values[r.net], k) })),
        ],
      }))}
    />
  );
}
