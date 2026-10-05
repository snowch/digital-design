// Facts the signals lesson's prose states, read off the figures that show them: each test runs a
// figure's own props through the model the figure runs (dd-model: signals, bits, graders), so a
// change to the lesson's data or to the model that moves a number the prose states fails here.

import { describe, expect, it } from "vitest";

import {
  bitsOf,
  bitsText,
  breakingScale,
  hexOf,
  parseBits,
  rangeOf,
  readBits,
  readingOf,
  recording,
  safeBand,
  volts,
  type Reading,
  type RecordingId,
} from "@dd/dd-model";
import { answerOf, grade } from "@dd/dd-views";
import { parseLesson } from "@dd/lesson-schema";

import { FREEZER_TENTHS, SENSOR_BITS, SENSOR_RANGE_TENTHS, signals } from "./signals";
import { PROSE } from "./signals.prose";

const lesson = parseLesson(signals);

const figure = (id: string) => {
  const x = lesson.sections.flatMap((s) => s.interactives).find((i) => i.id === id);
  if (!x) throw new Error(`no figure ${id}`);
  return x.props as Record<string, unknown>;
};

/** What a noisy-signal figure shows for a recording at a threshold and a noise scale. */
const shown = (id: string, rec: RecordingId, threshold?: number, noise = 1) => {
  const p = figure(id);
  const t = threshold ?? (p["threshold"] as number);
  const r = recording(rec, noise);
  const result = readBits(r, t);
  return {
    rec: r,
    wrong: result.wrong.map((i) => i + 1),
    highest0: { sample: result.nearest0!.index + 1, gap: volts(result.nearest0!.gap) },
    lowest1: { sample: result.nearest1!.index + 1, gap: volts(result.nearest1!.gap) },
    read: result.read,
    band: safeBand(r),
  };
};

describe("the signals lesson's facts", () => {
  it("the sender drives 0 V for 0 and 3.30 V for 1, and sends the sensor's word", () => {
    const r = recording("quiet");
    expect([volts(r.low), volts(r.high)]).toEqual(["0.00 V", "3.30 V"]);
    expect(bitsText(r.sent)).toBe(SENSOR_BITS);
    expect(recording("compressor").samples).toHaveLength(16);
  });

  it("predicting: with the compressor running, 2.40 V reads 3 samples wrong and 1.40 V none", () => {
    const ask = figure("predict-threshold")["ask"] as Parameters<typeof answerOf>[0];
    expect(answerOf(ask)).toBe("140");
    const rec = recording("compressor");
    expect(readBits(rec, 240).wrong.map((i) => i + 1)).toEqual([5, 6, 13]);
    expect(readBits(rec, 140).wrong).toEqual([]);
  });

  it("investigating: the figure opens at 2.40 V, where the quiet line reads right and the compressor's does not", () => {
    expect(figure("explore-signal")["threshold"]).toBe(240);
    const quiet = shown("explore-signal", "quiet");
    expect(quiet.wrong).toEqual([]);
    expect(quiet.highest0).toEqual({ sample: 16, gap: "2.28 V" });
    expect(quiet.lowest1).toEqual({ sample: 4, gap: "0.72 V" });
    expect(shown("explore-signal", "compressor").wrong).toEqual([5, 6, 13]);
    // The quiet line's samples stay within 0.18 V of the level sent; the compressor's do not.
    const near = (rec: RecordingId) =>
      Math.max(
        ...recording(rec).samples.map((s, i) => Math.abs(s - (recording(rec).sent[i] ? 330 : 0))),
      );
    expect(volts(near("quiet"))).toBe("0.18 V");
    expect(volts(near("compressor"))).toBe("1.11 V");
  });

  it("the threshold challenge: 1.70 V passes, the thresholds that pass run from 1.45 V to 1.95 V", () => {
    const c = lesson.challenges.find((x) => x.id === "set-threshold")!;
    const at = (v: string) => grade(c, { answers: { threshold: v } }).passed;
    const passing = Array.from({ length: 67 }, (_, k) => k * 5).filter((t) =>
      at((t / 100).toFixed(2)),
    );
    expect(passing).toEqual([145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195]);
    expect(at("1.70")).toBe(true);
    // At 2.40 V the compressor's line is read wrong; at 1.40 V the gap below is 0.29 V.
    const high = grade(c, { answers: { threshold: "2.40" } });
    expect(high.failures.map((f) => f.label)).toEqual([
      c.tests.kind === "answers" ? c.tests.cases[1]!.label : "",
      c.tests.kind === "answers" ? c.tests.cases[3]!.label : "",
    ]);
    expect(shown("explore-signal", "compressor", 140).highest0).toEqual({
      sample: 16,
      gap: "0.29 V",
    });
    expect(shown("explore-signal", "compressor", 170).highest0.gap).toBe("0.59 V");
    expect(shown("explore-signal", "compressor", 170).lowest1).toEqual({
      sample: 5,
      gap: "0.55 V",
    });
  });

  it("adding the bits: the display's sum of the 1s is 65352, one of the three choices; 16 bits make 65536 patterns", () => {
    const bits = parseBits(SENSOR_BITS);
    expect(readingOf(bits, "unsigned")).toBe("65352");
    const p = figure("predict-sum");
    const ask = p["ask"] as Parameters<typeof answerOf>[0];
    expect(answerOf(ask)).toBe("65352");
    expect((p["options"] as { value: string }[]).map((o) => o.value)).toEqual([
      "184",
      "-184",
      "65352",
    ]);
    expect(PROSE.p3Explain).toContain(
      "32768 + 16384 + 8192 + 4096 + 2048 + 1024 + 512 + 256 + 64 + 8 = 65352",
    );
    expect(rangeOf(16)).toEqual({
      patterns: 65536,
      unsigned: [0, 65535],
      signed: [-32768, 32767],
    });
  });

  it("breaking: the safe band is 1.12 V to 2.25 V, shrinks with noise, and is gone at 1.6 times", () => {
    const p = figure("break-signal");
    expect(p["threshold"]).toBe(170);
    expect(p["noise"]).toEqual({ max: 3 });
    const band = shown("break-signal", "compressor").band!;
    expect([volts(band.from), volts(band.to)]).toEqual(["1.12 V", "2.25 V"]);
    const b15 = shown("break-signal", "compressor", 170, 1.5).band!;
    expect([volts(b15.from), volts(b15.to)]).toEqual(["1.67 V", "1.72 V"]);
    expect(breakingScale("compressor")).toBe(1.6);
    const broken = shown("break-signal", "compressor", 170, 1.6);
    expect(broken.wrong).toEqual([5, 16]);
    expect(readingOf(broken.read, "unsigned")).toBe("63305");
  });

  it("explaining: the sensor's word is -184 signed and 65352 unsigned, so the display shows 6535.2", () => {
    const p = figure("signed-word");
    const bits = parseBits(p["bits"] as string);
    expect(readingOf(bits, "signed")).toBe("-184");
    expect(readingOf(bits, "unsigned")).toBe("65352");
    expect(Number(readingOf(bits, "unsigned")) / 10).toBe(6535.2);
    expect(Number(readingOf(bits, "signed")) / 10).toBe(-18.4);
  });

  it("the range check: 6535.2 is outside what the sensor measures, -18.4 and -25.0 inside", () => {
    const { low, high } = SENSOR_RANGE_TENTHS;
    const inside = (tenths: number) => tenths >= low && tenths <= high;
    const bits = parseBits(SENSOR_BITS);
    expect(inside(Number(readingOf(bits, "unsigned")))).toBe(false);
    expect(inside(Number(readingOf(bits, "signed")))).toBe(true);
    expect(inside(FREEZER_TENTHS)).toBe(true);
    expect(PROSE.explanation).toContain(`from ${low / 10}.0 to ${high / 10}.0 degrees`);
    // Read unsigned, a display is right at zero and above and wrong below: -0.1 shows 6553.5.
    expect(Number(readingOf(bitsOf(-1, 16), "unsigned")) / 10).toBe(6553.5);
    expect(readingOf(bitsOf(0, 16), "unsigned")).toBe(readingOf(bitsOf(0, 16), "signed"));
  });

  it("generalising: each word read four ways", () => {
    const words = figure("many-readings")["words"] as { bits: string }[];
    const read = (bits: string, r: Reading) => readingOf(parseBits(bits), r);
    expect(words.map((w) => read(w.bits, "unsigned"))).toEqual(["65352", "18", "65535"]);
    expect(words.map((w) => read(w.bits, "signed"))).toEqual(["-184", "18", "-1"]);
    expect(words.map((w) => read(w.bits, "hex"))).toEqual(["FF48", "0012", "FFFF"]);
  });

  it("the challenge section: 1000 0000 0000 0000 is -32768 signed; the freezer's word", () => {
    const ask = figure("predict-top")["ask"] as Parameters<typeof answerOf>[0];
    expect(answerOf(ask)).toBe("-32768");
    expect(FREEZER_TENTHS).toBe(-250);
    const bits = bitsOf(FREEZER_TENTHS, 16);
    expect(bitsText(bits)).toBe("1111 1111 0000 0110");
    expect(readingOf(bits, "unsigned")).toBe("65286");
    expect(hexOf(bits)).toBe("FF06");
  });
});

describe("the drawing of the sensor, the cable and the display", () => {
  it("draws the steps, the levels and the number the question states", () => {
    const rec = recording(figure("signal-path")["recording"] as RecordingId);
    expect(bitsText(rec.sent)).toBe(SENSOR_BITS);
    expect(rec.sent).toHaveLength(16);
    expect(readingOf(rec.sent, "signed")).toBe("-184");
    expect([rec.low, rec.high]).toEqual([0, 330]);
    expect(volts(rec.high)).toBe("3.30 V");
    for (const fact of ["16 steps", "-184", "0 V", "3.30 V", "30 metres"])
      expect(PROSE.question).toContain(fact);
  });

  it("sits in the question section, between the scene and the receiver's samples", () => {
    const question = lesson.sections.find((s) => s.kind === "question")!;
    expect(question.interactives.map((x) => x.id)).toEqual(["signal-path"]);
    expect(question.prose).not.toContain("**sample**");
    expect(question.interactives[0]!.after).toContain("**sample**");
  });
});
