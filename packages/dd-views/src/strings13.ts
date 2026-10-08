// Copyright © 2026 Christopher Snow

// Module 13's figure words: the run of the whole machine stepped edge by edge, the instruction at
// every level, each part's maker, the comparison with the instruction-level model, and the trace.
// Kept in a file of their own and joined to the view strings as `machine13`. Drafted by the prose
// process (docs/notes/module-13-machine/briefs, briefs V1 to V3) and checked against the figures.

export interface Machine13Strings {
  // The controls of a recorded run.
  readonly nextEdge: string;
  readonly backEdge: string;
  readonly toEnd: string;
  readonly reset: string;
  /** Before the first edge: {line}, {address}. */
  readonly atStart: string;
  /** {n} edges run; the next is the {state} edge of {line} at {address}. */
  readonly atEdge: string;
  /** The run stopped at {address}, at `stop`. */
  readonly stopped: string;
  /** The machine halted at {address} with cause {cause}. */
  readonly halted: string;
  /** The run was cut off after {n} edges. */
  readonly cutOff: string;
  /** For a trap: the next edge traps with cause {cause}. */
  readonly trapsNext: string;

  // The instruction at every level.
  readonly levelsCaption: string;
  readonly level: string;
  readonly shows: string;
  readonly line: string;
  readonly address: string;
  readonly machineCode: string;
  readonly inIr: string;
  /** The IR's fields, {k} {j} {a} {b} {y} {c}. */
  readonly fields: string;
  readonly state: string;
  /** A control signal's row: {name}. */
  readonly signal: string;
  readonly noLine: string;

  // Each part's maker.
  readonly makersCaption: string;
  readonly part: string;
  readonly builtIn: string;
  /** {n}: the module. */
  readonly builtModule: string;
  /** {n}: the module; {list}: the modules that grew it. */
  readonly builtGrown: string;
  /** Between two modules in {list}, and before the last. */
  readonly and: string;
  readonly whole: string;

  // The comparison with the instruction-level model.
  /** {n} steps compared so far. */
  readonly agrees: string;
  readonly agreesNone: string;
  /** {line} at {address}; {what}: a register or a device; {machine} and {model}: values. */
  readonly differs: string;
  /** The machine halts at {line} at {address} with cause {cause}; the model does not. */
  readonly haltsAlone: string;
  /** The model stops at {line} at {address}; the machine does not. */
  readonly stopsAlone: string;
  readonly unknown: string;
  /** Names of what is compared, as the sentence above writes them. */
  readonly what: Readonly<Record<string, string>>;

  // The control registers' table.
  readonly controlCaption: string;

  // The trace (lesson 3 on).
  /** The choice of where to pause: a line, an edge of it, and the button. */
  readonly pauseLegend: string;
  readonly pauseLine: string;
  readonly pauseEdge: string;
  readonly pauseGo: string;
  /** {k}: an edge of the line, counted from its FETCH edge, 1 first; {state}: its state. */
  readonly pauseEdgeOption: string;
  readonly traceCaption: string;
  readonly traceLevel: string;
  readonly traceIn: string;
  readonly traceOut: string;
  /** A port and its value: {port}, {value}. */
  readonly tracePort: string;
  // The parts that never open, and one bit of each.
  readonly closedCaption: string;
  /** {part}: its name; {module}: the module whose drawing of one bit stands for it. */
  readonly closedOpen: string;
  /** {part}: a part that only splits or joins words, with no gate in it. */
  readonly closedWiring: string;
  readonly bitWhich: string;
  readonly bitRegister: string;
  readonly bitByte: string;
  readonly bitPair: string;
  /** {part}, {k}, {module}: the heading over the drawing of one bit. */
  readonly bitHeading: string;
  /** For a register's bit: {held} now, {result} after the next edge. */
  readonly bitHolds: string;
  /** For a selector's or an adder's bit: {result} now. */
  readonly bitGives: string;

  // The lab (lesson 4).
  readonly labOutline: string;
  readonly labParts: string;
  readonly labEmpty: string;
  readonly labReplace: string;
  readonly labKeep: string;
  // The lab's verdict is plain text, not Markdown: its sentences quote the line, with no code.
  /** {line} at {address}; {what}; {machine} on the learner's machine; {model} by the model. */
  readonly labDiffers: string;
  readonly labHalts: string;
  readonly labStopsOnly: string;
  readonly labRunsOn: string;

  // The lab's runs of a text, in a figure (lesson 4).
  readonly labTextLegend: string;
  readonly labProgramLegend: string;
  readonly labRun: string;
  readonly labRunning: string;
  /** The heading over the line a text changes. */
  readonly labChange: string;
  readonly labRunsCaption: string;
  /** One run: {text}, {program}, {result}. */
  readonly labRunLine: string;
  /** {n}: the steps compared. */
  readonly labRunAgrees: string;
  /** The machine stops at `stop` at {line} at {address}; the model does not. */
  readonly labRunStops: string;
  /** The model stops or halts at {line} at {address}; the machine goes on. */
  readonly labRunGoesOn: string;
  /** After a prediction: {answer}, the option the runs give. */
  readonly labAnswer: string;

  // The capstone (lesson 5). Its verdict is plain text: no code, no Markdown.
  readonly capTrace: string;
  readonly capTraceCaption: string;
  /** {a}, {b}: the rooms' readings; {display}, {lamps}: what the program left; {want...}: the task's. */
  readonly capWrong: string;
  /** {a}, {b}; {cause}. */
  readonly capHalts: string;
  /** {a}, {b}. */
  readonly capNoStop: string;
  readonly capUnanswered: string;
  readonly capNoSetIf: string;
  readonly capNoStore: string;
  readonly capNoEdge: string;
  /** For each trace question while the program fails one of its own tests. */
  readonly capFirst: string;
  /** For a wrong answer: the level to look at, never the value, by question. */
  readonly capLevels: Readonly<Record<string, string>>;
}

export const MACHINE13_STRINGS: Machine13Strings = {
  nextEdge: "Next edge",
  backEdge: "Step back",
  toEnd: "Run to the end",
  reset: "Start again",
  atStart:
    "After the reset, and before the first edge, the next edge fetches `{line}`, at `{address}`.",
  atEdge: "Edge {n} has run. The next edge is the {state} edge of `{line}`, at `{address}`.",
  stopped: "The run stopped at `{address}`, where the instruction is `stop`.",
  halted: "The machine halted at `{address}` with cause `{cause}`.",
  cutOff: "The run was cut off after {n} edges.",
  trapsNext: "The next edge traps, with cause `{cause}`.",

  levelsCaption: "The instruction at every level",
  level: "Level",
  shows: "What it shows",
  line: "Line",
  address: "Address",
  machineCode: "Its word in the ROM",
  inIr: "The word in the IR",
  fields: "K {k}, J {j}, A {a}, B {b}, Y {y}, constant {c}",
  state: "The controller's state",
  signal: "{name}",
  noLine: "No line",

  makersCaption: "The parts at this level, and the module that built each",
  part: "Part",
  builtIn: "Built in",
  builtModule: "Module {n}",
  builtGrown: "Module {n}, grown in {list}",
  and: "and",
  whole: "The whole machine",

  agrees:
    "The circuit and the model agree after every instruction and every trap so far: {n} of them.",
  agreesNone: "No instruction has ended yet.",
  differs:
    "After `{line}` at `{address}`, {what} is {machine} on the machine and {model} by the model.",
  haltsAlone:
    "At `{line}` at `{address}`, the machine halts with cause `{cause}`; the model does not halt.",
  stopsAlone: "At `{line}` at `{address}`, the model stops; the machine does not.",
  unknown: "unknown",
  what: {
    PC: "the PC",
    display: "the display",
    lamps: "the lamps",
    timer: "the timer",
    waiting: '"waiting"',
  },

  controlCaption: "The control registers",

  pauseLegend: "Pause before an edge",
  pauseLine: "Line of the program",
  pauseEdge: "Which edge of that line",
  pauseGo: "Go there",
  pauseEdgeOption: "Edge {k}, {state}",
  traceCaption: "The levels you have opened",
  traceLevel: "Level",
  traceIn: "Inputs",
  traceOut: "Outputs",
  tracePort: "{port} {value}",
  closedCaption: "Parts here that never open",
  closedOpen: "{part}: show one bit, as Module {module} drew it",
  closedWiring: "{part} only splits or joins words; it has no gate.",
  bitWhich: "Bit",
  bitRegister: "Register",
  bitByte: "Byte at",
  bitPair: "Word",
  bitHeading: "{part}, bit {k}, as Module {module} drew one bit",
  bitHolds: "It holds {held} now; after the next edge it holds {result}.",
  bitGives: "It gives {result} now.",

  labOutline: "Start from the outline",
  labParts: "Start from the parts",
  labEmpty: "Start from nothing",
  labReplace: "Replace my text",
  labKeep: "Keep my text",
  labDiffers:
    'After "{line}" at {address}, {what} is {machine} on your machine and {model} by the model.',
  labHalts: 'At "{line}" at {address}, your machine halts with cause {cause}; the model does not.',
  labStopsOnly: 'At "{line}" at {address}, your machine stops; the model does not.',
  labRunsOn: 'At "{line}" at {address}, the model stops or halts; your machine goes on.',

  labTextLegend: "Which text runs",
  labProgramLegend: "Which program runs",
  labRun: "Run it",
  labRunning: "Running",
  labChange: "The line this text changes",
  labRunsCaption: "The runs so far",
  labRunLine: "{text}, {program}: {result}",
  labRunAgrees:
    "The machine and the model agree after every one of its {n} instructions and traps.",
  labRunStops: "At `{line}` at `{address}`, the machine stops; the model does not.",
  labRunGoesOn: "At `{line}` at `{address}`, the model stops or halts; the machine goes on.",
  labAnswer: "The runs answer: {answer}.",

  capTrace: "Run my program on the whole machine",
  capTraceCaption: "Your program on the whole machine",
  capWrong:
    "With room A at {a} and room B at {b}, your program leaves {display} on the display and {lamps} on the lamps. The task asks for {wantDisplay} and {wantLamps}.",
  capHalts:
    "With room A at {a} and room B at {b}, your program halts with cause {cause} before it stops.",
  capNoStop:
    "With room A at {a} and room B at {b}, your program does not reach stop within its limit of instructions.",
  capUnanswered:
    "This question has no answer yet, or the answer is not a value of the form asked for.",
  capNoSetIf: "Your program has no set if, so this question has no edge to read.",
  capNoStore: "Your program has no store, so this question has no edge to read.",
  capNoEdge: "Your program's run does not reach the edge this question names.",
  capFirst:
    "Your program does not do the task yet, so this question is not graded; make the program pass its tests first.",
  capLevels: {
    result:
      "Pause before the ALU edge of your first set if. Read Y where it leaves the ALU in the datapath, as a signed number.",
    carry:
      "At that same edge, read COUT where it leaves the ALU. It is the carry out of the ALU's top bit, not the condition.",
    met: "At that same edge, read MET where it leaves the condition block in the datapath. It is worked out from the ALU's flags and the job digit.",
    address:
      "Pause before the MEMORY edge of your first store. Read ADDR, the address the memory port reads, which comes from HR at that edge.",
    pcBit:
      'Pause before the WRITE edge of your first set if. Show the PC\'s bit 4 from "Parts here that never open", and read D.',
  },
};
