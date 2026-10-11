// Copyright © 2026 Christopher Snow

// The numbers the kernel chapter states, read off the model (MODULE_12, the debugger's runs): 12.8's
// runner stuck on the gap program, the kernel's run at a count of 80 and of 40, the switch's length,
// the prediction's answer, the construction's moment, the challenge's runs and the attempts each
// catches, and the links out of the course.

import { describe, expect, it } from "vitest";

import {
  assemble,
  debugStart,
  debugStep,
  gradeProgramCase,
  memoryWord,
  runScenario,
  MODULE_12,
  QUIET_INPUTS,
  type DebugState,
} from "@dd/dd-model";
import { DEFAULT_VIEW_STRINGS, debuggerAnswer } from "@dd/dd-views";

import {
  KERNEL_REFERENCE,
  KERNEL_RUNS,
  KERNEL_START,
  SHOP_READINGS,
  kernel,
  kernelStart,
  kernelText,
} from "./beyond";
import { BACK_TO_GAP, RUNNER_TWO, SAVE_ANSWERS, kernelLesson } from "./kernel";
import { PROSE } from "./kernel.prose";

const inputs = { sensorA: BigInt(SHOP_READINGS.sensorA), sensorB: BigInt(SHOP_READINGS.sensorB) };
const run = (source: string) => runScenario(source, { traps: true, inputs }).state!;
const ticks = (s: DebugState) => s.traps.filter((t) => t.cause === 0x81);
const figure = (id: string) =>
  kernelLesson.sections.flatMap((x) => x.interactives ?? []).find((f) => f.id === id)!;
const signed = (v: bigint | undefined) => (v === undefined ? "X" : BigInt.asIntN(64, v).toString());

describe("12.8's runner on the two programs", () => {
  it("shows the gap 94 times, never starts the report, and is cut off", () => {
    const s = run(RUNNER_TWO);
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect(s.shown).toHaveLength(94);
    expect([memoryWord(s.cpu, 0x400), memoryWord(s.cpu, 0x408)]).toEqual([undefined, undefined]);
  });
});

describe("the kernel at a count of 80", () => {
  const s = run(kernelText());
  const labels = assemble(kernelText()).labels;

  it("lets both programs get on: 53 timer interrupts, 65 gaps, the report's 2 and ALARM", () => {
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect(ticks(s)).toHaveLength(53);
    expect(s.shown).toHaveLength(65);
    expect(new Set(s.shown.map(String))).toEqual(new Set(["66"]));
    expect([memoryWord(s.cpu, 0x640), memoryWord(s.cpu, 0x630), s.cpu.lamps]).toEqual([2n, 0n, 1]);
  });

  it("is 96 lines with a start of 17", () => {
    // Each line that makes an instruction: not blank, not only a comment.
    const lines = (text: string) =>
      text.split("\n").filter((l) => l.replace(/\/\/.*$/, "").trim() !== "").length;
    expect(lines(kernelStart())).toBe(17);
    expect(lines(kernel())).toBe(96);
  });

  it("takes its first timer interrupt after 97, before goto gap, and stores that address at 588", () => {
    const [first, second, third] = ticks(s);
    expect(first!.after).toBe(97);
    expect(first!.at).toBe(BigInt(labels["gap"]! + 40));
    // The second comes in the report, with its own R5 at 0; the third before R2 <= R5 - R1.
    expect(first!.at < BigInt(labels["report"]!)).toBe(true);
    expect(second!.at >= BigInt(labels["report"]!)).toBe(true);
    expect(signed(second!.regs[5])).toBe("0");
    expect(third!.after).toBe(289);
    expect(third!.at).toBe(BigInt(labels["gap"]! + 28));
    expect(signed(third!.regs[5])).toBe("-184");
    let t = debugStart(assemble(kernelText()).rom);
    while (ticks(t).length === 0 || t.cpu.pc !== BigInt(labels["load"]!))
      t = debugStep(t, { ...QUIET_INPUTS, ...inputs }, MODULE_12);
    expect(memoryWord(t.cpu, 0x588)).toBe(first!.at);
  });

  it("switches in 60 instructions, 51 after the timer's write, so a turn is 29 at 80", () => {
    const [first, second] = ticks(s);
    expect(second!.after - first!.after).toBe(60 + 29);
    // From the trap to the write to the timer: 9 instructions, counted from tick's first line.
    const kernelLines = kernelText().split("\n");
    const tickAt = kernelLines.findIndex((l) => l.startsWith("tick:"));
    const timerAt = kernelLines.findIndex((l, i) => i > tickAt && l.includes("word[timer] <= R8"));
    const handlerHead = 5; // the handler's lines from its first to `if R9 == R8 goto tick`
    expect(handlerHead + (timerAt - tickAt + 1)).toBe(9);
  });

  it("answers the prediction: R5 is -184 when the gap program next runs R2 <= R5 - R1", () => {
    const props = figure("predict-r5").props as Parameters<typeof debuggerAnswer>[0];
    expect(props).toMatchObject({ ask: { after: BACK_TO_GAP } });
    expect(debuggerAnswer(props)).toBe("-184");
    let t = debugStart(assemble(kernelText()).rom);
    for (let i = 0; i < BACK_TO_GAP; i++)
      t = debugStep(t, { ...QUIET_INPUTS, ...inputs }, MODULE_12);
    expect(t.cpu.pc).toBe(BigInt(labels["gap"]! + 28));
    expect(ticks(t)).toHaveLength(4);
  });
});

describe("the kernel at a count of 40", () => {
  it("never shows the gap: 83 timer interrupts, cut off; 51 does the same and 52 does not", () => {
    const s = run(kernelText(40));
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect(ticks(s)).toHaveLength(83);
    expect(s.shown).toHaveLength(0);
    expect(debuggerAnswer(figure("too-short").props as Parameters<typeof debuggerAnswer>[0])).toBe(
      "0",
    );
    expect(run(kernelText(51)).shown).toHaveLength(0);
    expect(run(kernelText(52)).shown.length).toBeGreaterThan(0);
  });
});

describe("the construction's moment", () => {
  it("is on no figure: no run on the page stops the report before 210", () => {
    const labels = assemble(kernelText()).labels;
    expect(labels["report"]! + 32).toBe(0x210);
    for (const count of [80, 40])
      expect(ticks(run(kernelText(count))).some((t) => t.at === 0x210n)).toBe(false);
  });

  it("stores 210, R13 at 608 and C1 as 10 when the timer stops the report there", () => {
    // A count that stops the report before R11 <= R11 - 1, at 210.
    const count = [...Array(80).keys()]
      .map((k) => k + 52)
      .find((c) => ticks(run(kernelText(c))).some((t) => t.at === 0x210n))!;
    expect(count).toBeDefined();
    let t = debugStart(assemble(kernelText(count)).rom);
    const labels = assemble(kernelText(count)).labels;
    let stopped = false;
    while (!(stopped && t.cpu.pc === BigInt(labels["load"]!))) {
      t = debugStep(t, { ...QUIET_INPUTS, ...inputs }, MODULE_12);
      if (t.traps.at(-1)?.at === 0x210n) stopped = true;
    }
    const at = (id: string) => SAVE_ANSWERS.find((a) => a.id === id)!.value;
    expect(memoryWord(t.cpu, 0x628)!.toString(16)).toBe(at("c2"));
    expect(memoryWord(t.cpu, parseInt(at("r13"), 16))).toBe(t.traps.at(-1)!.regs[13]);
    expect(memoryWord(t.cpu, 0x620)!.toString(2)).toBe(at("c1"));
    for (const a of SAVE_ANSWERS)
      expect(DEFAULT_VIEW_STRINGS.answers.details[a.detail]).toBeTruthy();
  });
});

describe("the kernel chapter's challenge", () => {
  const grade = (source: string) =>
    KERNEL_RUNS.map(
      (r) =>
        gradeProgramCase(
          source,
          { traps: "yes", data: r.data, ...SHOP_READINGS },
          {
            shown: r.shown,
            "word:590": r.records[0],
            "word:630": r.records[1],
            C1: "10",
            end: "stop",
            stopAt: "handler",
          },
        ).pass,
    );
  const swap = (from: string, to: string) => {
    expect(KERNEL_REFERENCE).toContain(from);
    return KERNEL_REFERENCE.replace(from, to);
  };
  const ARGS =
    "        R1 <= secondLog\n        word[0x5A8] <= R1       // its R1: the address of its readings\n        R1 <= word[secondCount]\n        word[0x5B0] <= R1       // its R2: how many readings\n";

  it("passes all three runs with the reference, and fails all three from its starting point", () => {
    expect(grade(KERNEL_REFERENCE)).toEqual([true, true, true]);
    expect(grade(KERNEL_START)).toEqual([false, false, false]);
  });

  it("fails each plausible wrong attempt in at least one run", () => {
    const attempts = {
      argsInStart: swap(ARGS, "").replace(
        "        goto load\nhandler",
        "        R1 <= secondLog\n        R2 <= word[secondCount]\n        goto load\nhandler",
      ),
      argsFirstArea: swap(ARGS, ARGS.replace("0x5A8", "0x508").replace("0x5B0", "0x510")),
      noArgs: swap(ARGS, ""),
      countAddress: swap("R1 <= word[secondCount]", "R1 <= secondCount"),
      swapped: swap(
        ARGS,
        ARGS.replace("0x5A8", "0xT").replace("0x5B0", "0x5A8").replace("0xT", "0x5B0"),
      ),
      sharedStack: swap("R1 <= 0x700\n", "R1 <= 0x7C0\n"),
      interruptsOff: swap(
        "        R1 <= 2\n        word[0x620]",
        "        R1 <= 0\n        word[0x620]",
      ),
      systemMode: swap(
        "        R1 <= 2\n        word[0x620]",
        "        R1 <= 3\n        word[0x620]",
      ),
      skipsFirst: swap("R1 <= second\n", "R1 <= second + 4\n"),
      noStack: swap("        R1 <= 0x700\n        word[0x610] <= R1       // its R14\n", ""),
    };
    expect(grade(attempts.sharedStack)).toEqual([true, false, true]);
    expect(grade(attempts.interruptsOff)).toEqual([true, false, true]);
    expect(grade(attempts.systemMode)).toEqual([true, false, false]);
    expect(grade(attempts.noStack)).toEqual([true, false, true]);
    for (const [name, text] of Object.entries(attempts))
      expect(grade(text).every(Boolean), name).toBe(false);
  });

  it("has a sentence for its runs and for how they must end", () => {
    expect(DEFAULT_VIEW_STRINGS.beyond.details["kernelSetUp"]).toBeTruthy();
    expect(DEFAULT_VIEW_STRINGS.beyond.ends["kernelSetUp"]).toBeTruthy();
  });

  it("is answered by no figure: none writes an R1, R2 or R14 word into a save area", () => {
    const texts = kernelLesson.sections
      .flatMap((x) => x.interactives ?? [])
      .map((f) => JSON.stringify(f.props));
    for (const word of ["0x5A8", "0x5B0", "0x610", "0x508", "0x510", "0x570"])
      for (const t of texts) expect(t).not.toContain(`word[${word}]`);
  });
});

describe("the kernel chapter's links", () => {
  it("points on to Systems From Scratch, in the reflection only, at the addresses checked", () => {
    const links = [...PROSE.reflection.matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1]);
    expect(links).toEqual([
      "https://snowch.github.io/computer-systems/traps-and-system-calls/",
      "https://snowch.github.io/computer-systems/scheduling-and-context-switches/",
    ]);
    const elsewhere = Object.entries(PROSE).filter(
      ([k, v]) => k !== "reflection" && JSON.stringify(v).includes("https:"),
    );
    expect(elsewhere).toEqual([]);
  });
});
