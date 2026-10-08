// Copyright © 2026 Christopher Snow

// Memory drawn as boxes (Modules 11 and 12): words at their addresses, the registers that hold
// an address as arrows into them, and the word the last step changed outlined; the stack drawn
// the same way, its words grouped by the call that pushed them and each marked with the register
// it saves; and Module 11's cold store drawn as rooms, each with its two doors, from the room
// words in memory, the room the current call names lit. Each is a view of the debugger's state,
// stepped with it: nothing here runs the program.

import { memoryWord, type DebugState, type Program } from "@dd/dd-model";

import { format, useViewStrings } from "../strings";
import { useWidth } from "../useWidth";
import { hex3, signedText, stackGroups, valueText } from "./Debugger";

const CHAR = 7.3;
const ROW = 18;

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
}

function WordBoxes({ rows, label }: { rows: readonly BoxRow[]; label: string }) {
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
    if (r.group !== undefined) y += 20;
    const at = y;
    y += ROW;
    return { r, at, groupY };
  });
  const H = y + 4;
  const pointerX = (r: BoxRow) => {
    const after = noteX + (r.note ? r.note.length * CHAR + 10 : 0);
    const text = `← ${r.pointers.join(", ")}`;
    return Math.min(after, W - 4 - text.length * CHAR);
  };
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
        {placed.map(({ r, at, groupY }) => (
          <g key={r.address} className={r.changed ? "box-row box-changed" : "box-row"}>
            {groupY !== undefined && (
              <text className="box-group" x={addrX} y={groupY + 14}>
                {r.group}
              </text>
            )}
            <text className="box-address" x={addrX} y={at + 13}>
              {hex3(r.address)}
            </text>
            <rect className="box-word" x={boxX} y={at + 1} width={boxW} height={ROW - 2} rx={3} />
            <text className="box-value" x={boxX + boxW / 2} y={at + 13} textAnchor="middle">
              {r.value === undefined ? signedText(r.value) : valueText(r.value)}
            </text>
            {r.note && (
              <text className="box-note" x={noteX} y={at + 13}>
                {r.note}
              </text>
            )}
            {r.pointers.length > 0 && (
              <text className="box-pointer" x={pointerX(r)} y={at + 13}>
                {`← ${r.pointers.join(", ")}`}
              </text>
            )}
          </g>
        ))}
      </svg>
      {rows.some((r) => r.changed) && <p className="word-boxes-key">{t.boxes.changed}</p>}
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
}: {
  first: number;
  words: number;
  title: string;
  state: DebugState;
  names: Map<number, string>;
}) {
  const t = useViewStrings().machine11;
  const changedAt = storedAt(state);
  const rows: BoxRow[] = Array.from({ length: words }, (_, k) => {
    const address = first + 8 * k;
    return {
      address,
      value: memoryWord(state.cpu, address),
      ...(names.get(address) ? { note: names.get(address) } : {}),
      pointers: pointersAt(state, address),
      changed: address === changedAt,
    };
  });
  return <WordBoxes rows={rows} label={format(t.boxes.label, { title })} />;
}

/** The stack as boxes, from the top of the RAM down to R14, grouped by call. */
export function StackBoxes({ state, names }: { state: DebugState; names: Map<number, string> }) {
  const t = useViewStrings().machine11;
  const changedAt = storedAt(state);
  const callName = (frame: number) => {
    const c = state.calls[frame];
    if (!c) return t.frameMain;
    return format(t.frameCall, {
      name: names.get(Number(c.to)) ?? hex3(c.to),
      address: hex3(c.at),
    });
  };
  const rows: BoxRow[] = [];
  for (const item of stackGroups(state, names)) {
    // The words of each group from the highest address down, as the stack grows.
    const words = [...item.group.rows].sort((a, b) => b.address - a.address);
    words.forEach((w, k) => {
      const reg = state.saved?.[w.address];
      rows.push({
        address: w.address,
        value: w.value,
        ...(reg !== undefined ? { note: format(t.boxes.saves, { reg: `R${reg}` }) } : {}),
        pointers: pointersAt(state, w.address).filter((p) => p === "R14"),
        changed: w.address === changedAt,
        ...(k === 0
          ? {
              group:
                item.kind === "fold"
                  ? format(t.stackFolded, {
                      n: item.n,
                      name: callName(item.group.frame),
                      words: item.n * item.group.rows.length,
                    })
                  : callName(item.group.frame),
            }
          : {}),
      });
    });
  }
  // Highest address first: the stack's bottom at the top of the drawing, growing down.
  const ordered = rows;
  if (ordered.length === 0) return null;
  return <WordBoxes rows={ordered} label={t.boxes.stackLabel} />;
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

/** The cold store as rooms and doors, the room R1 names lit. */
export function RoomsDrawing({
  state,
  program,
  hall,
}: {
  state: DebugState;
  program: Program;
  hall: number;
}) {
  const t = useViewStrings().machine11;
  const [ref, width] = useWidth<HTMLDivElement>(420);
  const rooms = roomsFrom(state, program, hall);
  const W = Math.max(260, Math.min(width, 520));
  const indent = 22;
  const rowH = 32;
  const lit = state.cpu.regs[1];
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
  return (
    <div className="store-rooms-figure" ref={ref}>
      <svg
        className="store-rooms"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t.boxes.roomsLabel}
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
                  <g key={k} className={d === 0 ? "room-door room-door-none" : "room-door"}>
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
      <p className="word-boxes-key">{t.boxes.roomsKey}</p>
    </div>
  );
}
