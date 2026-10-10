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
  /** The run over time, by the step controls: its legend, its moves, and one edge's button. */
  readonly stripLegend: string;
  readonly stripEarlier: string;
  readonly stripLater: string;
  /** {n}: the edge, counted from the reset; {state}: its state. */
  readonly stripEdge: string;
  /** Under the drawing: a wire can be pressed, and stays pinned as blocks open. */
  readonly pinNote: string;
  /** A table row's button: {row}, the row's label; {wire}, the wire it reads. */
  readonly rowPin: string;
  /** In the row "Its word in the ROM", until the figure's first edge has run. */
  readonly romLater: string;
  /** In a prediction's verdict, before the next edge: the explanation follows it. */
  readonly explainNext: string;
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
  readonly closedWiringMany: string;
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
  /** The model stops at `stop` at {line} at {address}; the learner's machine goes on. */
  readonly labRunsOnStop: string;
  /** The model halts there with cause {cause}; the learner's machine goes on. */
  readonly labRunsOnHalt: string;
  /** A register's small word: {n} in decimal, {hex} its three hexadecimal digits. */
  readonly labWordHex: string;
  /** {program}: a program's name, over its lines and their addresses. */
  readonly labListing: string;
  /** Over the test programs' listings, under the lab's text. */
  readonly labPrograms: string;

  // The lab's runs of a text, in a figure (lesson 4).
  readonly labTextLegend: string;
  readonly labProgramLegend: string;
  readonly labRun: string;
  readonly labRunning: string;
  /** The heading over the line a text changes. */
  readonly labChange: string;
  /** The button that shows a hidden changed line, once the run that finds it is made. */
  readonly labShowChange: string;
  readonly labRunsCaption: string;
  /** One run: {text}, {program}, {result}. */
  readonly labRunLine: string;
  /** {n}: the steps compared. */
  readonly labRunAgrees: string;
  /** The machine stops at `stop` at {line} at {address}; the model does not. */
  readonly labRunStops: string;
  /** The model stops or halts at {line} at {address}; the machine goes on. */
  readonly labRunGoesOnStop: string;
  readonly labRunGoesOnHalt: string;
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
  /** {registers}: "R1", or "R1 and R2". */
  readonly capUnknown: string;
  readonly capUnanswered: string;
  /** An answer typed that is not a signed decimal number (nor X). */
  readonly capFormSigned: string;
  /** An answer typed that is not a row of {n} bits. */
  readonly capFormBits: string;
  readonly capNoSetIf: string;
  readonly capNoEdge: string;
  /** For each trace question while the program fails one of its own tests. */
  readonly capFirst: string;
  /** For a wrong answer: the level to look at, never the value, by question. */
  readonly capLevels: Readonly<Record<string, string>>;

  // The lab's drawing of a text's joins (lesson 4).
  readonly joinsMap: string;
  readonly joinsBlocks: Readonly<Record<string, string>>;
  /** {n}: the part's ports nothing joins. */
  readonly joinsOpenCount: string;
  readonly joinsAllJoined: string;
  readonly joinsMissing: string;
  /** {part}: the part whose joins are drawn. */
  readonly joinsPartLabel: string;
  readonly joinsOpen: string;
  /** {name}: one of the machine's inputs. */
  readonly joinsInput: string;
  /** {name}: one of the machine's outputs. */
  readonly joinsOutput: string;
  /** {text}: what the text writes at a port, worked out in its own logic. */
  readonly joinsText: string;
  readonly joinsReadByText: string;
  readonly joinsUnread: string;
  /** {problem}: why the text cannot be read. */
  readonly joinsNone: string;
  readonly joinsMarkNote: string;
  /** On the map, under a part the chosen {part} joins to. */
  readonly joinsLinked: string;
  /** On a figure's map, under the part the last run's sentence names. */
  readonly joinsRunMark: string;
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
    lamps: "the lamp word",
    timer: "the timer",
    waiting: '"waiting"',
  },

  controlCaption: "The control registers",

  stripLegend:
    "The run. Each line shows its address, its text and its edges. Press an edge to pause the run before it.",
  stripEarlier: "Earlier lines",
  stripLater: "Later lines",
  stripEdge: "Edge {n}, {state}",
  romLater: "Shows after the next edge.",
  rowPin: "{row}: pin {wire} on the drawing",
  pinNote:
    "Press a wire to pin it: it stays marked as you open blocks, and its name and value show under the drawing, in hexadecimal for a word. A band of colour marks the wires the next edge uses, from each register, held word, memory or device it writes back along each selector's chosen input to where the value starts.",
  explainNext: 'Press "Next edge" to see why. The explanation appears after that edge.',
  traceCaption: "The levels you have opened",
  traceLevel: "Level",
  traceIn: "Inputs",
  traceOut: "Outputs",
  tracePort: "{port} {value}",
  closedCaption: "Parts here that never open",
  closedOpen: "{part}: show one bit, as Module {module} drew it",
  closedWiring: "{part} only splits or joins words; it has no gate.",
  closedWiringMany:
    "{parts} only split or join words; they have no gate, and a trace passes through them.",
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
  labRunsOnStop: 'At "{line}" at {address}, the model stops at stop; your machine goes on.',
  labRunsOnHalt:
    'At "{line}" at {address}, the model halts with cause {cause}; your machine goes on.',
  labWordHex: "{n} ({hex})",
  labListing: "{program}, line by line",
  labPrograms: "The seven test programs",

  labTextLegend: "Which text runs",
  labProgramLegend: "Which program runs",
  labRun: "Run it",
  labRunning: "Running",
  labShowChange: "Show the line this text changes",
  labChange: "The line this text changes",
  labRunsCaption: "The runs so far",
  labRunLine: "{text}, {program}: {result}",
  labRunAgrees:
    "The machine and the model agree after every one of its {n} instructions and traps.",
  labRunStops: "At `{line}` at `{address}`, the machine stops; the model does not.",
  labRunGoesOnStop: "At `{line}` at `{address}`, the model stops at `stop`; the machine goes on.",
  labRunGoesOnHalt:
    "At `{line}` at `{address}`, the model halts with cause `{cause}`; the machine goes on.",
  labAnswer: "The runs answer: {answer}.",

  capTrace: "Run my program on the whole machine",
  capTraceCaption: "Your program on the whole machine",
  capWrong:
    "With room A at {a} and room B at {b}, your program leaves {display} on the display and {lamps} on the lamps. The task asks for {wantDisplay} and {wantLamps}.",
  capHalts:
    "With room A at {a} and room B at {b}, your program halts with cause {cause} before it stops.",
  capUnknown:
    "[draft] With room A at {a} and room B at {b}, your program reaches `{line}` at `{address}`, where {registers} holds no value yet.",
  capNoStop:
    "With room A at {a} and room B at {b}, your program does not reach stop within its limit of instructions.",
  capFormSigned: "[draft] capFormSigned",
  capFormBits: "[draft] capFormBits {n}",
  capUnanswered:
    "This question has no answer yet, or the answer is not a value of the form asked for.",
  capNoSetIf: "Your program has no set if, so this question has no edge to read.",
  capNoEdge: "Your program's run does not reach the edge this question names.",
  capFirst:
    "Your program does not do the task yet, so this question is not graded; make the program pass its tests first.",
  capLevels: {
    result:
      "Pause before the ALU edge of your first set if. Read RESULT where it leaves the ALU in the datapath, in hexadecimal, and write it as a signed decimal number.",
    flags: "[draft] flags",
    xorB: "[draft] xorB",
    held: "[draft] held",
  },

  joinsMap: "the nine parts, by block",
  joinsBlocks: {
    control: "control unit",
    datapath: "datapath",
    port: "memory port",
  },
  joinsOpenCount: "{n} of its ports joined to nothing",
  joinsAllJoined: "every port joined",
  joinsMissing: "the text does not place this part",
  joinsPartLabel: "{part}'s joins",
  joinsOpen: "open, joined to nothing",
  joinsInput: "machine input {name}",
  joinsOutput: "machine output {name}",
  joinsText: "the text's own logic, {text}",
  joinsReadByText: "read by the text's own logic",
  joinsUnread: "read by nothing",
  joinsNone: "The joins cannot be drawn: {problem}",
  joinsMarkNote:
    "After a run, the part holding the value the sentence names is marked, and a sentence about the PC marks none.",
  joinsLinked: "joined to {part}",
  joinsRunMark: "holds a value the last run names",
};
