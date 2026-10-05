// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { bitsText, readingOf, recording } from "@dd/dd-model";
import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import type { Interactive, Lesson } from "@dd/lesson-schema";

import { DEFAULT_VIEW_STRINGS as S, format } from "../strings";
import { CircuitExplorer } from "./CircuitExplorer";
import { FaultLab } from "./FaultLab";
import { LatchInternals } from "./LatchInternals";
import { Prediction } from "./Prediction";
import { SetupHold, experiment } from "./SetupHold";
import { SignalPath } from "./SignalPath";

const lesson = { id: "remember", challenges: [] } as unknown as Lesson;

function mount(View: typeof Prediction, interactive: Interactive, storage = memoryStorage()) {
  const store = new LessonStore(storage, "dd", lesson.id);
  const view = render(<View lesson={lesson} interactive={interactive} store={store} />);
  return { store, ...view };
}

describe("the prediction", () => {
  const interactive: Interactive = {
    id: "predict-q",
    kind: "prediction",
    timeModel: "settle",
    caption: "c",
    props: {
      question: "Press S, then release it. What is Q?",
      libraryId: "sr-latch",
      run: [
        { label: "press S", set: { S: 1, R: 0 } },
        { label: "release", set: { S: 0, R: 0 } },
      ],
      watch: "Q",
      options: [
        { value: "0", label: "Q is 0" },
        { value: "1", label: "Q is 1" },
        { value: "X", label: "Cannot tell" },
      ],
      explain: "Feedback keeps it.",
    },
  };

  it("takes a commitment, then lets the simulator answer, and remembers the choice", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    mount(Prediction, interactive, storage);
    const commit = screen.getByRole("button", { name: S.prediction.commit });
    expect(commit).toBeDisabled();
    await user.click(screen.getByLabelText("Q is 0"));
    await user.click(commit);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(format(S.prediction.youSaid, { choice: "Q is 0" }));
    expect(status).toHaveTextContent(format(S.prediction.circuitDid, { signal: "Q", value: "1" }));
    expect(status).toHaveTextContent(S.prediction.noMatch);
    expect(screen.getByText("Feedback keeps it.")).toBeInTheDocument();
    expect(storage.get("dd:v1:remember")).toContain('"predict-q":{"choice":"0"}');

    await user.click(screen.getByRole("button", { name: S.prediction.again }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Q is 1"));
    await user.click(screen.getByRole("button", { name: S.prediction.commit }));
    expect(screen.getByRole("status")).toHaveTextContent(S.prediction.match);
  });

  it("says what is wrong with props that do not fit", () => {
    mount(Prediction, { ...interactive, props: { question: "q" } });
    expect(screen.getByRole("note")).toHaveTextContent(/libraryId/);
  });
});

describe("the fault lab", () => {
  it("runs the healthy circuit's behaviour as the checks against the broken one", async () => {
    const user = userEvent.setup();
    mount(FaultLab as typeof Prediction, {
      id: "break-latch",
      kind: "fault-lab",
      timeModel: "settle",
      caption: "c",
      props: {
        libraryId: "sr-latch",
        faults: [
          { kind: "wrong-gate", path: "sr/norQ", gate: "or" },
          { kind: "stuck-at", net: "S", value: 0 },
        ],
        run: [
          { label: "press S", set: { S: 1, R: 0 } },
          { label: "release", set: { S: 0, R: 0 } },
          { label: "press R", set: { S: 0, R: 1 } },
        ],
      },
    });
    await user.click(screen.getByRole("button", { name: S.fault.run }));
    expect(screen.getByRole("status")).toHaveTextContent(S.fault.allPass);
    await user.click(screen.getAllByRole("radio")[2] as HTMLElement); // the stuck-at fault
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: S.fault.run }));
    expect(screen.getByRole("status")).toHaveTextContent(/checks fail/);
    expect(screen.getAllByRole("listitem").some((li) => /press S/.test(li.textContent ?? ""))).toBe(
      true,
    );
  });
});

describe("the setup and hold experiment", () => {
  const data = {
    delay: 10,
    edgeAt: 1000,
    offsets: [-80, 40] as [number, number],
    window: [-35, 0] as [number, number],
    settleBetween: [5, 60] as [number, number],
    undecidedFrom: 20,
    show: [-120, 160] as [number, number],
  };

  it("captures early, misses late, and starts from a known 0", () => {
    expect(experiment(data, -60).qEvents).toEqual([{ time: 1030, value: "1" }]);
    expect(experiment(data, 0).qEvents).toEqual([]);
    expect(experiment(data, -15).qEvents).toEqual([{ time: 1045, value: "1" }]);
  });

  it("draws with a recorded seed and replays identically", () => {
    const a = experiment(data, -15, 2);
    const b = experiment(data, -15, 2);
    expect(a.overlay?.applied).toBe(true);
    expect(a.qEvents[0]).toEqual({ time: 1020, value: "X" });
    expect(a.qEvents).toEqual(b.qEvents);
    const c = experiment(data, -15, 3);
    expect(c.overlay?.settlesAt).not.toBe(a.overlay?.settlesAt);
  });

  it("moves D with a slider, offers a draw only inside the window, and records draws", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    mount(
      SetupHold as typeof Prediction,
      { id: "sh", kind: "setup-hold", timeModel: "delay", caption: "c", props: {} },
      storage,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.setupHold.captured, { value: "1", time: 30 }),
    );
    expect(screen.queryByRole("button", { name: S.setupHold.draw })).not.toBeInTheDocument();
    const slider = screen.getByRole("slider");
    // The range input is driven directly: user-event has no gesture for it.
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(slider, { target: { value: "-15" } });
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.setupHold.late, { time: 45, value: "1" }),
    );
    await user.click(screen.getByRole("button", { name: S.setupHold.draw }));
    expect(screen.getByRole("status")).toHaveTextContent(/Roll 1:/);
    const stored = JSON.parse(storage.get("dd:v1:remember") ?? "{}");
    expect(stored.slots.sh.draws).toHaveLength(1);
    expect(stored.slots.sh.draws[0]).toMatchObject({ seed: 1, offset: -15, from: 1020 });
    fireEvent.change(slider, { target: { value: "0" } });
    expect(screen.getByRole("status")).toHaveTextContent(S.setupHold.ignored);
    await user.click(screen.getByRole("button", { name: format(S.setupHold.replay, { seed: 1 }) }));
    expect(screen.getByRole("status")).toHaveTextContent(/Roll 1:/);
  });

  it("keeps every roll, gives each new roll the next seed, and marks the edge", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    mount(
      SetupHold as typeof Prediction,
      { id: "sh", kind: "setup-hold", timeModel: "delay", caption: "c", props: {} },
      storage,
    );
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "-20" } });
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole("button", { name: S.setupHold.draw }));
    }
    expect(screen.getByRole("status")).toHaveTextContent(/Roll 4:/);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "-25" } });
    await user.click(screen.getByRole("button", { name: S.setupHold.draw }));
    expect(screen.getByRole("status")).toHaveTextContent(/Roll 5:/);
    const stored = JSON.parse(storage.get("dd:v1:remember") ?? "{}");
    expect(stored.slots.sh.draws.map((d: { seed: number }) => d.seed)).toEqual([1, 2, 3, 4, 5]);
    for (let seed = 1; seed <= 5; seed++) {
      expect(
        screen.getByRole("button", { name: format(S.setupHold.replay, { seed }) }),
      ).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: format(S.setupHold.replay, { seed: 2 }) }));
    expect(screen.getByRole("status")).toHaveTextContent(/Roll 2:/);
    expect(document.querySelector(".mark-label")).toHaveTextContent(S.setupHold.edge);
  });
});

describe("the latch internals", () => {
  it("steps the cursor through the run's changes and shows the phase text", async () => {
    const user = userEvent.setup();
    mount(LatchInternals as typeof Prediction, {
      id: "inside",
      kind: "latch-internals",
      timeModel: "delay",
      caption: "c",
      props: {
        script: [
          { time: 0, input: "CLK", value: 0 },
          { time: 0, input: "D", value: 0 },
          { time: 50, input: "D", value: 1 },
          { time: 100, input: "CLK", value: 1 },
          { time: 200, input: "CLK", value: 0 },
        ],
        until: 300,
        signals: ["CLK", "D", "Q"],
        phases: [
          { from: 0, to: 100, text: "The clock is low: the master follows D." },
          { from: 100, to: 200, text: "The clock rose: the slave shows what the master held." },
        ],
      },
    });
    expect(screen.getByText("The clock is low: the master follows D.")).toBeInTheDocument();
    const next = screen.getByRole("button", { name: S.internals.next });
    await user.click(next);
    await user.click(next);
    const time = document.querySelector(".internals-time");
    expect(Number(time?.textContent?.replace(/\D/g, ""))).toBeGreaterThan(0);
    // Step on until the cursor is inside the second phase.
    const timeNow = () =>
      Number(document.querySelector(".internals-time")?.textContent?.replace(/\D/g, ""));
    for (let i = 0; i < 20 && timeNow() < 100; i++) await user.click(next);
    expect(timeNow()).toBeGreaterThanOrEqual(100);
    expect(timeNow()).toBeLessThan(200);
    expect(
      screen.getByText("The clock rose: the slave shows what the master held."),
    ).toBeInTheDocument();
  });
});

describe("the circuit explorer", () => {
  it("toggles inputs, marks the reference row, and shows settling steps", async () => {
    const user = userEvent.setup();
    mount(CircuitExplorer as typeof Prediction, {
      id: "latch",
      kind: "circuit-explorer",
      timeModel: "settle",
      caption: "c",
      props: { libraryId: "sr-latch", showSteps: true, truthTable: "sr-latch" },
    });
    // Both inputs 0 from the start: the latch is undecided, and the table says Hold.
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("Keep");
    await user.click(screen.getByRole("button", { name: /^S = 0\./ }));
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("Set");
    const table = screen.getByRole("table", { name: S.circuit.signals });
    expect(table).toHaveTextContent("Q");
    expect(screen.getByRole("status")).toHaveTextContent(format(S.explorer.settled, { n: 2 }));
  });

  it("says one step without a plural when the circuit settles in one", () => {
    mount(CircuitExplorer as typeof Prediction, {
      id: "race",
      kind: "circuit-explorer",
      timeModel: "settle",
      caption: "c",
      props: { libraryId: "two-latches", showSteps: true, canOpen: false },
    });
    expect(screen.getByRole("status")).toHaveTextContent(S.explorer.settledOne);
    expect(screen.getByRole("status")).not.toHaveTextContent("1 steps");
  });

  it("draws the X the status names when a loop never settles, not the last value it swung to", async () => {
    const user = userEvent.setup();
    mount(CircuitExplorer as typeof Prediction, {
      id: "odd",
      kind: "circuit-explorer",
      timeModel: "settle",
      caption: "c",
      props: { libraryId: "inverter-loop-3", showSteps: true },
    });
    await user.click(screen.getByRole("button", { name: /^kick = 0\./ }));
    await user.click(screen.getByRole("button", { name: /^kick = 1\./ }));
    expect(screen.getByRole("status")).toHaveTextContent(/never settled/);
    const table = screen.getByRole("table", { name: S.circuit.signals });
    const q = [...table.querySelectorAll("tr")].find((r) => r.cells[0]?.textContent === "q");
    expect(q?.cells[2]?.textContent).toBe("X");
  });

  it("shows a wire's name and value on a press, and keeps it until another wire is pressed", async () => {
    const user = userEvent.setup();
    mount(CircuitExplorer as typeof Prediction, {
      id: "bit",
      kind: "circuit-explorer",
      timeModel: "clocked",
      caption: "c",
      props: { libraryId: "keep-bit", clock: "CLK" },
    });
    const readout = () => document.querySelector(".wire-readout")?.textContent?.trim();
    const keep = document.querySelector('g.wire[data-net="KEEP"]') as Element;
    const choice = document.querySelector('g.wire[data-net="CHOICE"]') as Element;
    // A tap on a phone is a click with no pointer left resting on the wire.
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(keep);
    expect(readout()).toBe("KEEP = X");
    fireEvent.click(keep);
    expect(readout()).toBe("KEEP = X");
    fireEvent.click(choice);
    expect(readout()).toBe("CHOICE = X");
    // From the keyboard: a wire is a button with its name.
    const wire = screen.getByRole("button", { name: new RegExp(`^LOAD\\. ${S.circuit.showWire}`) });
    wire.focus();
    await user.keyboard("{Enter}");
    expect(readout()).toBe("LOAD = 0");
  });

  it("marks the row the next clock edge will apply in a table whose rows are edges", async () => {
    const user = userEvent.setup();
    mount(CircuitExplorer as typeof Prediction, {
      id: "reset-bit",
      kind: "circuit-explorer",
      timeModel: "clocked",
      caption: "c",
      props: { libraryId: "keep-clear-bit", clock: "CLK", truthTable: "register-bit" },
    });
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("Q keeps value");
    expect(screen.getByRole("row", { current: true })).toHaveTextContent(S.table.edgeMark);
    await user.click(screen.getByRole("button", { name: /^RST = 0\./ }));
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("Q resets to 0");
  });
});

describe("the signal path drawing", () => {
  const labels = {
    coldRoom: "Cold room",
    sensor: "Sensor",
    sends: "Sends {value}",
    cable: "Cable 30 m",
    compressor: "Compressor",
    office: "Office",
    display: "Display",
    receiver: "Receiver",
    noise: "noise",
    steps: "The {n} steps the sensor sends",
    title: "Sensor, cable and display",
    summary: "Sends {value} in {n} steps at {low} or {high}: {levels}.",
  };
  const interactive = (props: Record<string, unknown>): Interactive => ({
    id: "path",
    kind: "signal-path",
    timeModel: "none",
    caption: "c",
    props,
  });

  it("draws the steps the model's recording sends, and fills every number from the model", () => {
    const { container } = mount(
      SignalPath as typeof Prediction,
      interactive({ recording: "compressor", labels }),
    );
    const rec = recording("compressor");
    const svg = screen.getByRole("img", { name: /^Sensor, cable and display\./ });
    expect(svg.getAttribute("data-steps")).toBe(rec.sent.join(""));
    expect(svg.getAttribute("aria-label")).toBe(
      `Sensor, cable and display. Sends ${readingOf(rec.sent, "signed")} in ${rec.sent.length} steps at 0 V or 3.30 V: ${bitsText(rec.sent)}.`,
    );
    const steps = [...container.querySelectorAll("g.step")];
    expect(steps.map((g) => g.getAttribute("data-level")).join("")).toBe(rec.sent.join(""));
    expect(container.querySelectorAll(".step-high")).toHaveLength(rec.sent.filter((b) => b).length);
    for (const text of [
      "Cold room",
      "Sensor",
      "Cable 30 m",
      "Compressor",
      "noise",
      "Office",
      "Display",
    ])
      expect(svg).toHaveTextContent(text);
    expect(svg).toHaveTextContent(`Sends ${readingOf(rec.sent, "signed")}`);
    expect(svg).toHaveTextContent(`The ${rec.sent.length} steps the sensor sends`);
    expect(svg).toHaveTextContent(S.path.step);
  });

  it("says what is wrong with props that leave out a number's place", () => {
    mount(
      SignalPath as typeof Prediction,
      interactive({ recording: "compressor", labels: { ...labels, sends: "Sends" } }),
    );
    expect(screen.getByRole("note")).toHaveTextContent("labels.sends");
  });
});
