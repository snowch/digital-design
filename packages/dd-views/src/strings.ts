// Copyright © 2026 Christopher Snow

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
    // Module 8: a drawing much wider than its box, with the whole of it small above it, and zoom
    // (`Overview.tsx`; tried first on the branches lesson's loop).
    /** The heading over the strip that shows the whole drawing small. */
    readonly overviewLabel: string;
    /** The strip's accessible name, as a control. */
    readonly overviewName: string;
    /** A screen reader's reading of the strip: {from} and {to}, percentages across the drawing. */
    readonly overviewValue: string;
    readonly zoomOut: string;
    readonly zoomIn: string;
    /** Above such a drawing, in place of the scroll note. */
    readonly zoomNote: string;
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
    // Module 3: wires that carry a word.
    /** Refusing a wire whose ends differ in width: {a} and {b} are ports, {wa} and {wb} bits. */
    readonly widthMismatch: string;
    /** In the list of loose ends: a stored wire whose ends differ in width. */
    readonly widthWarning: string;
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
    /** Module 2: the caption of a circuit's own truth table under its drawing. */
    readonly ownTable: string;
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
    /** Beside each level of the strip: {digit} is 1 or 0, {volts} the level's voltage. */
    readonly level: string;
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
    /** A bit shown with its worth inside its hexadecimal digit (8, 4, 2 or 1). */
    readonly inDigit: string;
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
    /** In place of `value` for hexadecimal, which writes the bits and reads nothing. */
    readonly written: string;
  };
  readonly readingPrediction: {
    readonly modelGave: string;
    readonly same: string;
    readonly atThreshold: string;
    /** The accessible name of the samples drawn above a question about them. */
    readonly samplesTitle: string;
  };
  /** Module 2: two circuits side by side, compared row by row. */
  readonly compare: {
    readonly drawing: string;
    readonly gates: string;
    readonly depth: string;
    readonly tableCaption: string;
    readonly agree: string;
    readonly same: string;
    readonly differs: string;
    readonly allSame: string;
    readonly someDiffer: string;
  };
  /** Module 2: a truth table's rows in pairs that differ in one input. */
  readonly pairs: {
    readonly choose: string;
    readonly caption: string;
    readonly at: string;
    readonly matters: string;
    readonly yes: string;
    readonly no: string;
    readonly summary: string;
  };
  /** Module 2: the tests a challenge's limits add, and what a failed one found. */
  readonly limits: {
    readonly gates: string;
    readonly gatesFound: string;
    readonly depth: string;
    readonly depthFound: string;
    readonly only: string;
    readonly onlyFound: string;
    /** Joins a list of kinds in `only`: "NAND" or "NAND and NOR". */
    readonly and: string;
  };
  /** Module 3: the rows of bits that set a word input, under a drawing. */
  readonly words: {
    /** Above a word input's bits: {name} is the input's name. */
    readonly heading: string;
    /** The accessible name of the row of bits. */
    readonly row: string;
  };
  // Module 5
  readonly machine: MachineStrings;
  /** Module 7: the carry stepped from slice to slice. */
  readonly carrySteps: {
    readonly cases: string;
    readonly caseSteps: string;
    readonly gridLabel: string;
    readonly rowLabel: string;
    readonly cellLabel: string;
    readonly key: string;
    readonly back: string;
    readonly next: string;
    readonly end: string;
    readonly result: string;
    readonly settled: string;
    readonly answer: string;
  };
  /** Module 7: a generated test suite run against the ALU. */
  readonly suite: {
    readonly seed: string;
    readonly run: string;
    readonly newSeed: string;
    readonly allPass: string;
    readonly someFail: string;
    readonly group: string;
    readonly cases: string;
    readonly wrong: string;
    readonly groups: Readonly<Record<"normal" | "boundary" | "random" | "adversarial", string>>;
    readonly firstWrong: string;
    readonly failure: string;
    readonly more: string;
    readonly answer: string;
  };
  readonly answers: {
    readonly terms: Readonly<Record<string, string>>;
    readonly unanswered: string;
    readonly invalid: string;
    readonly ofYourBits: string;
    /** Module 6: in place of the word a memory reads out, which would give the answer away. */
    readonly ofTheMemory: string;
    /** Module 7: what a test that a fault must change expects, around the right result. */
    readonly otherThan: string;
  };
  /** Module 6: the memory explorer's table of words. */
  readonly memory: {
    readonly caption: string;
    readonly address: string;
    readonly word: string;
    readonly marks: string;
    /** In a word's row: {ports} are the outputs whose address names this word. */
    readonly readBy: string;
    /** In a word's row while the write enable is 1 and the address names it. */
    readonly writeNext: string;
    /** The memory map's table (lesson 6.4). */
    readonly mapCaption: string;
    readonly addresses: string;
    readonly part: string;
    /** A part's addresses, {first} to {last}, in binary. */
    readonly range: string;
    /** In the row of the part the address names now. */
    readonly chosen: string;
  };
  /** Module 8: the datapath figure. */
  readonly datapath: DatapathStrings;
  /** Module 8: the focused figures of the machine's ideas. */
  readonly machine8: MachineFigureStrings;
}

/** Module 8: the words of the instruction-fields, widening, edges, memory-map and branches figures. */
export interface MachineFigureStrings {
  /** The radio group's name when a figure offers several instructions, constants or programs. */
  readonly choose: string;
  /** Above the fields: the whole word, {word}. */
  readonly word: string;
  /** A field's bits: {hi} and {lo}. */
  readonly bits: string;
  /** A register field's value: {n}. */
  readonly register: string;
  /** The constant's value read signed: {value}. */
  readonly signedValue: string;
  /** The fields as one group, for a screen reader. */
  readonly fieldsLabel: string;
  /** The widening's two rows. */
  readonly constantRow: string;
  readonly wideRow: string;
  /** A row of 16 of W's bits: {hi} and {lo}. */
  readonly bitRange: string;
  /** Under the rows: what the shading means. */
  readonly copyKey: string;
  /** The two readings: {c} and {w}. */
  readonly readings: string;
  /** A bit, for a screen reader: {n}, {bit}, and whether it is a copy. */
  readonly bitLabel: string;
  readonly copied: string;
  /** The edges figure's title, for a screen reader. */
  readonly timelineTitle: string;
  /** The mark above a rising edge in a run's timing diagram: `{n}`, its number from the reset. */
  readonly edgeMark: string;
  /** The memory map's table. */
  readonly mapCaption: string;
  readonly addresses: string;
  readonly part: string;
  readonly accesses: Readonly<
    Record<"load-word" | "load-byte" | "store-word" | "store-byte", string>
  >;
  /** An allowed access. */
  readonly allowed: string;
  /** A refused access: {cause}. */
  readonly refused: string;
  readonly parts: Readonly<Record<string, string>>;
  /** An address range: {first} and {last}. */
  readonly range: string;
  /** An open range, to the end of the addresses: {first}. */
  readonly rangeAbove: string;
  /** The branches figure's table. */
  readonly flowCaption: string;
  readonly address: string;
  readonly instruction: string;
  readonly went: string;
  /** One place a run went: {to} and {times}. */
  readonly wentTo: string;
  /** A branch whose target the run never took: {to}. */
  readonly notTaken: string;
  /** The arrows, for a screen reader. */
  readonly arrowsLabel: string;
}

/** Module 8: the datapath figure's words. */
export interface DatapathStrings {
  /** The instructions a lesson offers for the IR bus, where the stage has no ROM. */
  readonly instructions: string;
  readonly clock: string;
  readonly run: string;
  readonly reset: string;
  readonly registersCaption: string;
  readonly register: string;
  readonly word: string;
  readonly signed: string;
  readonly marks: string;
  /** In a register's row: the last edge wrote it. */
  readonly written: string;
  readonly programCaption: string;
  readonly address: string;
  readonly instruction: string;
  readonly transfer: string;
  /** In the program's row the PC names. */
  readonly atPc: string;
  readonly busesCaption: string;
  readonly bus: string;
  readonly value: string;
  readonly devicesCaption: string;
  readonly device: string;
  readonly display: string;
  readonly lamps: string;
  readonly ramCaption: string;
  /** The status line while the machine runs: {pc}. */
  readonly running: string;
  /** While HALT is 1: the next edge stops the machine, {reason}. */
  readonly halting: string;
  /** After the edge that stopped it: {reason}. */
  readonly stopped: string;
  /** After a run that reached {edges} edges without stopping, at {pc}. */
  readonly gaveUp: string;
  /** While a run is going: {edges} made so far. */
  readonly runningEdges: string;
  /** Why the machine stops, by cause; `stop` and `later` for CAUSE 00. */
  readonly reasons: Readonly<Record<string, string>>;
  /** The stepper over the last edge. */
  readonly stepsHeading: string;
  readonly stepsNone: string;
  /** At a step: the buses that changed at it, {nets}. */
  readonly stepChanged: string;
  readonly stepNothing: string;
  readonly back: string;
  readonly next: string;
  readonly end: string;
  /** After a prediction: what the machine did, {answer}. */
  readonly answer: string;
  /** In a prediction of the registers an edge writes: none. */
  readonly noRegister: string;
}

/** Module 5: the state-machine figure's words. */
export interface MachineStrings {
  /** One input's value in a condition: {name} {value}. */
  readonly literal: string;
  /** A row that needs no input. */
  readonly always: string;
  /** Between two rows' conditions on one arrow. */
  readonly or: string;
  /** What a screen reader is told of the diagram: {states}. */
  readonly diagramLabel: string;
  readonly tableCaption: string;
  readonly row: string;
  readonly state: string;
  readonly next: string;
  /** In an input's column: the row does not read this input. */
  readonly any: string;
  readonly anyNote: string;
  readonly inputsLabel: string;
  /** An input's button: {name} = {value}. */
  readonly inputButton: string;
  /** The status line: {state} {code} now, row {row} applies, {next} {nextCode} at the next edge. */
  readonly status: string;
  /** The status line with no table on show, so no row to name: {state} {code}, {next} {nextCode}. */
  readonly statusNoTable: string;
  /** The status line while RST is 1. */
  readonly resetting: string;
  /** The status line when the register holds no state's code: {code}. */
  readonly noState: string;
  /** In place of a state's name, for a code no state has. */
  readonly noName: string;
  readonly circuitTitle: string;
  readonly traceTitle: string;
  readonly textLabel: string;
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
    overviewLabel: "Overview",
    overviewName: "Drawing overview",
    overviewValue: "Showing {from} to {to} percent of the drawing width",
    zoomOut: "Make smaller",
    zoomIn: "Make larger",
    zoomNote:
      "The drawing is wider than the screen. Press Make smaller to zoom out, move the frame in the overview, or scroll sideways; on a touch screen, pinch to zoom.",
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
    widthMismatch: "{a} has {wa} bits but {b} has {wb}. They cannot be wired together.",
    widthWarning:
      "The wire from {a} to {b} is not connected: {a} carries {wa} bits and {b} takes {wb}.",
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
    ownTable: "Every row of this circuit",
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
    level: "{digit}: {volts}",
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
    inDigit: "Bit {n}, worth {value} in its digit, {bit}.",
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
    written: "Shown as",
  },
  readingPrediction: {
    modelGave: "The model's answer is {value}.",
    same: "the same",
    atThreshold: "At {threshold}: {n} come out wrong.",
    samplesTitle: "Signal samples",
  },
  compare: {
    drawing: "{label}: circuit diagram",
    gates: "Gates: {n}",
    depth: "Depth: {n}",
    tableCaption: "Outputs from both circuits, row by row",
    agree: "Outputs match",
    same: "Yes",
    differs: "No",
    allSame: "Both circuits produce the same outputs in all {total} rows.",
    someDiffer: "Both circuits produce different outputs in {n} of {total} rows.",
  },
  pairs: {
    choose: "Which input?",
    caption: "Pairs of rows, differing only in {input}.",
    at: "{input} = {value}",
    matters: "Does {input} change the output?",
    yes: "Yes",
    no: "No",
    summary: "{input} changes the output in {n} of {total} pairs.",
  },
  limits: {
    gates: "At most {limit} gates",
    gatesFound: "The circuit has {count} gates. The limit is {limit}.",
    depth: "At most {limit} gates on the longest path",
    depthFound: "The longest path contains {path} ({count} gates). The limit is {limit}.",
    only: "Only {kinds} gates",
    onlyFound: "This circuit contains {list}, but only {kinds} gates are allowed.",
    and: " and ",
  },
  words: {
    heading: "Input {name}",
    row: "The bits of input {name}. Press a bit to change it.",
  },
  // Module 7: drafted by the prose process (docs/notes/module-7-alu.md)
  carrySteps: {
    cases: "Which change to watch",
    caseSteps: "{label} ({n} steps)",
    gridLabel: "Each slice's carry out and its bit of Y at this step",
    rowLabel: "Bits {hi} to {lo}",
    cellLabel: "Bit {k}, carry out {carry}, Y {y}",
    key: "Top digit: the slice's carry out. Bottom digit: its bit of Y.",
    back: "Back a step",
    next: "Next step",
    end: "Last step",
    result: "Y is {y}.",
    settled: "Nothing changes after step {n}.",
    answer: "The simulator gives {answer}.",
  },
  suite: {
    seed: "{width}-bit ALU, random tests from seed {seed}.",
    run: "Run the suite",
    newSeed: "New random tests",
    allPass: "All {total} tests pass.",
    someFail: "{failed} of {total} tests fail.",
    group: "Kind of test",
    cases: "Tests",
    wrong: "Failed",
    groups: {
      normal: "Normal",
      boundary: "Boundary",
      random: "Random",
      adversarial: "Adversarial",
    },
    firstWrong: "{group} tests that fail, the first few:",
    failure: "Test {label}: got {got}, expected {want}.",
    more: "and {n} more",
    answer: "First kind to catch the fault: {answer}.",
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
      // Module 7
      faulty: "The faulty ALU gives",
    },
    unanswered: "Fill in {fields} to run the tests.",
    invalid: "{field} must be a valid entry.",
    ofYourBits: "What your bits read as",
    ofTheMemory: "What the memory gives",
    // Module 7
    otherThan: "anything other than {value}",
  },
  // Module 6. Drafted by the prose process (docs/notes/module-6-memory.md).
  memory: {
    caption: "Every word the memory keeps, by address",
    address: "Address",
    word: "Word",
    marks: "Now",
    readBy: "On {ports}",
    writeNext: "Writes next",
    mapCaption: "Which part answers each address",
    addresses: "Addresses",
    part: "Part",
    range: "{first} to {last}",
    chosen: "Chosen",
  },
  // Module 8's focused figures. Drafted by the prose process (brief GV,
  // docs/notes/module-8-figures/briefs/GV.md).
  machine8: {
    choose: "Choose",
    word: "The word {word}",
    bits: "bits {hi} to {lo}",
    register: "R{n}",
    signedValue: "{value}, read signed",
    fieldsLabel: "The instruction's fields",
    constantRow: "C, 12 bits",
    wideRow: "W, 64 bits",
    bitRange: "bits {hi} to {lo}",
    copyKey: "Bit 11 is outlined; the dashed bits are its copies.",
    readings: "C reads {c}; W reads {w}.",
    bitLabel: "bit {n}, its value {bit}",
    copied: "a copy of bit 11",
    timelineTitle: "Timing diagram",
    edgeMark: "↑{n}",
    mapCaption: "Memory map",
    addresses: "Addresses",
    part: "Part",
    accesses: {
      "load-word": "Load word",
      "load-byte": "Load byte",
      "store-word": "Store word",
      "store-byte": "Store byte",
    },
    allowed: "yes",
    refused: "{cause}",
    parts: {
      rom: "ROM",
      ram: "RAM",
      display: "display",
      lamps: "lamps",
      signals: "DOOR and WARM",
      sensorA: "sensor A",
      sensorB: "sensor B",
      timer: "timer",
      waiting: "waiting",
      none: "no memory",
    },
    range: "{first} to {last}",
    rangeAbove: "{first} and above",
    flowCaption: "Program flow",
    address: "Address",
    instruction: "Transfer",
    went: "Went to",
    wentTo: "{to} ({times}×)",
    notTaken: "{to} (never)",
    arrowsLabel:
      'Arrows show where each branch, call and jump sent PC, when that was not the next line; the "went to" column lists the same.',
  },
  // Module 8: the datapath figure. Drafted by the prose process (brief 6V,
  // docs/notes/module-8-datapath/briefs/6V.md).
  datapath: {
    instructions: "Instructions",
    clock: "Clock edge",
    run: "Run until it stops",
    reset: "Start again",
    registersCaption: "Registers",
    register: "Name",
    word: "Value",
    signed: "Signed",
    marks: "Now",
    written: "Written",
    programCaption: "Program",
    address: "Address",
    instruction: "Instruction",
    transfer: "Transfer",
    atPc: "PC",
    busesCaption: "Buses",
    bus: "Name",
    value: "Value",
    devicesCaption: "Devices",
    device: "Device",
    display: "display",
    lamps: "lamps",
    ramCaption: "RAM",
    running: "PC is {pc}.",
    halting: "Stops at next edge: {reason}.",
    stopped: "Stopped: {reason}.",
    gaveUp: "Draft gave up after {edges} edges at {pc}.",
    runningEdges: "Draft running: {edges} edges so far.",
    reasons: {
      "11": "instruction fetch outside the ROM",
      "12": "fetch at an address not a multiple of 4",
      "21": "an illegal instruction",
      "31": "no memory at the address",
      "33": "word at an unaligned address, or byte at device",
      "34": "write to ROM or read-only device",
      "41": "the call system job",
      stop: "the stop instruction",
      later: "a system job a later module builds",
    },
    stepsHeading: "The last edge, step by step",
    stepsNone: "Press Clock edge first.",
    stepChanged: "Buses that changed: {nets}.",
    stepNothing: "The clock has just risen; nothing has changed yet.",
    back: "Back a step",
    next: "Next step",
    end: "Last step",
    answer: "The machine gave {answer}.",
    noRegister: "None",
  },
  // Module 5: the state-machine figure. Drafted by the prose process (brief V,
  // docs/notes/module-5-state-machines/briefs/V.md).
  machine: {
    literal: "{name} {value}",
    always: "always",
    or: "or",
    diagramLabel: "State diagram with the states {states}",
    tableCaption: "Encoded state table",
    row: "Row",
    state: "State",
    next: "Next state",
    any: "–",
    anyNote: "A dash means the row does not read that input.",
    inputsLabel: "Inputs",
    inputButton: "{name} = {value}",
    status: "Now {state} ({code}). Row {row} applies: the next edge gives {next} ({nextCode}).",
    statusNoTable: "Now {state} ({code}). The next edge gives {next} ({nextCode}).",
    resetting: "Now {state} ({code}). RST is 1: the next edge gives {next} ({nextCode}).",
    noState: "The register stores {code}, which is no state's code.",
    noName: "No state",
    circuitTitle: "Circuit diagram",
    traceTitle: "Timing diagram",
    textLabel: "SystemVerilog text",
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
