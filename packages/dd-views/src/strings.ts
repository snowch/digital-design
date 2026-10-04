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
}

export const DEFAULT_VIEW_STRINGS: ViewStrings = {
  circuit: {
    where: "Where you are in the circuit",
    toggle: "Press to toggle.",
    open: "Press to look inside.",
    marked: "the diagnosis points here",
    signals: "Signals",
    signal: "Signal",
    role: "Role",
    value: "Value",
    input: "input",
    output: "output",
  },
  builder: {
    palette: "Parts",
    add: "Add {label}",
    deleteSelected: "Delete selected",
    tidy: "Tidy layout",
    help: "Add a part, then press a port to start a wire and another port to finish it. Arrow keys move the selected part; Delete removes it.",
    partHelp: "Arrow keys move it. Delete removes it.",
    wireHelp: "Delete removes it.",
    startWire: "Press to start a wire here.",
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
    removedWire: "Removed the wire from {from} to {to}.",
    pinsStay: "The circuit's inputs and outputs stay.",
    pendingFromOutput: "Wiring from {port}. Now choose an input port.",
    pendingFromInput: "Wiring to {port}. Now choose an output port.",
    cancelled: "Wiring cancelled.",
    notAPair: "A wire joins an output to an input. {a} and {b} are both {role}.",
    connected: "Connected {from} to {to}.",
    selectedPart: "{id} selected.",
    selectedWire: "Wire selected.",
    looseEnds: "{n} loose ends",
  },
  hdl: {
    ok: "The text describes a circuit.",
    drawn: "The circuit the text describes",
  },
  editor: {
    drawingTitle: "Your drawing",
    tryIt: "Try it",
    tryItTitle: "Your circuit, running",
    clock: "Clock {name}",
    resetSim: "Start again",
    asText: "As text",
    importHeading: "Draw from text",
    importLabel: "Text to draw",
    importButton: "Draw this text",
    imported: "Drawn.",
    importPorts: "The module's ports must be {ports}.",
    writeTitle: "Your text",
    notSettled: "The circuit did not settle: the values marked X keep changing.",
  },
  grade: {
    nothingDrawn: "Nothing is drawn yet.",
    nothingWritten: "Nothing is written yet.",
    undriven: "Nothing drives {names}.",
    ports: "The circuit must have inputs {inputs} and outputs {outputs}.",
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
