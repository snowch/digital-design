// The drawing editor: place parts from a palette, wire output ports to input ports, move and
// delete, all with a pointer or with the keyboard alone. The drawing is the learner's; this
// component owns no state but the selection and a wire in progress. Every change goes up as a
// new drawing, which the editor around it compiles and stores.

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { autoLayout } from "./layout";
import { drawingWarnings, specOf, type Drawing, type Part, type PortRef } from "./drawing";
import { CELL, sceneOf, type PartBox } from "./scene";
import { GateSymbol, isShaped } from "./symbols";
import { format, useViewStrings } from "./strings";
import { nameRepeatsKind, partSpec } from "./parts";

export interface BuilderProps {
  readonly drawing: Drawing;
  readonly onChange: (drawing: Drawing) => void;
  /** Part ids the palette offers. */
  readonly palette: readonly string[];
  /** Part ids to mark, as the diagnosis names them. */
  readonly highlight?: readonly string[];
  readonly title: string;
}

type Selection = { kind: "part"; id: string } | { kind: "wire"; index: number };

function isSource(drawing: Drawing, ref: PortRef): boolean | undefined {
  const part = drawing.parts.find((p) => p.id === ref.part);
  const spec = part && specOf(part);
  if (!spec) return undefined;
  if (spec.outputs.includes(ref.port)) return true;
  if (spec.inputs.includes(ref.port)) return false;
  return undefined;
}

function nextId(drawing: Drawing, kind: string): string {
  const taken = new Set(drawing.parts.map((p) => p.id));
  for (let n = 1; ; n++) if (!taken.has(`${kind}${n}`)) return `${kind}${n}`;
}

function freeSpot(drawing: Drawing): { x: number; y: number } {
  const taken = new Set(drawing.parts.map((p) => `${p.x},${p.y}`));
  for (let x = 5; ; x += 5) {
    for (let y = 1; y <= 13; y += 3) {
      if (!taken.has(`${x},${y}`)) return { x, y };
    }
  }
}

export function Builder({ drawing, onChange, palette, highlight = [], title }: BuilderProps) {
  const strings = useViewStrings();
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<Selection | undefined>();
  const [pending, setPending] = useState<PortRef | undefined>();
  const [message, setMessage] = useState<string>("");
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | undefined>();
  const scene = sceneOf(drawing);
  const marked = new Set(highlight);
  const warnings = drawingWarnings(drawing);

  const portName = (ref: PortRef): string => {
    const part = drawing.parts.find((p) => p.id === ref.part);
    const spec = part && specOf(part);
    const direction = spec?.outputs.includes(ref.port)
      ? strings.builder.output
      : strings.builder.input;
    if (part?.kind === "input" || part?.kind === "output") return `${part.name ?? part.id}`;
    return `${ref.part} ${direction} ${ref.port}`;
  };

  const addPart = (kind: string) => {
    const spot = freeSpot(drawing);
    const part: Part = { id: nextId(drawing, kind), kind, x: spot.x, y: spot.y };
    onChange({ ...drawing, parts: [...drawing.parts, part] });
    setSelected({ kind: "part", id: part.id });
    setMessage(format(strings.builder.added, { id: part.id }));
  };

  const removeSelected = useCallback(() => {
    if (!selected) return;
    if (selected.kind === "wire") {
      const w = drawing.wires[selected.index];
      onChange({ ...drawing, wires: drawing.wires.filter((_, i) => i !== selected.index) });
      if (w)
        setMessage(
          format(strings.builder.removedWire, { from: portName(w.from), to: portName(w.to) }),
        );
    } else {
      const part = drawing.parts.find((p) => p.id === selected.id);
      if (!part || part.kind === "input" || part.kind === "output") {
        setMessage(strings.builder.pinsStay);
        return;
      }
      onChange({
        parts: drawing.parts.filter((p) => p.id !== selected.id),
        wires: drawing.wires.filter(
          (w) => w.from.part !== selected.id && w.to.part !== selected.id,
        ),
      });
      setMessage(format(strings.builder.removedPart, { id: selected.id }));
    }
    setSelected(undefined);
  }, [selected, drawing, onChange, strings]);

  const movePart = (partId: string, x: number, y: number) => {
    if (x < 0 || y < 0) return;
    onChange({
      ...drawing,
      parts: drawing.parts.map((p) => (p.id === partId ? { ...p, x, y } : p)),
    });
  };

  const pickPort = (ref: PortRef) => {
    const source = isSource(drawing, ref);
    if (source === undefined) return;
    if (!pending) {
      setPending(ref);
      setMessage(
        format(source ? strings.builder.pendingFromOutput : strings.builder.pendingFromInput, {
          port: portName(ref),
        }),
      );
      return;
    }
    if (pending.part === ref.part && pending.port === ref.port) {
      setPending(undefined);
      setMessage(strings.builder.cancelled);
      return;
    }
    const pendingSource = isSource(drawing, pending);
    if (pendingSource === source) {
      setMessage(
        format(strings.builder.notAPair, {
          a: portName(pending),
          b: portName(ref),
          role: source ? strings.builder.outputs : strings.builder.inputs,
        }),
      );
      return;
    }
    const from = source ? ref : pending;
    const to = source ? pending : ref;
    const wires = drawing.wires.filter((w) => !(w.to.part === to.part && w.to.port === to.port));
    onChange({ ...drawing, wires: [...wires, { from, to }] });
    setPending(undefined);
    setMessage(format(strings.builder.connected, { from: portName(from), to: portName(to) }));
  };

  const onPartKey = (part: Part) => (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const s = step[e.key];
    if (s) {
      e.preventDefault();
      movePart(part.id, part.x + s[0], part.y + s[1]);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setSelected({ kind: "part", id: part.id });
      queueMicrotask(removeSelected);
    } else if (e.key === "Escape") {
      setSelected(undefined);
      setPending(undefined);
    }
  };

  useEffect(() => {
    if (selected?.kind === "part" && !drawing.parts.some((p) => p.id === selected.id))
      setSelected(undefined);
  }, [drawing, selected]);

  // Pointer dragging of parts, in grid cells. jsdom has no CTM, so dragging is pointer-only.
  const cellAt = (e: PointerEvent): { x: number; y: number } | undefined => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM?.();
    if (!svg || !ctm) return undefined;
    const p = ctm.inverse();
    const x = p.a * e.clientX + p.c * e.clientY + p.e;
    const y = p.b * e.clientX + p.d * e.clientY + p.f;
    return { x: Math.round(x / CELL), y: Math.round(y / CELL) };
  };
  const startDrag = (part: Part) => (e: PointerEvent) => {
    const cell = cellAt(e);
    if (!cell) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id: part.id, dx: cell.x - part.x, dy: cell.y - part.y });
    setSelected({ kind: "part", id: part.id });
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const cell = cellAt(e);
    const part = drawing.parts.find((p) => p.id === drag.id);
    if (!cell || !part) return;
    const x = Math.max(0, cell.x - drag.dx);
    const y = Math.max(0, cell.y - drag.dy);
    if (x !== part.x || y !== part.y) movePart(drag.id, x, y);
  };
  const endDrag = () => setDrag(undefined);

  const status = pending
    ? message
    : message ||
      (selected?.kind === "part"
        ? format(strings.builder.selectedPart, { id: selected.id })
        : selected?.kind === "wire"
          ? strings.builder.selectedWire
          : "");

  const renderPort = (
    box: PartBox,
    port: string,
    at: { x: number; y: number },
    direction: "input" | "output",
  ) => {
    const ref = { part: box.part.id, port };
    const isPending = pending?.part === ref.part && pending.port === port;
    const label = portName(ref);
    return (
      <g
        key={`${direction}-${port}`}
        className={`port port-${direction}${isPending ? " port-pending" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${label}. ${pending ? strings.builder.finishWire : strings.builder.startWire}`}
        aria-pressed={isPending}
        onClick={(e) => {
          e.stopPropagation();
          pickPort(ref);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            pickPort(ref);
          } else if (e.key === "Escape" && pending) {
            setPending(undefined);
            setMessage(strings.builder.cancelled);
          }
        }}
      >
        <circle cx={at.x} cy={at.y} r={9} className="port-hit" />
        <circle cx={at.x} cy={at.y} r={4} className="port-dot" />
      </g>
    );
  };

  return (
    <div className="builder" data-pending={pending ? "true" : "false"}>
      <div className="builder-toolbar" role="toolbar" aria-label={strings.builder.palette}>
        {palette.map((kind) => {
          const spec = partSpec(kind);
          if (!spec) return null;
          return (
            <button
              key={kind}
              type="button"
              className="button secondary"
              onClick={() => addPart(kind)}
              title={spec.describe}
            >
              {format(strings.builder.add, { label: spec.label })}
            </button>
          );
        })}
        <span className="toolbar-gap" />
        <button
          type="button"
          className="button secondary"
          onClick={removeSelected}
          disabled={!selected}
        >
          {strings.builder.deleteSelected}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => onChange(autoLayout(drawing))}
        >
          {strings.builder.tidy}
        </button>
      </div>
      <div className="builder-scroll">
        <svg
          ref={svgRef}
          className="circuit builder-canvas"
          viewBox={`0 0 ${Math.max(scene.width, 720)} ${Math.max(scene.height, 300)}`}
          role="application"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-help`}
          style={{ width: "100%", height: "auto", minWidth: "720px", maxWidth: "1100px" }}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={() => setSelected(undefined)}
        >
          <title id={`${id}-title`}>{title}</title>
          <g className="wires">
            {scene.wires.map((w, i) => {
              const isSelected = selected?.kind === "wire" && selected.index === i;
              return (
                <g
                  key={i}
                  className={`wire wire-none${isSelected ? " wire-selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${format(strings.builder.wireLabel, { from: portName(w.from), to: portName(w.to) })}. ${strings.builder.wireHelp}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected({ kind: "wire", index: i });
                    setMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Delete" || e.key === "Backspace") {
                      e.preventDefault();
                      setSelected({ kind: "wire", index: i });
                      queueMicrotask(removeSelected);
                    }
                  }}
                >
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
              const isSelected = selected?.kind === "part" && selected.id === part.id;
              const spec = specOf(part);
              const kindLabel = isPin
                ? part.kind === "input"
                  ? strings.builder.inputPin
                  : strings.builder.outputPin
                : (spec?.label ?? part.kind);
              return (
                <g
                  key={part.id}
                  className="builder-part"
                  transform={`translate(${box.x} ${box.y})`}
                >
                  <g
                    className={`${isPin ? `pin pin-${part.kind}` : `part part-${part.kind}`}${isSelected ? " selected" : ""}${marked.has(part.id) ? " part-marked" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${kindLabel} ${isPin ? (part.name ?? part.id) : part.id}. ${strings.builder.partHelp}`}
                    aria-pressed={isSelected}
                    data-part={part.id}
                    style={{ touchAction: "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ kind: "part", id: part.id });
                      setMessage("");
                    }}
                    onKeyDown={onPartKey(part)}
                    onPointerDown={startDrag(part)}
                  >
                    {marked.has(part.id) && (
                      <rect
                        x={-6}
                        y={-6}
                        width={box.w + 12}
                        height={box.h + 12}
                        rx={8}
                        className="mark"
                      />
                    )}
                    {isPin ? (
                      <rect width={box.w} height={box.h} rx={4} />
                    ) : isShaped(part.kind) ? (
                      <GateSymbol kind={part.kind} />
                    ) : (
                      <rect
                        x={2}
                        y={2}
                        width={box.w - 4}
                        height={box.h - 4}
                        rx={4}
                        className="box"
                      />
                    )}
                    {isPin ? (
                      <text
                        x={box.w / 2}
                        y={box.h / 2 + 4}
                        textAnchor="middle"
                        className="pin-name"
                      >
                        {part.name ?? part.id}
                      </text>
                    ) : (
                      <>
                        {!isShaped(part.kind) && (
                          <text x={box.w / 2} y={-5} textAnchor="middle" className="part-label">
                            {spec?.label ?? part.kind}
                          </text>
                        )}
                        {!nameRepeatsKind(part.id, part.kind) && (
                          <text
                            x={box.w / 2}
                            y={box.h + 12}
                            textAnchor="middle"
                            className="part-name"
                          >
                            {part.id}
                          </text>
                        )}
                        {!isShaped(part.kind) &&
                          box.inputs.map((p) => (
                            <text key={p.port} x={6} y={p.at.y - box.y + 3} className="port-label">
                              {p.port}
                            </text>
                          ))}
                        {!isShaped(part.kind) &&
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
                        {isShaped(part.kind) &&
                          box.inputs.length > 1 &&
                          box.inputs.map((p) => (
                            <text
                              key={p.port}
                              x={-8}
                              y={p.at.y - box.y + 3}
                              textAnchor="end"
                              className="port-label"
                            >
                              {p.port}
                            </text>
                          ))}
                      </>
                    )}
                  </g>
                  {box.inputs.map((p) =>
                    renderPort(box, p.port, { x: p.at.x - box.x, y: p.at.y - box.y }, "input"),
                  )}
                  {box.outputs.map((p) =>
                    renderPort(box, p.port, { x: p.at.x - box.x, y: p.at.y - box.y }, "output"),
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <p id={`${id}-help`} className="builder-help">
        {strings.builder.help}
      </p>
      <p className="builder-status" role="status" aria-live="polite">
        {status}
      </p>
      {warnings.length > 0 && (
        <details className="builder-warnings">
          <summary>{format(strings.builder.looseEnds, { n: warnings.length })}</summary>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
