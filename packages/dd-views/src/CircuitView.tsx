// Copyright © 2026 Christopher Snow

// A circuit, drawn. Values on the wires come from a simulator; the view never computes one.
// A composite is a closed box until opened, and opening it shows its own gates in place of the
// whole circuit, with a breadcrumb back. Colour never carries a value alone: every wire has its
// level in a label at its source, unknown wires are dashed, and the signal table beside the
// drawing says the same in text.

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { hexOfWord } from "@dd/dd-model";
import { DrillDown, StateInspector, drillLevels } from "@platform/primitives";
import { formatWord, type Circuit, type Word } from "@dd/sim";

import { focusSpan, scrollToCentre } from "./focus";
import { BOX_PADDING, LARGE_DRAWING, OverviewStrip, useZoom } from "./Overview";
import { labelFor, nameRepeatsKind } from "./parts";
import { circuitToDrawing, withNotes } from "./drawing";
import { NOTE_GAP, NOTE_LINE, drawingAt, netOfWire, sceneOf, type PartBox } from "./scene";
import { straighten } from "./straighten";
import { GateSymbol, isShaped } from "./symbols";
import { useOverflows, useWidth } from "./useWidth";
import { useViewStrings } from "./strings";
import { readingText } from "./WordInputs";

export interface CircuitViewProps {
  readonly circuit: Circuit;
  /** Net values by net id, from a simulator. Absent: wires are drawn without values. */
  readonly values?: readonly Word[];
  /** Full component paths to mark, as the diagnosis names them. */
  readonly highlight?: readonly string[];
  /** What a mark means, for its accessible name; by default, where a test first disagreed. */
  readonly highlightLabel?: string;
  /** Module 10: lines written under a part, by path, saying what it is there for in this figure. */
  readonly notes?: Readonly<Record<string, readonly string[]>>;
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
  /**
   * Module 8: the widest word whose value is written on the drawing. A datapath's 64-bit buses are
   * many and close together, so their values are in the figure's table of buses beside it and in
   * the readout a press or a tap gives; every narrower value is written as before.
   */
  readonly writtenWidth?: number;
  /**
   * Module 8: the whole of the drawing small above it, with a frame on the part on screen, and
   * zoom (`Overview.tsx`), when the drawing is wider than its box. A large drawing has them unless
   * this is false; true gives them to any drawing wider than its box.
   */
  readonly overview?: boolean;
  /**
   * Module 8: the parts, by name, a drawing wider than its box opens on: scrolled so they stand
   * in the middle of the box, as the lesson's words point at them. A name may also be a signal's,
   * or a path into a block, which finds the block (`focus.ts`). The drawing moves there again when
   * it changes, as when a learner chooses a fault, and the strip's frame follows.
   */
  readonly focus?: readonly string[];
  /**
   * Module 13: the wire pressed, by net, held by the figure so it stays pinned as blocks open and
   * close: a net keeps its number at every level, so its value shows wherever the wire is drawn.
   */
  readonly pinned?: number;
  readonly onPin?: (net: number | undefined) => void;
  /** Module 13: the nets marked as in use, the ones the next edge changes. */
  readonly active?: ReadonlySet<number>;
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

/** A value as a signal table shows it: with `words`, an 8-bit word too in hexadecimal. */
export function shownWord(value: Word | undefined, words: boolean): string {
  return words && value && value.width === 8 ? hexOfWord(value) : valueLabel(value);
}

/** A constant part's value in binary, as its params give it. */
function constText(circuit: Circuit, path: string): string {
  const c = circuit.components.find((x) => x.path === path);
  const width = Number(c?.params?.["width"] ?? 1);
  const value = BigInt(String(c?.params?.["value"] ?? "0"));
  // Module 13: a wide fixed word, such as the 0s above a narrow word widened to 64 bits, is
  // written in hexadecimal, as every wide word is, a digit per four bits.
  if (width > 8)
    return value
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(width / 4), "0");
  return value.toString(2).padStart(width, "0");
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
  // Module 8: the datapath's closed blocks. The decoder is Module 9's to open; the rest hold
  // components, or one word's worth of a part the learner has already opened in an earlier module.
  "digits",
  "decoder",
  "registers",
  "stops",
  "plus4",
  "widen",
  "zero-or-word",
  "times4",
  "word-adder",
  "word-register-64",
  "word-register-3",
  "count-down",
  // Module 9: the machine of several edges. Its held words are one-word memories, as the PC is;
  // the constant's bits and the cause word hold slices and selectors.
  "held-64",
  "held-32",
  "hold-ab",
  "constant-bits",
  "cause-word",
  "split-control",
  "word-register-32",
  "join-control",
  // Module 12: the longer control bus's join, and the check that C4 is 0 or holds the PC, a
  // word's worth of slices and one OR.
  "join-control-traps",
  "no-handler",
  // Module 13: the final machine's control bus, one signal longer.
  "join-control-final",
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
  highlightLabel,
  notes,
  scope = "",
  onScope,
  onToggleInput,
  title,
  table = true,
  readings = [],
  children,
  writtenWidth,
  overview,
  focus,
  pinned,
  onPin,
  active,
}: CircuitViewProps) {
  const written = (v: Word | undefined) =>
    v !== undefined && (writtenWidth === undefined || v.width <= writtenWidth);
  const strings = useViewStrings();
  const id = useId();
  // A read-only drawing is straightened: parts nudged up or down so its wires run straight.
  // A figure's notes are written on the drawing it first shows; a block opened shows its own.
  const notesKey = JSON.stringify(notes ?? {});
  const scopedNotes = useMemo(
    () => (scope === "" ? (JSON.parse(notesKey) as Record<string, readonly string[]>) : undefined),
    [notesKey, scope],
  );
  const {
    drawing,
    circuit: sub,
    heldOutside,
  } = useMemo(() => {
    const at = drawingAt(circuit, scope);
    // Module 0: a wire a stuck-at fault holds whose fixed value sits outside the block on show.
    // Inside the block its old driver now drives the fault's cut net, which nothing reads, and the
    // held net has no driver, so no wire would be drawn at all. The drawing joins them again: the
    // wire runs from its old driver, carries what that driver gives, and is drawn as held, so the
    // driver's value and the held value (at the wire's reader) show side by side.
    const cuts = new Map<number, number>();
    const driven = new Set(at.circuit.components.flatMap((c) => Object.values(c.outputs)));
    for (const c of at.circuit.composites) for (const n of Object.values(c.outputs)) driven.add(n);
    for (const n of at.circuit.nets) {
      if (!n.name.endsWith(".cut") || !driven.has(n.id)) continue;
      const base = at.circuit.nets.find((m) => m.name === n.name.slice(0, -".cut".length));
      if (base && !driven.has(base.id)) cuts.set(n.id, base.id);
    }
    if (cuts.size === 0)
      return {
        ...at,
        drawing: straighten(withNotes(at.drawing, scopedNotes)),
        heldOutside: new Set<number>(),
      };
    const joined = {
      ...at.circuit,
      components: at.circuit.components.map((c) => ({
        ...c,
        outputs: Object.fromEntries(
          Object.entries(c.outputs).map(([port, n]) => [port, cuts.get(n) ?? n]),
        ),
      })),
    };
    return {
      circuit: at.circuit,
      drawing: straighten(withNotes(circuitToDrawing(joined), scopedNotes)),
      heldOutside: new Set(cuts.keys()),
    };
  }, [circuit, scope, scopedNotes]);
  const scene = useMemo(() => sceneOf(drawing), [drawing]);
  const highlighted = new Set(highlight);
  // The nets a stuck-at fault holds, and the nets it cut from their old drivers, each mapped to
  // the net it now holds; and the fault's own parts, which a drawing placed by hand may leave
  // unwired.
  const { heldNets, heldParts } = useMemo(() => {
    const held = new Map<number, number>();
    const parts = new Set<string>();
    for (const c of sub.components) {
      if (c.kind !== "const" || !c.path.includes("fault/stuck")) continue;
      parts.add(c.path);
      for (const base of Object.values(c.outputs)) {
        held.set(base, base);
        const name = sub.nets[base]?.name;
        const cut = sub.nets.find((n) => n.name === `${name}.cut`);
        if (cut) held.set(cut.id, base);
      }
    }
    return { heldNets: held, heldParts: parts };
  }, [sub]);
  const wired = useMemo(() => new Set(scene.wires.map((w) => w.from.part)), [scene]);
  // Module 8: in a drawing placed by hand, a wire whose net a fault holds still runs from its old
  // driver. It carries the held value, and is drawn as held.
  const drawnNets = useMemo(
    () =>
      scene.wires.map((w) => {
        const drawn = netOfWire(sub, w.from);
        if (drawn !== undefined && heldOutside.has(drawn)) return { net: drawn, held: true };
        const heldBy = drawn !== undefined ? heldNets.get(drawn) : undefined;
        return { net: heldBy ?? drawn, held: heldBy !== undefined };
      }),
    [scene, sub, heldNets, heldOutside],
  );
  // The net under the pointer, focused, or last pressed: every wire of it lights up together.
  // A wire's name and value show while it is pointed at or focused, and stay after a press or a
  // tap until another wire is pressed, so a phone, which has no pointing, shows them too.
  const [hovered, setHovered] = useState<number | undefined>();
  const [ownPressed, setOwnPressed] = useState<number | undefined>();
  const pressed = onPin ? pinned : ownPressed;
  const setPressed = (net: number | undefined) => (onPin ? onPin(net) : setOwnPressed(net));
  const hot = hovered ?? pressed;
  const [scrollRef, overflows] = useOverflows<HTMLDivElement>();
  // Module 8: the box's width, for a drawing too wide for it, which gets the strip and zoom.
  const [widthRef, boxWidth] = useWidth<HTMLDivElement>(0);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const boxRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef(el);
      widthRef(el);
      setBox(el);
    },
    [scrollRef, widthRef],
  );
  const wanted = overview ?? scene.width >= LARGE_DRAWING;
  const large = wanted && boxWidth > 0 && scene.width > boxWidth - BOX_PADDING;
  const zoom = useZoom(large ? box : null, scene.width, scene.height, boxWidth - BOX_PADDING);
  // The things the lesson names, in the middle of the box when the drawing first shows, and again
  // when the drawing changes (a fault chosen). After the zoom's own effects, so a drawing that
  // starts again at its own size is measured at that size; the strip's frame follows the scroll.
  const focusKey = focus?.join(" ") ?? "";
  useEffect(() => {
    const svg = box?.querySelector("svg.circuit");
    if (!box || !svg || focusKey === "") return;
    let placed = -1;
    const place = () => {
      if (box.scrollWidth <= box.clientWidth + 1) return;
      const drawn = svg.getBoundingClientRect();
      const scale = drawn.width / scene.width;
      const nets = drawnNets.map((d) => (d.net !== undefined ? sub.nets[d.net]?.name : undefined));
      // A part as drawn, its words and written values with it; a pin as its box.
      const parts = [...svg.querySelectorAll(".parts > [data-path]")];
      const measure = (b: PartBox) => {
        const path = fullPath(scope, b.part.id);
        const r = parts
          .find((el) => el.getAttribute("data-path") === path)
          ?.getBoundingClientRect();
        return r
          ? { left: (r.left - drawn.left) / scale, right: (r.right - drawn.left) / scale }
          : { left: b.x, right: b.x + b.w };
      };
      const names = focusKey.split(" ");
      const span = focusSpan(scene, nets, scope, names, box.clientWidth / scale, measure);
      if (!span) return;
      const inset = drawn.left - box.getBoundingClientRect().left - box.clientLeft + box.scrollLeft;
      box.scrollLeft = scrollToCentre(span, scale, box.clientWidth, inset);
      placed = box.scrollLeft;
    };
    place();
    // The words are measured as drawn: again once the site's fonts have loaded, which widens them,
    // unless the learner has moved the drawing meanwhile.
    let current = true;
    void document.fonts?.ready.then(() => {
      if (current && box.scrollLeft === placed) place();
    });
    return () => {
      current = false;
    };
  }, [box, focusKey, scene, sub, drawnNets, scope]);
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
      {large && <OverviewStrip box={box} width={scene.width} height={scene.height} zoom={zoom} />}
      {large ? (
        <p className="scroll-note">{strings.circuit.zoomNote}</p>
      ) : (
        overflows && <p className="scroll-note">{strings.circuit.scrollNote}</p>
      )}
      <div className={`circuit-scroll${large ? " zoomable" : ""}`} ref={boxRef}>
        <svg
          className="circuit"
          viewBox={`0 0 ${scene.width} ${scene.height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          style={
            large
              ? {
                  // Zoomed by `--zoom` on its box, set without a render (`Overview.tsx`).
                  width: `calc(var(--zoom, 1) * ${scene.width}px)`,
                  height: `calc(var(--zoom, 1) * ${scene.height}px)`,
                }
              : {
                  // At its own size, or up to a quarter larger where the panel has room; never
                  // smaller.
                  width: `min(100%, ${scene.width * 1.25}px)`,
                  minWidth: `${scene.width}px`,
                  height: "auto",
                }
          }
        >
          <title id={`${id}-title`}>{title}</title>
          <g className="wires">
            {scene.wires.map((w, i) => {
              const { net, held } = drawnNets[i] ?? { net: undefined, held: false };
              const value = net !== undefined ? values?.[net] : undefined;
              const level = levelOf(value);
              const name = net !== undefined ? (sub.nets[net]?.name ?? "") : "";
              const isHot = net !== undefined && hot === net;
              const wide = net !== undefined && (sub.nets[net]?.width ?? 1) > 1;
              return (
                <g
                  key={i}
                  className={`wire wire-${level}${wide ? " wire-word" : ""}${isHot ? " wire-hot" : ""}${held ? " wire-held" : ""}${net !== undefined && active?.has(net) ? " wire-active" : ""}${onPin && net !== undefined && net === pinned ? " wire-pinned" : ""}`}
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
              // A fault's part no wire joins says nothing the held wire does not: it is left out.
              if (heldParts.has(part.id) && !wired.has(part.id)) return null;
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
                      written(pinValue) &&
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
                    {marked
                      ? `${part.id}: ${highlightLabel ?? strings.circuit.marked}`
                      : `${box.label} ${part.id}`}
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
                  {(part.note ?? []).map((line, k) => (
                    <text
                      key={`note-${k}`}
                      x={box.w / 2}
                      y={
                        box.h +
                        12 +
                        NOTE_GAP +
                        NOTE_LINE * (k + (nameRepeatsKind(part.id, part.kind) ? 0 : 1))
                      }
                      textAnchor="middle"
                      className="part-note"
                    >
                      {line}
                    </text>
                  ))}
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
                    return v && written(v) && wired && !shownAtPin ? (
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
  words = false,
}: {
  circuit: Circuit;
  values: readonly Word[];
  caption?: string;
  readings?: readonly ("unsigned" | "signed")[];
  /**
   * Module 8: a word of 8 bits or more in hexadecimal, as a lesson that writes its causes and
   * words in hexadecimal (`11`, not `00010001`) and its tests' messages write them.
   */
  words?: boolean;
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
          {
            text: shownWord(values[r.net], words),
            className: `value-${levelOf(values[r.net])}`,
          },
          ...readings.map((k) => ({ text: readingText(values[r.net], k) })),
        ],
      }))}
    />
  );
}
