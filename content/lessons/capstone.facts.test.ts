// Copyright © 2026 Christopher Snow

// The numbers lesson capstone states, read off the final machine's runs: the figures' program at
// its set if's ALU edge (RESULT, the flags and MET), MET held at 0, the task's seven cases on the
// model, the reference program's four answers read off its own run, and the grade; and, for every
// figure's starting frame, that nothing a figure writes there is an answer a likely program gives.

import { describe, expect, it } from "vitest";

import {
  CAPSTONE_QUESTIONS,
  capstoneAnswer,
  capstoneProgram,
  capstoneRun,
  edgeView,
  modelEnd,
  netWord,
  recordRun,
  stuckAt,
  type CapstoneQuestion,
} from "@dd/dd-model";
import { MACHINE13_STRINGS, compareText, gradeCapstone, levelsAnswer } from "@dd/dd-views";

import { CAPSTONE_FIELDS, capstone } from "./capstone";
import { PROSE } from "./capstone.prose";
import { CAPSTONE_CASES, CAPSTONE_REFERENCE, CAPSTONE_SAMPLE } from "./module13";

const inputs = { SENSORA: -184, SENSORB: -250 };
const run = recordRun({ libraryId: "machine-final", program: CAPSTONE_SAMPLE, inputs });
const signed = (name: string, frame: number) => {
  const w = netWord(run.circuit, run.frames[frame] ?? [], name)!;
  return BigInt.asIntN(w.width, w.value).toString();
};

describe("lesson capstone's facts", () => {
  it("runs the figures' program as the model does, in 28 edges", () => {
    expect(run.difference).toBeUndefined();
    expect(run.frames.length - 1).toBe(28);
  });

  it("pauses before edge 22, the set if's ALU edge: -66 minus 100, RESULT -166, COUT 1, MET 1", () => {
    expect(edgeView(run.circuit, run.frames[21]!).state).toBe("ALU");
    expect(run.steps[4]?.text).toBe("R5 <= R3 < R4 signed");
    expect(["datapath/ALUA", "datapath/ALUB", "RESULT"].map((n) => signed(n, 21))).toEqual([
      "-66",
      "100",
      "-166",
    ]);
    // Opposite signs: read unsigned, -66 is the larger word, so COUT is 1; read signed, -66 is
    // less than 100, so MET is 1. COUT and MINUS are both 1, which no comparison of two readings
    // below 0 gives.
    expect(["ZERO", "MINUS", "COUT", "OVER", "MET"].map((n) => signed(n, 21))).toEqual([
      "0",
      "-1",
      "-1",
      "0",
      "-1",
    ]);
    // The prediction's answer, as the figure asks it: COUT after the next edge.
    expect(levelsAnswer(run, 21, "net", "COUT")).toBe("1");
    expect(PROSE.prediction).toContain("edge 22");
    expect(signed("HM", 21)).toBe("100");
  });

  it("shows, at every figure's first frame, no answer a likely program gives", () => {
    // A learner's first set if compares a reading with -200, or the two readings, either way
    // round, with any condition, after loading the readings in either order; -200 is a constant
    // or a word loaded last.
    const likely = new Map<CapstoneQuestion, Set<string>>(
      (Object.keys(CAPSTONE_QUESTIONS) as CapstoneQuestion[]).map((q) => [q, new Set()]),
    );
    const rooms = { a: "R1", b: "R2", limit: "R6" } as const;
    const pairs = [
      ["a", "limit"],
      ["b", "limit"],
      ["limit", "a"],
      ["limit", "b"],
      ["a", "b"],
      ["b", "a"],
    ] as const;
    for (const loads of [
      ["R1 <= word[sensorA]", "R2 <= word[sensorB]"],
      ["R2 <= word[sensorB]", "R1 <= word[sensorA]"],
    ])
      for (const limit of ["R6 <= -200", "R6 <= word[limit]"])
        for (const [x, y] of pairs)
          for (const cond of ["< signed", ">= signed", "==", "!="]) {
            const text = [
              ...loads,
              limit,
              `R3 <= ${rooms[x]} ${cond.replace(/^(\S+) ?(.*)$/, (_, op: string, how: string) => `${op} ${rooms[y]}${how ? ` ${how}` : ""}`)}`,
              "stop",
              "limit: word -200",
            ].join("\n");
            const r = capstoneRun(text);
            for (const q of likely.keys()) {
              const a = capstoneAnswer(r, q);
              expect("answer" in a, text).toBe(true);
              if ("answer" in a) likely.get(q)!.add(a.answer);
            }
          }
    expect(likely.get("flags")!.size).toBeGreaterThan(2);
    const figures = capstone.sections
      .flatMap((s) => s.interactives ?? [])
      .filter((i) => i.kind === "machine-levels")
      .map((i) => ({ id: i.id, start: (i.props as { start?: number }).start ?? 0 }));
    expect(figures.map((f) => f.start)).toEqual([21, 21, 21, 21]);
    for (const { id, start } of figures)
      for (const [q, answers] of likely) {
        const { read, form } = CAPSTONE_QUESTIONS[q];
        const words = read.map((n) => netWord(run.circuit, run.frames[start] ?? [], n));
        const known = (w: (typeof words)[number]) =>
          w !== undefined && w.known === (1n << BigInt(w.width)) - 1n;
        const shown =
          form === "signed"
            ? known(words[0])
              ? BigInt.asIntN(words[0]!.width, words[0]!.value).toString()
              : "X"
            : words.map((w) => (known(w) ? String(w!.value & 1n) : "X")).join("");
        expect(answers.has(shown), `${id} at ${start}: ${q} ${shown}`).toBe(false);
      }
  }, 120_000);

  it("MET held at 0: R5 is 0 on the machine and 1 by the model", () => {
    const r = recordRun({
      libraryId: "machine-final",
      program: CAPSTONE_SAMPLE,
      inputs,
      fault: stuckAt("datapath/MET", 0),
    });
    const said = compareText(MACHINE13_STRINGS, r, r.frames.length - 1);
    expect(said).toBe(
      "After `R5 <= R3 < R4 signed` at `010`, R5 is 0 on the machine and 1 by the model.",
    );
    expect(PROSE.failAfter).toContain(said);
  });

  it("the reference does the task on the model for every case", () => {
    const { program } = capstoneProgram(CAPSTONE_REFERENCE);
    for (const c of CAPSTONE_CASES) {
      const end = modelEnd(program!, { sensorA: BigInt(c.sensorA), sensorB: BigInt(c.sensorB) });
      expect([end.end.kind, end.display, end.lamps]).toEqual(["stop", BigInt(c.display), c.lamps]);
    }
  });

  it("fails a program that reads either room's comparison unsigned, on that room above 0", () => {
    const signedAt = [...CAPSTONE_REFERENCE.matchAll(/ signed/g)].map((m) => m.index!);
    expect(signedAt).toHaveLength(2);
    const failing = signedAt.map((at) => {
      const text = `${CAPSTONE_REFERENCE.slice(0, at)} unsigned${CAPSTONE_REFERENCE.slice(at + 7)}`;
      const { program } = capstoneProgram(text);
      return CAPSTONE_CASES.filter((c) => {
        const end = modelEnd(program!, { sensorA: BigInt(c.sensorA), sensorB: BigInt(c.sensorB) });
        return end.display !== BigInt(c.display) || end.lamps !== c.lamps;
      }).map((c) => c.id);
    });
    // Room A's comparison read unsigned fails room A at 50; room B's fails room B at 50.
    expect(failing).toEqual([["warm"], ["warmB"]]);
  });

  it("fails a program that counts exactly -200 as cold, in either room", () => {
    const lines = CAPSTONE_REFERENCE.split("\n");
    // "Not colder" swapped for "at least": the limit no longer above the reading, read the other way.
    const failing = [4, 5].map((k) => {
      const swapped = lines.map((l, i) =>
        i === k ? l.replace(/(R\d) <= (R\d) < (R6) signed/, "$1 <= $3 >= $2 signed") : l,
      );
      const { program } = capstoneProgram(swapped.join("\n"));
      return CAPSTONE_CASES.filter((c) => {
        const end = modelEnd(program!, { sensorA: BigInt(c.sensorA), sensorB: BigInt(c.sensorB) });
        return end.display !== BigInt(c.display) || end.lamps !== c.lamps;
      }).map((c) => c.id);
    });
    expect(failing[0]).toContain("edge");
    expect(failing[1]).toContain("edgeB");
  });

  it("the last hint's program and answers pass every test", () => {
    const challenge = capstone.challenges![0]!;
    const hint = challenge.hints![4]!;
    expect(hint).toContain(CAPSTONE_REFERENCE);
    const answers = CAPSTONE_FIELDS.map((f) => f.reference);
    expect(hint).toContain(answers.join(", "));
    const v = gradeCapstone(challenge as never, {
      text: CAPSTONE_REFERENCE,
      answers: Object.fromEntries(CAPSTONE_FIELDS.map((f) => [f.id, f.reference])),
    });
    expect([v.passed, v.total]).toEqual([true, 11]);
  });

  it("reads the reference program's four answers off its own run", () => {
    const r = capstoneRun(CAPSTONE_REFERENCE);
    for (const f of CAPSTONE_FIELDS)
      expect(capstoneAnswer(r, f.id as CapstoneQuestion), f.id).toEqual({ answer: f.reference });
    expect(Object.keys(CAPSTONE_QUESTIONS)).toEqual(CAPSTONE_FIELDS.map((f) => f.id));
  });

  it("grades the reference as passing, and a program's own answers, not the reference's", () => {
    const challenge = capstone.challenges![0]! as never;
    const answers = Object.fromEntries(CAPSTONE_FIELDS.map((f) => [f.id, f.reference]));
    expect(gradeCapstone(challenge, { text: CAPSTONE_REFERENCE, answers }).passed).toBe(true);
    // The same program with room B's set if first: it does the task, and its answers differ.
    const lines = CAPSTONE_REFERENCE.split("\n");
    const other = [...lines.slice(0, 4), lines[5], lines[4], ...lines.slice(6)].join("\n");
    const v = gradeCapstone(challenge, { text: other, answers });
    expect(v.blocked).toBeUndefined();
    // A program that fails its own tests has no trace question graded against it.
    const wrong = gradeCapstone(challenge, {
      text: CAPSTONE_REFERENCE.replace("R6 <= -200", "R6 <= -100"),
      answers,
    });
    expect(wrong.failures.slice(-4).map((f) => f.detail)).toEqual(
      Array(4).fill(MACHINE13_STRINGS.capFirst),
    );
    expect(v.failures.map((f) => f.label)).toContain(
      capstone.challenges![0]!.tests.kind === "answers"
        ? capstone.challenges![0]!.tests.cases[7]!.label
        : "",
    );
  });

  it("names, when the model refuses, only the registers the line reads, and what for", () => {
    const end = (text: string) => {
      const { program } = capstoneProgram(text);
      return modelEnd(program!, { sensorA: -184n, sensorB: -250n }).end;
    };
    expect(end("goto R9\nstop")).toMatchObject({ registers: [9], why: "jump" });
    expect(end("R1 <= word[R9]\nstop")).toMatchObject({ registers: [9], why: "address" });
    expect(end("R8 <= 1\nif R9 < R8 signed goto out\nout: stop")).toMatchObject({
      registers: [9],
      why: "branch",
    });
    expect(end("if R9 < R8 signed goto out\nout: stop")).toMatchObject({
      registers: [9, 8],
      why: "branch",
    });
    const challenge = capstone.challenges![0]! as never;
    const v = gradeCapstone(challenge, { text: "R1 <= word[R9]\nstop", answers: {} });
    const said = v.failures[0]?.detail ?? "";
    expect(said).toContain("reads R9 before any instruction has written it:");
    expect(said).toContain(MACHINE13_STRINGS.capUnknownWhy.address);
  });
});
