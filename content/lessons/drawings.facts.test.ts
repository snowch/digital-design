// Copyright © 2026 Christopher Snow

// What the figures pass for Modules 11 and 12 draws, read off the machine's own runs: the moves
// of each run drawn as lanes, the rooms of 11.5's cold store, and the stack's words in 11.4. The
// leads and the prose say these; a change to the model changes them here first.

import { describe, expect, it } from "vitest";

import {
  QUIET_INPUTS,
  assembleChecked,
  debugStart,
  debugStep,
  timelineRun,
  type InputPlan,
} from "@dd/dd-model";
import { laneNames, lanesOf, roomsFrom, type LaneItem } from "@dd/dd-views";
import { parseLesson, type LessonInput } from "@platform/lesson-schema";

import { functions } from "./functions";
import { interrupts } from "./interrupts";
import { nesting } from "./nesting";
import { recursion } from "./recursion";
import { stack as stackLesson } from "./stack";
import { systemCallMechanism } from "./system-call-mechanism";
import { systemCalls } from "./system-calls";
import { traps } from "./traps";

/** A figure's props, by its lesson and id. */
const propsOf = (lesson: LessonInput, id: string) =>
  parseLesson(lesson)
    .sections.flatMap((s) => s.interactives)
    .find((x) => x.id === id)!.props as never;

/** The moves a figure's run draws, each as "from → to: what it writes". */
function moves(lesson: LessonInput, id: string, limit = 400): string[] {
  const p = propsOf(lesson, id) as {
    program: string;
    inputs?: Record<string, string>;
    doorOpensAt?: number;
    lanes: {
      lanes: { at: string; name: string; handler?: boolean }[];
      again?: string;
      marks?: string[];
    };
  };
  const plan: InputPlan = {
    ...QUIET_INPUTS,
    ...(p.inputs?.["SENSORA"] ? { sensorA: BigInt(p.inputs["SENSORA"]) } : {}),
    ...(p.inputs?.["SENSORB"] ? { sensorB: BigInt(p.inputs["SENSORB"]) } : {}),
    ...(p.doorOpensAt !== undefined ? { doorOpensAt: p.doorOpensAt } : {}),
  };
  const { program, edges } = timelineRun(p.program, plan, limit);
  const names = laneNames(p.lanes);
  return lanesOf(edges, program!, p.lanes)
    .filter((it): it is Exclude<LaneItem, { kind: "stay" }> => it.kind !== "stay")
    .map((it) =>
      it.kind === "move"
        ? `${names[it.from]} → ${names[it.to]}: ${it.label}`
        : `${names[it.lane]}: ${it.what}${it.label ? ` ${it.label}` : ""}`,
    );
}

/** Lane names without the page's words: the figure's own names stand in for them. */
const plain = (list: readonly string[], names: Record<string, string>) =>
  list.map((m) => Object.entries(names).reduce((t, [from, to]) => t.split(from).join(to), m));

describe("what the figures pass draws", () => {
  it("11.3: two calls of overBy, R15 taking 00C then 01C, each goto R15 back after its call", () => {
    const names = laneNames(
      (propsOf(functions, "call-and-return") as never as { lanes: never }).lanes,
    );
    expect(plain(moves(functions, "call-and-return"), { [names[0]!]: "main" })).toEqual([
      "main → overBy: R15 ← 00C",
      "overBy → main: PC ← 00C",
      "main → overBy: R15 ← 01C",
      "overBy → main: PC ← 01C",
    ]);
  });

  const MODULE_12_NAMES = (lesson: LessonInput, id: string) => {
    const l = (
      propsOf(lesson, id) as never as { lanes: { lanes: { name: string }[]; again?: string } }
    ).lanes;
    const keys = ["start", "handler", "program", "again"];
    return Object.fromEntries(
      [...l.lanes.map((x) => x.name), ...(l.again ? [l.again] : [])].map((n, k) => [
        n,
        l.lanes.length === 2 ? ["program", "handler"][k]! : (keys[k] ?? n),
      ]),
    );
  };

  it("12.1: the store traps with C2 014 and C3 34, and the handler resumes it at 018", () => {
    expect(plain(moves(traps, "night-timeline"), MODULE_12_NAMES(traps, "night-timeline"))).toEqual(
      ["program → handler: C2 ← 014, C3 ← 34", "handler → program: PC ← 018"],
    );
  });

  it("12.4: three calls cross to the handler and back to the line after each call", () => {
    expect(
      plain(moves(systemCalls, "calls-timeline"), MODULE_12_NAMES(systemCalls, "calls-timeline")),
    ).toEqual([
      "start → program: PC ← 05C",
      "program → handler: C2 ← 070, C3 ← 41",
      "handler → program: PC ← 070",
      "program → handler: C2 ← 07C, C3 ← 41",
      "handler → program: PC ← 07C",
      "program → handler: C2 ← 084, C3 ← 41",
    ]);
  });

  it("12.5: the door arrives in the program, its interrupt with C2 0B0; then the timer's", () => {
    expect(
      plain(moves(interrupts, "door-timeline"), MODULE_12_NAMES(interrupts, "door-timeline")),
    ).toEqual([
      "start → program: PC ← 0A4",
      "program: door",
      "program → handler: C2 ← 0B0, C3 ← 82",
      "handler → program: PC ← 0B0",
      "program: timer",
      "program → handler: C2 ← 0B0, C3 ← 81",
      "handler → program: PC ← 0B0",
      "program → handler: C2 ← 0BC, C3 ← 41",
      "handler → program: PC ← 0BC",
      "program → handler: C2 ← 0C4, C3 ← 41",
    ]);
  });

  it("12.6: the handler's load traps while C2 holds 07C, into a third lane, C2 taking 048", () => {
    expect(
      plain(moves(nesting, "fault-timeline", 42), MODULE_12_NAMES(nesting, "fault-timeline")),
    ).toEqual([
      "start → program: PC ← 068",
      "program → handler: C2 ← 07C, C3 ← 41",
      "handler → again: C2 ← 048, C3 ← 31",
      "again → handler: PC ← 04C",
    ]);
  });

  it("12.6: job 5 saves C1 at 410 and C2 at 418 before the door and the timer come in", () => {
    const m = plain(moves(nesting, "nest-saved"), MODULE_12_NAMES(nesting, "nest-saved"));
    expect(m.slice(3, 13)).toEqual([
      "program → handler: C2 ← 10C, C3 ← 41",
      "handler: store word[410] ← 2",
      "handler: store word[418] ← 268 10C",
      "handler: door",
      "handler → again: C2 ← 088, C3 ← 82",
      "again → handler: PC ← 088",
      "handler: timer",
      "handler → again: C2 ← 088, C3 ← 81",
      "again → handler: PC ← 088",
      "handler → program: PC ← 10C",
    ]);
  });

  it("12.8: run 2's first program faults, the handler starts the second, which ends with job 4", () => {
    const names = MODULE_12_NAMES(systemCallMechanism, "shop-lanes");
    const l = (
      propsOf(systemCallMechanism, "shop-lanes") as never as {
        lanes: { lanes: { name: string }[] };
      }
    ).lanes.lanes;
    const shown = { ...names, [l[2]!.name]: "first", [l[3]!.name]: "second" };
    expect(plain(moves(systemCallMechanism, "shop-lanes", 300), shown)).toEqual([
      "start → first: PC ← 0F8",
      "first → handler: C2 ← 0FC, C3 ← 32",
      "handler → start: PC ← 010",
      "start → second: PC ← 108",
      "second → handler: C2 ← 114, C3 ← 41",
      "handler → second: PC ← 114",
      "second → handler: C2 ← 11C, C3 ← 41",
      "handler → start: PC ← 010",
    ]);
  });

  it("11.5: six rooms from the hall, twelve doors, five to a room and seven to nowhere", () => {
    const p = assembleChecked(
      (propsOf(recursion, "frames") as { program: string }).program,
    ).program!;
    const rooms = roomsFrom(debugStart(p.rom), p, p.labels["hall"]!);
    expect(
      rooms.map(
        (r) => `${r.depth} ${r.name} ${BigInt.asIntN(64, r.reading ?? 0n)} ${r.doors.join(",")}`,
      ),
    ).toEqual([
      "0 hall -150 184,208",
      "1 prep -175 0,0",
      "1 vault -190 232,256",
      "2 chillA -182 280,0",
      "3 icebox -178 0,0",
      "2 chillB -205 0,0",
    ]);
    const doors = rooms.flatMap((r) => r.doors);
    expect([doors.length, doors.filter((d) => d !== 0).length]).toEqual([12, 5]);
  });

  it("11.4: while overBy first runs, 7B8 saves R15 and 7B0 saves R10, R14 at 7B0", () => {
    const p = assembleChecked(
      (propsOf(stackLesson, "pushed") as { program: string }).program,
    ).program!;
    let st = debugStart(p.rom);
    const plan = { ...QUIET_INPUTS, sensorA: -170n, sensorB: -190n };
    while (st.cpu.pc !== BigInt(p.labels["overBy"]!)) st = debugStep(st, plan);
    expect([st.pushed, st.saved, st.cpu.regs[14]]).toEqual([
      [0x7b0, 0x7b8],
      { 0x7b0: 10, 0x7b8: 15 },
      0x7b0n,
    ]);
  });
});
