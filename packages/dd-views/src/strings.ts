// The words the digital-design views put in front of a learner. Drafted by the prose process
// from a brief of facts and checked against the code; see CLAUDE.md.

import { createContext, useContext } from "react";

export interface ViewStrings {
  readonly circuit: {
    readonly where: string;
    readonly toggle: string;
    readonly open: string;
    readonly marked: string;
    readonly signals: string;
    readonly signal: string;
    readonly role: string;
    readonly value: string;
    readonly input: string;
    readonly output: string;
  };
  readonly builder: {
    readonly palette: string;
    readonly add: string;
    readonly deleteSelected: string;
    readonly tidy: string;
    readonly help: string;
    readonly partHelp: string;
    readonly wireHelp: string;
    readonly startWire: string;
    readonly finishWire: string;
    readonly wireLabel: string;
    readonly input: string;
    readonly output: string;
    readonly inputs: string;
    readonly outputs: string;
    readonly inputPin: string;
    readonly outputPin: string;
    readonly added: string;
    readonly removedPart: string;
    readonly removedWire: string;
    readonly pinsStay: string;
    readonly pendingFromOutput: string;
    readonly pendingFromInput: string;
    readonly cancelled: string;
    readonly notAPair: string;
    readonly connected: string;
    readonly selectedPart: string;
    readonly selectedWire: string;
    readonly looseEnds: string;
  };
  readonly hdl: {
    readonly ok: string;
    readonly drawn: string;
    readonly generated: string;
  };
  readonly editor: {
    readonly drawingTitle: string;
    readonly tryIt: string;
    readonly tryItTitle: string;
    readonly clock: string;
    readonly resetSim: string;
    readonly asText: string;
    readonly importHeading: string;
    readonly importLabel: string;
    readonly importButton: string;
    readonly imported: string;
    readonly importPorts: string;
    readonly writeTitle: string;
    readonly notSettled: string;
  };
  readonly grade: {
    readonly nothingDrawn: string;
    readonly nothingWritten: string;
    readonly undriven: string;
    readonly ports: string;
  };
  readonly timing: {
    readonly cursor: string;
    readonly valuesAt: string;
  };
  readonly table: {
    readonly now: string;
    readonly nowMark: string;
    readonly state: string;
  };
  readonly explorer: {
    readonly step: string;
    readonly stepOf: string;
    readonly settled: string;
    readonly notSettled: string;
    readonly clock: string;
    readonly reset: string;
    readonly releaseAll: string;
    readonly title: string;
  };
  readonly prediction: {
    readonly commit: string;
    readonly again: string;
    readonly youSaid: string;
    readonly circuitDid: string;
    readonly match: string;
    readonly noMatch: string;
    readonly traceTitle: string;
    readonly legend: string;
  };
  readonly fault: {
    readonly choose: string;
    readonly healthy: string;
    readonly run: string;
    readonly allPass: string;
    readonly someFail: string;
    readonly title: string;
    readonly failure: string;
  };
  readonly internals: {
    readonly title: string;
    readonly diagramTitle: string;
    readonly time: string;
    readonly previous: string;
    readonly next: string;
  };
  readonly setupHold: {
    readonly offset: string;
    readonly captured: string;
    readonly ignored: string;
    readonly late: string;
    readonly inWindow: string;
    readonly draw: string;
    readonly replay: string;
    readonly drawn: string;
    readonly draws: string;
    readonly diagramTitle: string;
    readonly window: string;
    readonly before: string;
    readonly after: string;
  };
}

export const DEFAULT_VIEW_STRINGS: ViewStrings = {
  circuit: {
    where: "Which block you are viewing",
    toggle: "Toggle between 0 and 1.",
    open: "Press to open and see the parts inside.",
    marked: "The circuit first disagreed with the test here.",
    signals: "Inputs and outputs",
    signal: "Signal",
    role: "Role",
    value: "Value",
    input: "Input",
    output: "Output",
  },
  builder: {
    palette: "Parts palette",
    add: "Add {label}",
    deleteSelected: "Delete",
    tidy: "Tidy the layout",
    help: "Press a button to add a part. Press a port to start a wire, then press another port to finish it. Select a part and move it with the arrow keys or by dragging. Press Delete to remove the selected part or wire. The circuit's inputs and outputs cannot be removed.",
    partHelp: "Use arrow keys to move, Delete to remove.",
    wireHelp: "Press Delete to remove.",
    startWire: "Press to start a wire from here.",
    finishWire: "Press to finish the wire here.",
    wireLabel: "Wire from {from} to {to}",
    input: "input",
    output: "output",
    inputs: "inputs",
    outputs: "outputs",
    inputPin: "Input",
    outputPin: "Output",
    added: "Added {id}.",
    removedPart: "Removed {id} and its wires.",
    removedWire: "Removed wire from {from} to {to}.",
    pinsStay: "The circuit's inputs and outputs cannot be removed.",
    pendingFromOutput: "Wire started from {port}. Press an input port to finish it.",
    pendingFromInput: "Wire started from {port}. Press an output port to finish it.",
    cancelled: "Wire cancelled.",
    notAPair: "Cannot connect {a} to {b}. Both are {role}.",
    connected: "Connected {from} to {to}.",
    selectedPart: "Selected {id}.",
    selectedWire: "Wire selected.",
    looseEnds: "Unconnected ({n})",
  },
  hdl: {
    ok: "OK. The text describes a circuit.",
    drawn: "Circuit from text",
    generated: "The circuit as text",
  },
  editor: {
    drawingTitle: "Drawing",
    tryIt: "Try it",
    tryItTitle: "Running circuit",
    clock: "Clock {name}",
    resetSim: "Recompute from all-zero inputs",
    asText: "As text",
    importHeading: "Import from text",
    importLabel: "Paste circuit text",
    importButton: "Import",
    imported: "Imported.",
    importPorts: "The text must have inputs and outputs {ports}.",
    writeTitle: "Your circuit, as text",
    notSettled: "The circuit never settled. Some signals kept changing.",
  },
  grade: {
    nothingDrawn: "Draw a circuit.",
    nothingWritten: "Write a circuit.",
    undriven: "No wire reaches {names}. Every output needs a wire into it.",
    ports: "The circuit needs inputs {inputs} and outputs {outputs}.",
  },
  timing: {
    cursor: "Time {time}",
    valuesAt: "Values at time {time}",
  },
  table: {
    now: "Now",
    nowMark: "Applies now",
    state: "What it does",
  },
  explorer: {
    step: "Step",
    stepOf: "Step {k} of {n}",
    settled: "Settled in {n} steps.",
    notSettled: "These signals never settled and are shown as X: {nets}.",
    clock: "Clock {name}",
    reset: "Start again",
    releaseAll: "Release all at once",
    title: "Circuit diagram",
  },
  prediction: {
    commit: "Check my prediction",
    again: "Predict again",
    youSaid: "You chose {choice}.",
    circuitDid: "The circuit set {signal} to {value}.",
    match: "You were correct.",
    noMatch: "Your choice did not match.",
    traceTitle: "Simulation trace",
    legend: "Prediction options",
  },
  fault: {
    choose: "Fault options",
    healthy: "No fault",
    run: "Run checks",
    allPass: "All checks passed.",
    someFail: "{failed} of {total} checks failed.",
    title: "Faulty circuit diagram",
    failure: "At {label}: got {actual}, expected {expected}.",
  },
  internals: {
    title: "Flip-flop internals",
    diagramTitle: "Signal timing",
    time: "Time: {time}",
    previous: "Step back",
    next: "Step forward",
  },
  setupHold: {
    offset: "D changes {offset} units {relation} the clock edge",
    captured: "Q captured {value} at {time}.",
    ignored: "Q did not change: D arrived too late.",
    late: "Q changed to {value} at {time}, but this is unreliable because D changed inside the window.",
    inWindow:
      "The gate model's answer here is not to be trusted. A real flip-flop may hover between 0 and 1 before settling.",
    draw: "Roll result",
    replay: "Replay roll",
    drawn: "Roll {seed}: Q became undecided at {from}, settled to {value} at {time}.",
    draws: "Rolls",
    diagramTitle: "Timing diagram",
    window: "Uncertain",
    before: "before",
    after: "after",
  },
};

export const ViewStringsContext = createContext<ViewStrings>(DEFAULT_VIEW_STRINGS);

export function useViewStrings(): ViewStrings {
  return useContext(ViewStringsContext);
}

/** Fills `{slot}`s in a template. A slot with no value is left as written. */
export function format(template: string, slots: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const v = slots[key];
    return v === undefined ? whole : String(v);
  });
}
