// Copyright © 2026 Christopher Snow

// The words the digital-design views put in front of a learner. Drafted by the prose process
// from a brief of facts and checked against the code; see CLAUDE.md.

import { createContext, useContext } from "react";

import { MACHINE10_STRINGS, type Machine10Strings } from "./strings10";
import { MACHINE11_STRINGS, type Machine11Strings } from "./strings11";
import { MACHINE12_STRINGS, type Machine12Strings } from "./strings12";
import { MACHINE13_STRINGS, type Machine13Strings } from "./strings13";

export interface ViewStrings {
  /** Any challenge whose grader stops with an error: the work fails, and says why. */
  readonly grading: {
    /** {why}: the grader's own reason. */
    readonly couldNotRun: string;
  };
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
    /** The axis's mark on a rise of the clock while the reset is held. */
    readonly resetRise: string;
    /** Every timing diagram's name for a screen reader, one for the whole course. */
    readonly title: string;
    /** Where the red line stands, in the run's own steps: the slider's name and the table's caption. */
    readonly cursorAt: string;
    readonly valuesAfter: string;
    /** The table's caption where the slider gives the time in units. */
    readonly valuesHere: string;
    /** {where}: after the run's last step. */
    readonly afterRun: string;
    /** {where}: after a step the axis names, such as ↑3. */
    readonly afterMark: string;
    /** {where}: before the axis names any step. */
    readonly atStart: string;
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
    /** The table of a run of a few settings: its caption, its first column, and a row's name. */
    readonly settingsCaption: string;
    readonly settingHeading: string;
    readonly setting: string;
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
    /** A bit pressed in a row of wires that is not a number: its wire's number, no worth. */
    readonly flipBare: string;
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
    /** A word wider than 16 bits, typed. The fields' accessible names: {name}. */
    readonly hexLabel: string;
    readonly numberLabel: string;
    /** The fields' visible captions. */
    readonly hexCaption: string;
    readonly numberCaption: string;
    /** The button that takes what was typed, and its accessible name: {name}. */
    readonly set: string;
    readonly setLabel: string;
    /** What is wrong with a typed word: {char}; {name}, {width}, {digits}; {min}, {max}. */
    readonly empty: string;
    readonly notHex: string;
    readonly hexTooLong: string;
    readonly notNumber: string;
    readonly numberRange: string;
    /** The folded row of the word's bits: {name}. */
    readonly bitsSummary: string;
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
    /** Module 0: a sentence per failure in place of values that would give the answer away. */
    readonly details: Readonly<Record<string, string>>;
    /** Module 0: what a valid entry is, by field, in place of the general sentence. */
    readonly invalidFor: Readonly<Record<string, string>>;
    /** Module 13: by the form a field's answer takes (number, hex, bits); {field}: its label. */
    readonly invalidForm: Readonly<Record<string, string>>;
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
  /** Module 0: the machine at work and the ladder, for a learner with no terms yet. */
  readonly meet: MeetStrings;
  /** Module 8: the focused figures of the machine's ideas. */
  readonly machine8: MachineFigureStrings;
  /** Module 9: the decoder's table and map, each kind's edges, and the views of an edge. */
  readonly control: ControlStrings;
  /** Module 10: the machines compared, the encoding explorer and calculator, programs compared. */
  readonly machine10: Machine10Strings;
  /** Module 11: the assembler's refusals, the debugger and the program figures. */
  readonly machine11: Machine11Strings;
  /** Module 12: the control registers, the shop's events, the trap timeline. */
  readonly machine12: Machine12Strings;
  /** Module 13's figure words (strings13.ts). */
  readonly machine13: Machine13Strings;
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
  /** A cause, not a `stop`: the machine halts. */
  readonly halted: string;
  readonly haltsNext: string;
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
  /** A step where only wires inside the blocks changed, none of the drawing's named buses. */
  readonly stepInside: string;
  readonly back: string;
  readonly next: string;
  readonly end: string;
  /** After a prediction: what the machine did, {answer}. */
  readonly answer: string;
  /** In a prediction of the registers an edge writes: none. */
  readonly noRegister: string;
}

/** Module 9: the words of the control figures and of the views of one edge. */
export interface ControlStrings {
  /** The decoder's table: its caption, the first column's heading, and a kind's column heading. */
  readonly tableCaption: string;
  readonly signal: string;
  /** A column's heading: kind {kind}. */
  readonly kindHeading: string;
  /** In a cell: the signal is the job digit's bit {bit}. */
  readonly jobBit: string;
  /** Under the table: what each kind is, one line each, by kind. */
  readonly kinds: Readonly<Record<string, string>>;
  /** Under the table: what a cell such as J2 means. */
  readonly jobBitNote: string;
  /** The map of kinds and jobs. */
  readonly mapCaption: string;
  readonly mapCorner: string;
  /** In a cell: an instruction; not one; one only for some constants. */
  readonly legal: string;
  readonly illegal: string;
  readonly depends: string;
  /** What a screen reader is told of a cell: K {k}, J {j}, then the cell's meaning. */
  readonly cellLabel: string;
  readonly legalMeaning: string;
  readonly illegalMeaning: string;
  readonly dependsMeaning: string;
  /** Under the map: the three marks. */
  readonly legend: string;
  /** Each kind's edges: caption and headings. */
  readonly edgesCaption: string;
  readonly kind: string;
  readonly states: string;
  readonly edges: string;
  /** Between two states in a sequence. */
  readonly then: string;
  /** The micro-operations of the instruction in progress. */
  readonly opsCaption: string;
  readonly edge: string;
  readonly state: string;
  readonly ops: string;
  /** In the row of the edge still to come. */
  readonly nextMark: string;
  /** Before any edge of the instruction. */
  readonly opsNone: string;
  /** Each register transfer: {address} for a fetch, {a} {b} {y} for registers, {job} {left} {right}. */
  readonly opFetch: string;
  readonly opRead: string;
  readonly opAlu: string;
  readonly opAluCopy: string;
  readonly opAluUp: string;
  readonly opAluDown: string;
  readonly opLoadWord: string;
  readonly opLoadByte: string;
  readonly opStoreWord: string;
  readonly opStoreByte: string;
  readonly opWrite: string;
  readonly opPc: string;
  /** What PC or register Y takes, by its source. */
  readonly sources: Readonly<Record<string, string>>;
  /** The ALU's jobs by code, as an operator between two words. */
  readonly jobs: Readonly<Record<string, string>>;
  /** An edge with no transfer: the machine stops at it. */
  readonly opNone: string;
  /** Joins two transfers of one edge. */
  readonly opJoin: string;
  /** The control signals at the next edge. */
  readonly signalsCaption: string;
  readonly value: string;
  /** The controller's states, with the one it is in marked. */
  readonly statesTitle: string;
  /** The timing diagram of the run so far. */
  readonly timingTitle: string;
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

// Module 0, meet the machine. Every string here is shown before the first lesson that rations a
// term, so a test (`meet-strings.test.ts`) holds each to the term gate against every rationed
// term, as the cover's test holds the cover's.
export interface MeetStrings {
  /** One sentence per kind of line ({y}, {a}, {b}, {n}, {line}, {device} fill it). */
  readonly lines: Readonly<
    Record<
      | "copy"
      | "set"
      | "add"
      | "subtract"
      | "read"
      | "show"
      | "setLamps"
      | "goto"
      | "nothing"
      | "ifEqual"
      | "ifDiffer"
      | "ifLess"
      | "ifNotLess"
      | "stop",
      string
    >
  >;
  /** What a line reads from, by the device's name in the model. */
  readonly devices: Readonly<Record<string, string>>;
  readonly readingsLegend: string;
  readonly roomA: string;
  readonly roomB: string;
  readonly programCaption: string;
  readonly line: string;
  readonly does: string;
  readonly stored: string;
  readonly marks: string;
  readonly next: string;
  readonly stoppedHere: string;
  readonly step: string;
  readonly run: string;
  readonly pause: string;
  readonly reset: string;
  readonly status: {
    readonly next: string;
    readonly running: string;
    readonly stopped: string;
    readonly trapped: string;
    readonly gaveUp: string;
  };
  readonly numbersCaption: string;
  readonly name: string;
  readonly number: string;
  readonly changed: string;
  readonly notSet: string;
  readonly shopCaption: string;
  readonly display: string;
  /** A lamp's row: {name} is ALARM, NIGHT or CLASH. */
  readonly lamp: string;
  readonly lit: string;
  readonly dark: string;
  /** After a committed prediction: {answer} is the machine's. */
  readonly answer: string;
  readonly faultLegend: string;
  readonly healthy: string;
  readonly drawingTitle: string;
  /** The box for the number in line 5, which the learner may change. */
  readonly limitLabel: string;
  readonly ladder: {
    readonly paused: string;
    readonly levelsName: string;
    readonly up: string;
    readonly down: string;
    readonly position: string;
    readonly builtIn: string;
    readonly number: string;
    readonly digits: string;
    readonly high: string;
    readonly low: string;
    readonly drawingTitle: string;
  };
}

export const DEFAULT_VIEW_STRINGS: ViewStrings = {
  grading: {
    couldNotRun: "The tests could not run: {why}.",
  },
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
    resetRise: "↑ reset",
    title: "Timing diagram",
    cursorAt: "Red line {where}",
    valuesAfter: "Values {where}",
    valuesHere: "Values at the red line",
    afterRun: "after the run",
    afterMark: "after {mark}",
    atStart: "before the first step",
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
    settingsCaption: "Each setting the run made, and what the circuit gave",
    settingHeading: "Setting",
    setting: "Setting {n}",
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
    flipBare: "Bit {n}, now {bit}; press to change.",
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
    hexLabel: "{name} in hexadecimal",
    numberLabel: "{name} as a number, read signed",
    hexCaption: "Hexadecimal",
    numberCaption: "Number, read signed",
    set: "Set",
    setLabel: "Set {name}",
    empty: "Enter a value.",
    notHex: '"{char}" is not a hexadecimal digit; use 0 to 9 and A to F.',
    hexTooLong: "{name} is {width} bits, at most {digits} hexadecimal digits.",
    notNumber:
      '"{char}" is not part of a number. Type the digits 0 to 9, with a minus sign in front for a negative number.',
    numberRange: "{name} is {width} bits, so a number from {min} to {max}.",
    bitsSummary: "{name}'s bits, one at a time",
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
      // Module 0
      roomA: "Room A",
      roomB: "Room B",
      display: "The display",
      lamp: "The CLASH lamp",
    },
    unanswered: "Fill in {fields} to run the tests.",
    invalid: "{field} must be a valid entry.",
    ofYourBits: "What your bits read as",
    ofTheMemory: "What the memory gives",
    // Module 7
    otherThan: "anything other than {value}",
    // Module 0. Drafted by the prose process (docs/notes/module-0-machine/briefs/F2V.md).
    details: {
      runDisplay: "When the program stops, the display does not show {actual}.",
      runLamp: "When the program stops, CLASH is not {actual}.",
      traceChanged: "Your answer, {actual}, is not the number line 3 changes.",
      traceValue: "Line 3 does not give {actual}.",
      traceNext: "After line 3, the machine does not run line {actual} next.",
      tracePart: "The number line 3 gives does not come from {actual}.",
      slicesHigh: "The slices worth 128, 64, 32 and 16 do not give {actual}.",
      slicesLow: "The slices worth 8, 4, 2 and 1 do not give {actual}.",
      slices: "The eight slices do not give {actual}.",
      // Module 10 (decision A): the rule a wrong answer misses, never the right one
      // (docs/notes/module-10-instruction-set/briefs/6X.md).
      partSeen:
        "A program can see a part through a field that names it, an address a load or store reaches, or the PC.",
      reachLargest:
        "The constant is 12 bits, read signed; {actual} is not the largest number it can hold.",
      reachBack:
        "A branch's constant is its target's address less its own, divided by 4, written as 12 bits read signed; {actual} is not that for this branch.",
      reachFurthest:
        "A branch at 000 can reach 000 + 4 × the largest constant; {actual} is not that address.",
      // Module 11, lessons 5 and 6 (brief 7R2).
      storeCalls:
        "{actual} is not it; warmRooms is called once for the hall, then once for what lies behind each door of every room it finds, a room or nothing.",
      storeWords:
        "{actual} is not it; a call that finds a room pushes 4 words, and the words of every call not yet returned are on the stack together.",
      storeR14:
        "{actual} is not it; R14 starts at 7C0, and each word pushed takes 8 off it; give the address as three hexadecimal digits.",
      edgeLog:
        "On that log, the program and a right one show the same number, so that log cannot show the mistake.",
      // Brief 6RL3.
      edgeShows:
        "{actual} is not it; a right program counts only readings warmer than -180, and a reading equal to the limit is not warmer.",
      // Module 11, lesson 5 (brief 5L).
      recursionDepth:
        "{actual} is not it; a call that finds a room pushes 4 words, a call for a door that leads nowhere pushes none, and R14 starts at 7C0.",
      // Module 12, lesson 1.
      trapC2:
        "{actual} is not C2 after the trap. After a fault, C2 holds the address of the instruction that faulted.",
      trapC3:
        "{actual} is not C3 after the trap. C3 takes the fault's cause, two hexadecimal digits. The first digit says which step failed.",
      trapC1:
        "{actual} is not C1 after the trap. C1 takes C0 as it was. In this lesson, C0 is 01 throughout.",
      trapPc:
        "{actual} is not the PC after the trap. The PC takes C4, the handler's address, as three hexadecimal digits.",
      // Module 12, lessons 2 to 5.
      saveChoice:
        '"{actual}" is not it for this handler. Check every register the handler writes: is it saved before it is written, and put back from the same word before resume?',
      userRefusal:
        "{actual} is not the cause for this line. User mode refuses a load or store at a device's address (7C0 to 7F7) with 32, and resume, the control-register copies and stop with 22. Give 0 if user mode runs the line.",
      callLamps:
        "{actual} is not it. Job 3 sets each lamp from one bit of R2: bit 0 ALARM, bit 1 NIGHT, bit 2 CLASH, as the table of jobs says. R2 is the word with those bits set.",
      callShown:
        "{actual} is not what the program shows. Follow R1, R2 and R5 through each call: job 2 leaves the reading of the room R2 names in R1, and job 1 shows R2.",
      callC2:
        "{actual} is not C2 after the call. A system call's return point is the instruction after the call, as the prediction showed.",
      nextEdge:
        "{actual} is not what the next edge does. The next edge traps only when bit 1 of C0 is 1 and a bit of \"waiting\" is set. The timer's 81 goes before the door's 82. Give 0 if the instruction runs.",
      nestC1:
        "{actual} is not C1 after the door's interrupt. C1 takes C0 as it is when the interrupt comes, and job 5 wrote C0 for its loop.",
      nestC3: "{actual} is not C3 after the door's interrupt. C3 takes the event's cause.",
      nestSaved:
        "{actual} is not the word at 418. Job 5 saved C2 there when it began. That word is the return point of the program's call system.",
      nestC0: "{actual} is not C0 after the door part's resume. resume copies C1 into C0.",
      bitsForm:
        "{actual} has the right value, but this page writes C0 and C1 as their two bits, bit 1 first, such as 01. Give it in that form.",
      edgesStop:
        "{actual} is not the number of edges. The decoder refuses stop in user mode. Its cause appears in READ, and that edge ends the instruction.",
      edgesResume:
        "{actual} is not the number of edges. In system mode resume does not trap: it goes from READ to WRITE, as a control-register copy does.",
      edgesInterrupt:
        "{actual} is not the number of edges. An interrupt is taken at the edge that would fetch, and that edge is all it takes.",
      edgesLoad:
        "{actual} is not the number of edges. The memory's checks give their cause in MEMORY, and a load that traps there never reaches WRITE.",
      // Module 13, lesson 1 (brief 1D).
      joinMq: "Open the datapath and follow MQ from where it enters to the part it goes into.",
      joinAddr:
        "Open the datapath and follow ADDR back from where it leaves to the part that drives it.",
      joinWaiting:
        "Open the control unit and follow WAITING from where it enters to the part it goes into.",
      joinStatus:
        "Open the datapath and follow STATUS back from where it leaves to the part that drives it.",
      joinIrEdge:
        "`{actual}` is not the edge at which the IR takes `resume`'s word. The IR takes an instruction's word at its FETCH edge; add up the edges each earlier line takes, from the reset.",
      joinPcEdge:
        "`{actual}` is not the edge at which the PC takes `010`. The instruction `resume` takes three edges, and the PC takes the return point at the last of them.",
      // Module 13, lesson 2 (brief 2D).
      pathCode:
        "`{actual}` does not follow the rule for a set if line: its eight digits are K, J, A, B and Y, then three digits of constant; set if is kind A, and its job digit is a branch's condition.",
      pathEdges:
        "`{actual}` is not the count. Count the states a load passes through, from its FETCH edge to its last.",
      pathJob:
        "`{actual}` is not the ALU's job at its ALU edge. Ask what a load needs the ALU to work out.",
      pathYin:
        "`{actual}` is not the word Y takes. Ask which held word feeds Y at a load's WRITE edge, and what it took at the MEMORY edge.",
      pathPc:
        "`{actual}` is not the PC after the last edge. An instruction that does not branch, call or jump leaves the PC at its own address plus 4. Give the PC as three hexadecimal digits.",
      // Module 13, lesson 3 (brief 3L).
      traceXorB:
        "Your row is {actual}. Pause at the ALU edge of `R3 <= R1 - R2`, open the ALU down to the group `q0`, and read `xorB` in each slice. It turns B's bit over when the ALU subtracts.",
      traceCarry:
        "Your row is {actual}. At the ALU edge of `R5 <= R3 >= R4 signed`, open each slice's full adder and read its carry out, starting with bit 3.",
      tracePcD:
        "Your row is {actual}. Pause at the ALU edge of `goto R15`. Show the PC's bits from the list of parts that never open. D is the bit of the address the jump goes to.",
      traceEn:
        "Your row is {actual}. Pause at the WRITE edge of `R5 <= R3 >= R4 signed`. Show the register file's bit for each register. Only one register is written at an edge.",
      // Module 11, lesson 4 (brief 4L).
      stackWord:
        "{actual} is not that word; a pop copies a word, adds 8 to R14, and leaves the word where it was. Give the word as three hexadecimal digits.",
      stackAddress:
        "{actual} is not that address; R14 starts at 7C0 and each push takes 8 off it before it stores.",
      // Module 11, lesson 1 (brief 1L).
      asmAddress:
        "{actual} is not the address. Each instruction takes 4 bytes from 000; a word starts at a multiple of 8.",
      asmBranchWord:
        "{actual} is not the branch's word. A branch has kind 5, the condition's job, registers A and B, and a constant counting instructions.",
      asmLoadWord:
        "{actual} is not the load's word. A load has kind 3, job 8, with Y as the register written and the constant as the address.",
      codeFate:
        "A code is taken if K and J name an instruction the course's machine accepts today; a refused code is free, except all zeros, which must stay refused.",
      countWith:
        "Count every instruction in the run, including those in routines you call and return from; {actual} is not that count.",
      countWithout:
        "Without the call through a register, each call takes two instructions: a constant job and a jump through R4; {actual} is not that count.",
      designKind:
        "A code is free for your design only if your copy of the machine refuses it today.",
      designField:
        "The register an instruction writes must be named in the place every instruction gives it.",
      designCondition:
        "The condition must come from a field that means the same thing in every kind that uses it.",
      designProgram:
        "Count the instructions each program runs with the new instruction; the one with fewer is shortened.",
      designCost: "The circuit must gain hardware or a control signal it does not already have.",
    },
    invalidForm: {
      number: "{field} wants a whole number, in decimal, such as -12 or 40.",
      hex: "{field} wants hexadecimal digits, 0 to 9 and A to F, such as 02C.",
    },
    invalidFor: {
      slices:
        "Type eight 1s and 0s, one for each slice, the slice worth 128 first; a space between the two groups of four is allowed.",
    },
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
    halted: "Halted: {reason}.",
    haltsNext: "Halts at the next edge: {reason}.",
    gaveUp: "The machine did not stop after {edges} edges, so the run gave up; PC is {pc}.",
    runningEdges: "{edges} edges made so far.",
    reasons: {
      "11": "instruction fetch outside the ROM",
      "12": "fetch at an address not a multiple of 4",
      "21": "an illegal instruction",
      "22": "an instruction that user mode refuses",
      "31": "no memory at the address",
      "32": "a device's address in user mode",
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
    stepInside: "No named bus changed; this step was inside the blocks.",
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
  // Module 9. Drafted by the prose process (brief 6V, docs/notes/module-9-control/briefs/6V.md).
  control: {
    tableCaption: "The decoder's control signals",
    signal: "Signal",
    kindHeading: "{kind}",
    jobBit: "J{bit}",
    kinds: {
      "1": "1 register job",
      "2": "2 constant job",
      "3": "3 load",
      "4": "4 store",
      "5": "5 branch",
      "6": "6 call",
      "7": "7 jump",
      "8": "8 system job",
      "9": "9 call through a register",
      // Module 10's capstone, in the learner's copy (strings10.ts's brief, 6V).
      "10": "A set if",
    },
    jobBitNote: "J2 means bit 2 of the job digit.",
    mapCaption: "Which kinds and jobs are instructions",
    mapCorner: "K\\J",
    legal: "✓",
    illegal: "·",
    depends: "c",
    cellLabel: "K {k}, J {j}: {meaning}",
    legalMeaning: "instruction",
    illegalMeaning: "not an instruction",
    dependsMeaning: "instruction when the constant is 0 to 4",
    legend: "✓ instruction, · not an instruction, c depends on the constant",
    edgesCaption: "Edges each kind takes",
    kind: "Kind",
    states: "States",
    edges: "Edges",
    then: " → ",
    opsCaption: "The instruction's edges",
    edge: "Edge",
    state: "State",
    ops: "Transfers",
    nextMark: "next",
    opsNone: "No register transfers yet.",
    opFetch: "IR ← memory[PC]",
    opRead: "HA ← R{a}, HB ← R{b}",
    opAlu: "HR ← {left} {job} {right}",
    opAluCopy: "HR ← {right}",
    opAluUp: "HR ← {left} + 1",
    opAluDown: "HR ← {left} - 1",
    opLoadWord: "HM ← word[HR]",
    opLoadByte: "HM ← byte[HR]",
    opStoreWord: "word[HR] ← HB",
    opStoreByte: "byte[HR] ← HB",
    opWrite: "R{y} ← {from}",
    opPc: "PC ← {to}",
    sources: { HR: "HR", HM: "HM", PC4: "PC + 4", TARGET: "PC + 4c", RESULT: "HA + c" },
    jobs: { "0": "AND", "1": "XOR", "2": "+", "3": "-", "4": "OR" },
    opNone: "nothing: the machine stops",
    opJoin: "; ",
    signalsCaption: "Control signals at the next edge",
    value: "Value",
    statesTitle: "Controller states",
    timingTitle: "Edges so far",
  },
  // Module 10 (strings10.ts).
  machine10: MACHINE10_STRINGS,
  // Module 11 (strings11.ts).
  machine11: MACHINE11_STRINGS,
  // Module 12 (strings12.ts).
  machine12: MACHINE12_STRINGS,
  // Module 13 (strings13.ts).
  machine13: MACHINE13_STRINGS,
  // Module 0. Drafted by the prose process (docs/notes/module-0-machine/briefs/6V.md).
  meet: {
    lines: {
      copy: "{y} becomes {b}",
      set: "{y} becomes {n}",
      add: "{y} becomes {a} plus {b}",
      subtract: "{y} becomes {a} minus {b}",
      read: "{y} becomes {device}",
      show: "Show {b} on the display",
      setLamps: "Set the lamps from {b}",
      goto: "Go to line {line}",
      nothing: "Do nothing",
      ifEqual: "If {a} equals {b}, go to line {line}",
      ifDiffer: "If {a} is not equal to {b}, go to line {line}",
      ifLess: "If {a} is less than {b}, go to line {line}",
      ifNotLess: "If {a} is not less than {b}, go to line {line}",
      stop: "Stop",
    },
    devices: {
      sensorA: "room A's reading",
      sensorB: "room B's reading",
      signals: "the DOOR and WARM signals",
      display: "the display's number",
      lamps: "the lamps",
      timer: "the timer's count",
    },
    readingsLegend: "Room readings, in tenths of a degree",
    roomA: "Room A",
    roomB: "Room B",
    programCaption: "The program",
    line: "Line",
    does: "What it does",
    stored: "Kept as",
    marks: "Now",
    next: "Next",
    stoppedHere: "Stopped",
    step: "Run one line",
    run: "Run",
    pause: "Pause",
    reset: "Start again",
    status: {
      next: "Next: line {line}.",
      running: "Running. Next: line {line}.",
      stopped: "Stopped: line {line}.",
      trapped: "Stopped: it cannot run line {line}.",
      gaveUp: "Ran {lines} lines; paused before line {line}.",
    },
    numbersCaption: "The numbers it keeps",
    name: "Name",
    number: "Number",
    changed: "Changed",
    notSet: "Not set",
    shopCaption: "What the shop sees",
    display: "The display",
    lamp: "{name} lamp",
    lit: "lit",
    dark: "dark",
    answer: "The machine's answer: {answer}.",
    faultLegend: "Stuck wire",
    healthy: "No fault",
    drawingTitle: "Inside the machine",
    limitLabel: "Line 5's number",
    ladder: {
      paused: "Paused before line {line}: {text}.",
      levelsName: "Levels",
      up: "Up a level",
      down: "Down a level",
      position: "Level {k} of {n}",
      builtIn: "Built in Module {module}: {name}",
      number: "The number here: {value}",
      digits: "Its 1s and 0s: {digits}",
      high: "The wire is high and stands for 1.",
      low: "The wire is low and stands for 0.",
      drawingTitle: "Inside this part",
    },
  },
};

export const ViewStringsContext = createContext<ViewStrings>(DEFAULT_VIEW_STRINGS);

export function useViewStrings(): ViewStrings {
  return useContext(ViewStringsContext);
}

/** Fills `{slot}`s in a template. A slot with no value is left as written. */
/**
 * "You chose …" with a prediction's option: an option written as a sentence keeps its own full
 * stop, and the line adds none of its own after it.
 */
export function youChose(template: string, choice: string): string {
  return format(template, { choice: choice.replace(/\.$/, "") });
}

export function format(template: string, slots: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const v = slots[key];
    return v === undefined ? whole : String(v);
  });
}
