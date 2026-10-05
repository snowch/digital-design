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
    /** The accessible name's second half on a wire in a drawing, after the wire's name. */
    readonly showWire: string;
    /** Above a drawing wider than its box, which scrolls sideways (a phone). */
    readonly scrollNote: string;
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
    /** For a table whose rows are clock edges: the column, and the mark on the row the next edge applies. */
    readonly edge: string;
    readonly edgeMark: string;
  };
  readonly explorer: {
    readonly step: string;
    readonly stepOf: string;
    readonly settled: string;
    readonly settledOne: string;
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
    /** The accessible name of the drawing shown above the question. */
    readonly circuitTitle: string;
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
    /** The mark on the diagram's axis at the clock edge. */
    readonly edge: string;
  };
  /** The signals lesson's drawing of the sensor, the cable and the display. */
  readonly path: {
    /** The label of the row of step numbers under the strip of steps. */
    readonly step: string;
  };
  readonly signal: {
    readonly plotTitle: string;
    readonly plotSummary: string;
    /** The plot's summary when it is drawn without a threshold. */
    readonly plainSummary: string;
    readonly recording: string;
    readonly threshold: string;
    readonly noise: string;
    readonly sample: string;
    readonly sent: string;
    readonly read: string;
    readonly allRight: string;
    readonly someWrong: string;
    readonly nearest0: string;
    readonly nearest1: string;
    readonly nearest0Wrong: string;
    readonly nearest1Wrong: string;
    readonly band: string;
    readonly noBand: string;
    readonly words: string;
  };
  readonly bits: {
    readonly row: string;
    readonly flip: string;
    readonly fixed: string;
    /** A bit shown without its worth, above a question about what the word reads as. */
    readonly bare: string;
    readonly digit: string;
    readonly sum: string;
    readonly noOnes: string;
    readonly readings: string;
  };
  readonly readings: {
    readonly names: {
      readonly unsigned: string;
      readonly signed: string;
      readonly hex: string;
      readonly lamps: string;
    };
    readonly how: {
      readonly unsigned: string;
      readonly signed: string;
      readonly hex: string;
      readonly lamps: string;
    };
    readonly readAs: string;
    readonly word: string;
    readonly lampOn: string;
    readonly lampOff: string;
    readonly lampsLabel: string;
    readonly value: string;
  };
  readonly readingPrediction: {
    readonly modelGave: string;
    readonly same: string;
    readonly atThreshold: string;
    /** The accessible name of the samples drawn above a question about them. */
    readonly samplesTitle: string;
  };
  readonly answers: {
    readonly terms: Readonly<Record<string, string>>;
    readonly unanswered: string;
    readonly invalid: string;
    readonly ofYourBits: string;
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
    showWire: "Press to show the wire's name and value under the drawing.",
    scrollNote: "The drawing is wider than the screen. Scroll sideways to see the rest.",
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
    edge: "Next edge",
    edgeMark: "Applies at the next edge",
  },
  explorer: {
    step: "Step",
    stepOf: "Step {k} of {n}",
    settled: "Settled in {n} steps.",
    settledOne: "Settled in 1 step.",
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
    circuitTitle: "Circuit diagram",
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
    previous: "Earlier change",
    next: "Later change",
  },
  setupHold: {
    offset: "D changes {offset} units {relation} the clock edge",
    captured: "Q became {value}, {time} time units after the edge; the flip-flop took D cleanly.",
    ignored: "Q did not change: D arrived too late.",
    late: "Q became {value}, {time} time units after the edge. D changed inside the uncertain band; this answer is not to be trusted.",
    inWindow:
      "The gate model's answer here is not to be trusted. A real flip-flop may hover between 0 and 1 before settling.",
    draw: "Roll result",
    replay: "Replay roll {seed}",
    drawn:
      "Roll {seed}: Q became undecided {from} time units after the edge and settled to {value}, {time} time units after the edge.",
    draws: "Rolls",
    diagramTitle: "Timing diagram",
    window: "Uncertain",
    before: "before",
    after: "after",
    edge: "rising edge",
  },
  path: {
    step: "Step",
  },
  signal: {
    plotTitle: "Samples and threshold",
    plotSummary:
      "{n} samples from {low} to {high}, threshold at {threshold}, {wrong} come out wrong.",
    plainSummary: "{n} samples from {low} to {high}.",
    recording: "Recording",
    threshold: "Threshold: {value}",
    noise: "Noise: ×{scale}",
    sample: "Sample",
    sent: "Sent",
    read: "Received",
    allRight: "Every sample comes out as sent.",
    someWrong: "{n} of {total} come out wrong: {list}.",
    nearest0: "Highest sample sent as 0: sample {index}, {gap} below threshold.",
    nearest1: "Lowest sample sent as 1: sample {index}, {gap} above threshold.",
    nearest0Wrong:
      "Highest sample sent as 0: sample {index}, {gap} above threshold, on the wrong side.",
    nearest1Wrong:
      "Lowest sample sent as 1: sample {index}, {gap} below threshold, on the wrong side.",
    band: "Thresholds where every sample comes out as sent: {from} to {to}.",
    noBand: "At this noise, no threshold makes every sample come out as sent.",
    words: "Sent unsigned: {sent}; received unsigned: {read}.",
  },
  bits: {
    row: "Bits",
    flip: "Bit {n}, worth {value}, now {bit}; press to change.",
    fixed: "Bit {n}, worth {value}, {bit}.",
    bare: "Bit {n}, {bit}.",
    digit: "Digit {digit}",
    sum: "{terms} = {total}",
    noOnes: "No bits are 1, so the number is 0.",
    readings: "Readings",
  },
  readings: {
    names: {
      unsigned: "Unsigned",
      signed: "Signed",
      hex: "Hexadecimal",
      lamps: "Lamps",
    },
    how: {
      unsigned: "Add the worths of the bits that are 1.",
      signed: "Add the worths of the bits that are 1, but bit 15 is worth -32768 instead of 32768.",
      hex: "Each group of four bits is one hexadecimal digit, 0 to 9 then A to F.",
      lamps: "A 1 lights its lamp; a 0 leaves it dark.",
    },
    readAs: "Show as",
    word: "Word",
    lampOn: "on",
    lampOff: "off",
    lampsLabel: "Lamps: {list}",
    value: "Reading",
  },
  readingPrediction: {
    modelGave: "The model's answer is {value}.",
    same: "the same",
    atThreshold: "At {threshold}: {n} come out wrong.",
    samplesTitle: "Signal samples",
  },
  answers: {
    terms: {
      threshold: "Threshold",
      wrong: "Samples come out wrong",
      wrongSamples: "Which samples come out wrong",
      marginBelow: "Margin below",
      marginAbove: "Margin above",
      bits: "Bits",
      signed: "Signed",
      unsigned: "Unsigned",
      hex: "Hexadecimal",
    },
    unanswered: "Fill in {fields} to run the tests.",
    invalid: "{field} must be a valid entry.",
    ofYourBits: "What your bits read as",
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
