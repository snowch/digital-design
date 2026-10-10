// Copyright © 2026 Christopher Snow

// Memory drawn as boxes (Modules 11 and 12): words at their addresses, the registers that hold
// an address as arrows into them, and the word the last step changed outlined; the stack drawn
// the same way, its words grouped by the call that pushed them and each marked with the register
// it saves; and Module 11's cold store drawn as rooms, each with its two doors, from the room
// words in memory, the room the current call names lit. Each is a view of the debugger's state,
// stepped with it: nothing here runs the program.

import { useEffect, useRef } from "react";

import { memoryWord, type DebugState, type Program } from "@dd/dd-model";

import { format, useViewStrings } from "../strings";
import { useWidth } from "../useWidth";
import { hex3, signedText, stackGroups, valueText } from "./Debugger";

const CHAR = 7.3;
const ROW = 17;

/** One drawn word: where it is, what it holds, and what the page says beside it. */
interface BoxRow {
  readonly address: number;
  readonly value: bigint | undefined;
  /** The name a line gives the address, or what a stack word saves. */
  readonly note?: string;
  /** The registers that hold this address. */
  readonly pointers: readonly string[];
  readonly changed: boolean;
  /** A heading drawn above the word: the call that pushed it. */
  readonly group?: string;
  /** Past the end of a list, or popped from the stack: drawn dashed, set apart by a rule. */
  readonly past?: boolean;
  /** No box: only the address and the arrows (R14 at a word no push has stored). */
  readonly empty?: boolean;
  /** A heading alone, with no word under it (a folded run of calls). */
  readonly heading?: boolean;
}

function WordBoxes({
  rows,
  label,
  keyAlways = false,
}: {
  rows: readonly BoxRow[];
  label: string;
  /** The key line keeps its place when no word changed, so what is below does not jump. */
  keyAlways?: boolean;
}) {
  const t = useViewStrings().machine11;
  const [ref, width] = useWidth<HTMLDivElement>(420);
  const W = Math.max(260, Math.min(width, 520));
  const addrX = 4;
  const boxX = 40;
  const boxW = 96;
  const noteX = boxX + boxW + 8;
  let y = 4;
  const placed = rows.map((r) => {
    const groupY = r.group !== undefined ? y : undefined;
    if (r.group !== undefined) y += 16;
    const at = y;
    if (!r.heading) y += ROW;
    return { r, at, groupY };
  });
  const H = y + 2;
  // A row's note, then the arrows from its registers; where both do not fit, the arrows first.
  const pointerText = (r: BoxRow) => `← ${r.pointers.join(", ")}`;
  const arrowsFirst = (r: BoxRow) =>
    r.note !== undefined &&
    r.pointers.length > 0 &&
    noteX + r.note.length * CHAR + 10 + pointerText(r).length * CHAR > W - 4;
  const pointerX = (r: BoxRow) => {
    if (arrowsFirst(r)) return noteX;
    const after = noteX + (r.note ? r.note.length * CHAR + 10 : 0);
    return Math.min(after, W - 4 - pointerText(r).length * CHAR);
  };
  const noteAt = (r: BoxRow) =>
    arrowsFirst(r) ? noteX + pointerText(r).length * CHAR + 10 : noteX;
  return (
    <div className="word-boxes" ref={ref}>
      <svg
        className="memory-boxes"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
      >
        {placed.map(({ r, at, groupY }, i) => (
          <g
            key={r.heading ? `heading-${i}` : r.address}
            className={`box-row${r.changed ? " box-changed" : ""}${r.past ? " box-past" : ""}`}
          >
            {r.past && i === placed.findIndex((p) => p.r.past) && (
              <line className="box-end" x1={addrX} x2={W - 4} y1={at} y2={at} />
            )}
            {groupY !== undefined && (
              <text className="box-group" x={addrX} y={groupY + 12}>
                {r.group}
              </text>
            )}
            {!r.heading && (
              <text className="box-address" x={addrX} y={at + 13}>
                {hex3(r.address)}
              </text>
            )}
            {!r.empty && (
              <>
                <rect
                  className="box-word"
                  x={boxX}
                  y={at + 1}
                  width={boxW}
                  height={ROW - 2}
                  rx={3}
                />
                <text className="box-value" x={boxX + boxW / 2} y={at + 13} textAnchor="middle">
                  {r.value === undefined ? signedText(r.value) : valueText(r.value)}
                </text>
              </>
            )}
            {r.note && (
              <text className="box-note" x={noteAt(r)} y={at + 13}>
                {r.note}
              </text>
            )}
            {r.pointers.length > 0 && (
              <text className="box-pointer" x={pointerX(r)} y={at + 13}>
                {pointerText(r)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {(keyAlways || rows.some((r) => r.changed)) && (
        <p
          className="word-boxes-key"
          style={rows.some((r) => r.changed) ? undefined : { visibility: "hidden" }}
        >
          {t.boxes.changed}
        </p>
      )}
    </div>
  );
}

/** The registers that hold an address, by name. */
const pointersAt = (state: DebugState, address: number) =>
  state.cpu.regs
    .map((v, k) => (v === BigInt(address) ? `R${k}` : undefined))
    .filter((x): x is string => x !== undefined);

/** The word the last step stored to, if any. */
const storedAt = (state: DebugState) =>
  state.last?.memory?.store && !state.last.trap && !state.last.stopped
    ? Number(state.last.memory.address)
    : undefined;

/** A region of memory as boxes: the log, with R1 moving along it. */
export function MemoryBoxes({
  first,
  words,
  title,
  state,
  names,
  ends,
}: {
  first: number;
  words: number;
  title: string;
  state: DebugState;
  names: Map<number, string>;
  /** Where the list ends: the words after it drawn dashed, the first with the note. */
  ends?: { readonly after: number; readonly note: string };
}) {
  const t = useViewStrings().machine11;
  const changedAt = storedAt(state);
  const rows: BoxRow[] = Array.from({ length: words }, (_, k) => {
    const address = first + 8 * k;
    const past = ends !== undefined && k >= ends.after;
    const note = names.get(address);
    // The first word past the list's end carries the note as a heading over the words after it.
    const heading = past && k === ends.after ? { group: ends.note } : {};
    return {
      address,
      value: memoryWord(state.cpu, address),
      ...(note ? { note } : {}),
      ...(past ? { past } : {}),
      ...heading,
      pointers: pointersAt(state, address),
      changed: address === changedAt,
    };
  });
  return <WordBoxes rows={rows} label={format(t.boxes.label, { title })} />;
}

/**
 * The stack as boxes, R14's word first, as the lesson's lists put it: words a pop has passed (no
 * longer on the stack, but still in the RAM, where a push stored them) set apart above, then R14's
 * place, then the stack's words grouped by the call that pushed them, the innermost call first.
 */
export function StackBoxes({ state, names }: { state: DebugState; names: Map<number, string> }) {
  const t = useViewStrings().machine11;
  const changedAt = storedAt(state);
  const sp = state.cpu.regs[14];
  const callName = (frame: number) => {
    const c = state.calls[frame];
    if (!c) return t.frameMain;
    return format(t.frameCall, {
      name: names.get(Number(c.to)) ?? hex3(c.to),
      address: hex3(c.at),
    });
  };
  const saves = (address: number) => {
    const reg = state.saved?.[address];
    return reg !== undefined ? { note: format(t.boxes.saves, { reg: `R${reg}` }) } : {};
  };
  const rows: BoxRow[] = [];
  // R14's place when no push has stored its word yet: its address and the arrow, no box.
  const onWord = sp !== undefined && state.pushed.some((a) => BigInt(a) === sp);
  // At 7C0, where the stack is empty, R14's place is drawn while popped words are: the arrow
  // does not vanish with the last pop.
  const popped = sp !== undefined && state.pushed.some((a) => BigInt(a) < sp);
  const place: BoxRow | undefined =
    sp !== undefined && !onWord && sp >= 0x400n && (sp < 0x7c0n || (sp === 0x7c0n && popped))
      ? { address: Number(sp), value: undefined, pointers: ["R14"], changed: false, empty: true }
      : undefined;
  // At 7C0, past the RAM, R14's place stands first, apart from the popped words' heading; below
  // 7C0 it stands where its address falls, after them and above the stack's words.
  if (place && sp === 0x7c0n) rows.push(place);
  // Words a push stored below R14: popped, set apart.
  if (sp !== undefined)
    state.pushed
      .filter((a) => BigInt(a) < sp)
      .forEach((a, k) =>
        rows.push({
          address: a,
          value: memoryWord(state.cpu, a),
          ...saves(a),
          pointers: [],
          changed: a === changedAt,
          past: true,
          ...(k === 0 ? { group: t.boxes.popped } : {}),
        }),
      );
  if (place && sp !== 0x7c0n) rows.push(place);
  for (const item of stackGroups(state, names)) {
    const heading =
      item.kind === "fold"
        ? format(t.stackFolded, {
            n: item.n,
            name: callName(item.group.frame),
            words: item.n * item.group.rows.length,
          })
        : callName(item.group.frame);
    if (item.kind === "fold") {
      // A run of like calls folded: its heading alone.
      rows.push({
        address: -1,
        value: undefined,
        pointers: [],
        changed: false,
        group: heading,
        empty: true,
        heading: true,
      });
      continue;
    }
    item.group.rows.forEach((w, k) =>
      rows.push({
        address: w.address,
        value: w.value,
        ...saves(w.address),
        pointers: sp !== undefined && BigInt(w.address) === sp ? ["R14"] : [],
        changed: w.address === changedAt,
        ...(k === 0 ? { group: heading } : {}),
      }),
    );
  }
  if (rows.length === 0) return null;
  return <WordBoxes rows={rows} label={t.boxes.stackLabel} keyAlways />;
}

/** A room of the cold store, from its three words: the reading, then the two doors. */
interface Room {
  readonly address: number;
  readonly name: string;
  readonly reading: bigint | undefined;
  readonly doors: readonly number[];
  readonly depth: number;
  readonly parent?: number;
  /** A door to a room drawn already: drawn as a name, not again. */
  readonly again?: boolean;
}

/** The rooms reachable from the hall, each once, in the order a walk through the doors meets them. */
export function roomsFrom(state: DebugState, program: Program, hall: number): Room[] {
  const names = new Map<number, string>();
  for (const [name, at] of Object.entries(program.labels)) if (!names.has(at)) names.set(at, name);
  const out: Room[] = [];
  const seen = new Set<number>();
  const visit = (address: number, depth: number, parent?: number) => {
    const doors = [8, 16].map((d) => Number(memoryWord(state.cpu, address + d) ?? 0n));
    const room: Room = {
      address,
      name: names.get(address) ?? hex3(address),
      reading: memoryWord(state.cpu, address),
      doors,
      depth,
      ...(parent !== undefined ? { parent } : {}),
      ...(seen.has(address) ? { again: true } : {}),
    };
    out.push(room);
    if (seen.has(address) || out.length > 40) return;
    seen.add(address);
    for (const d of doors) if (d !== 0) visit(d, depth + 1, address);
  };
  visit(hall, 0);
  return out;
}

/**
 * The return points of a function's calls of itself, in the order its lines make them: where a
 * call through each door comes back to. A call line whose target is a label at or above it is a
 * function calling itself (11.5's `warmRooms`, behind its first door, then its second).
 */
export function doorReturns(program: Program): number[] {
  return selfCalls(program).map((c) => c.back);
}

/** Each call of a function by itself: its target and the line it comes back to. */
function selfCalls(program: Program): { target: number; back: number }[] {
  const out: { target: number; back: number }[] = [];
  program.lines.forEach((l, i) => {
    const m = /^call\s+(\w+)/.exec(l.text.trim());
    const target = m ? program.labels[m[1]!] : undefined;
    const next = program.lines[i + 1];
    if (target !== undefined && target <= l.address && next)
      out.push({ target, back: next.address });
  });
  return out;
}

/**
 * The lines a call about no room runs: the function's first two lines, which find R1 at 0 and
 * branch, and the two lines the branch goes to, which give 0 and go back. While the PC is on one of
 * them with R1 at 0, the call is about the door it came through.
 */
export function noRoomLines(program: Program): Set<number> {
  const entry = selfCalls(program)[0]?.target;
  const at = (address: number) => program.lines.findIndex((l) => l.address === address);
  const k = entry === undefined ? -1 : at(entry);
  const test = program.lines[k + 1];
  const to = /goto\s+(\w+)/.exec(test?.text ?? "")?.[1];
  const none = to !== undefined ? program.labels[to] : undefined;
  const j = none === undefined ? -1 : at(none);
  return new Set(
    [program.lines[k], test, program.lines[j], program.lines[j + 1]]
      .filter((l) => l !== undefined && k >= 0 && j >= 0)
      .map((l) => l!.address),
  );
}

/**
 * The cold store as rooms and doors, the room R1 names lit. Where R1 holds 0, a call about a door
 * that leads nowhere, the door it followed is marked: the room R10 still holds, the caller's, and
 * the door R15's return point names. `still` is a figure with no run, whose key says only what the
 * boxes and circles are.
 */
export function RoomsDrawing({
  state,
  program,
  hall,
  still = false,
}: {
  state: DebugState;
  program: Program;
  hall: number;
  still?: boolean;
}) {
  const t = useViewStrings().machine11;
  const [ref, width] = useWidth<HTMLDivElement>(420);
  const rooms = roomsFrom(state, program, hall);
  const W = Math.max(260, Math.min(width, 520));
  const indent = 22;
  const rowH = 32;
  const lit = still ? undefined : state.cpu.regs[1];
  const returns = doorReturns(program);
  // Only while a call about no room runs, from its pause to its `goto R15`: between pauses R1,
  // R10 and R15 hold other words, and a ring there would name a door no call came through.
  const noRoom = noRoomLines(program).has(Number(state.cpu.pc));
  const door =
    !still && lit === 0n && noRoom && returns.length === 2
      ? returns.indexOf(Number(state.cpu.regs[15] ?? -1n))
      : -1;
  const doorRoom = door >= 0 ? state.cpu.regs[10] : undefined;
  const label = (r: Room) => `${r.name} ${signedText(r.reading)}`;
  const boxW = Math.max(...rooms.map((r) => label(r).length)) * CHAR + 14;
  const ys = rooms.map((_, i) => 6 + i * rowH);
  const H = 6 + rooms.length * rowH + 4;
  // The row a room's door leads from: its parent's, the last one above it a level up.
  const parentRow = (i: number) => {
    const depth = rooms[i]!.depth;
    for (let k = i - 1; k >= 0; k--) if (rooms[k]!.depth === depth - 1) return k;
    return 0;
  };
  const litRoom = rooms.find((r) => !r.again && lit !== undefined && lit === BigInt(r.address));
  const doorOf = rooms.find(
    (r) => !r.again && doorRoom !== undefined && doorRoom === BigInt(r.address),
  );
  const said = [
    t.boxes.roomsLabel,
    ...(litRoom ? [format(t.boxes.roomLit, { name: litRoom.name })] : []),
    ...(doorOf ? [format(t.boxes.doorFollowed, { name: doorOf.name, door: door + 1 })] : []),
  ].join(". ");
  // Where the drawing sits in a short box (a phone's debugger), the box keeps the marked room in view.
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    // The room's own box, or the ringed door: not the line drawn up to it from the room above.
    const mark = box?.querySelector<SVGGraphicsElement>(
      ".room-lit .room-box, .room-door-followed circle",
    );
    if (!box || !mark || box.scrollHeight <= box.clientHeight) return;
    const top = mark.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = Math.max(0, top - 1);
  });
  return (
    <div className="store-rooms-figure" ref={ref}>
      <div className="store-rooms-box" ref={boxRef}>
        <svg
          className="store-rooms"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={said}
        >
          {rooms.map((r, i) => {
            const x = 4 + r.depth * indent;
            const y = ys[i]!;
            const doorX = x + boxW + 12;
            const isLit = !r.again && lit !== undefined && lit === BigInt(r.address);
            return (
              <g key={`${r.address}-${i}`} className={isLit ? "room room-lit" : "room"}>
                {r.parent !== undefined && (
                  <path
                    className="room-door-line"
                    d={`M ${x - indent + 8} ${ys[parentRow(i)]! + 24} V ${y + 12} H ${x}`}
                    fill="none"
                  />
                )}
                <rect className="room-box" x={x} y={y} width={boxW} height={24} rx={4} />
                <text className="room-name" x={x + 7} y={y + 16}>
                  {r.again ? format(t.boxes.roomAgain, { name: r.name }) : label(r)}
                </text>
                {!r.again &&
                  r.doors.map((d, k) => (
                    <g
                      key={k}
                      className={`room-door${d === 0 ? " room-door-none" : ""}${r === doorOf && k === door ? " room-door-followed" : ""}`}
                    >
                      <circle cx={doorX + k * 22} cy={y + 12} r={6} />
                      <text x={doorX + k * 22} y={y + 16} textAnchor="middle">
                        {d === 0 ? "0" : String(k + 1)}
                      </text>
                    </g>
                  ))}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="word-boxes-key">{still ? t.boxes.roomsKeyStill : t.boxes.roomsKey}</p>
    </div>
  );
}
