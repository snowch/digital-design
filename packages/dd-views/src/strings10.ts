// Copyright © 2026 Christopher Snow

// Module 10's figure words: the two machines compared, the encoding explorer and its calculator,
// the layouts compared, the comparisons swapped and the programs compared. Kept in a file of
// their own and joined to the view strings as `machine10`. Drafted by the prose process (brief
// 6V, docs/notes/module-10-instruction-set/briefs/6V.md) and checked against the figures.

export interface Machine10Strings {
  // The two machines compared (machine-compare).
  readonly singleName: string;
  readonly multiName: string;
  readonly seenCaption: string;
  readonly part: string;
  readonly differs: string;
  readonly differsMark: string;
  readonly pc: string;
  readonly register: string;
  readonly display: string;
  readonly ownCaption: string;
  readonly state: string;
  readonly ownNote: string;
  readonly logCaption: string;
  readonly instruction: string;
  readonly singleEdges: string;
  readonly multiEdges: string;
  readonly after: string;
  readonly agree: string;
  /** {names}: what the machines differ on. */
  readonly disagree: string;
  readonly stops: string;
  readonly logNone: string;
  readonly clock: string;
  readonly next: string;
  readonly run: string;
  readonly reset: string;
  /** {k}: Module 9's edges into the instruction at {address}. */
  readonly statusIn: string;
  readonly statusBetween: string;
  readonly statusStopped: string;
  /** {n}: instructions run without a stop. */
  readonly statusGaveUp: string;
  /** After a prediction: what the machines did, {answer}. */
  readonly answer: string;
  readonly nothing: string;

  // The layouts compared (layout-compare).
  readonly courseLayout: string;
  readonly packedLayout: string;
  /** {word}: the instruction's eight digits in a layout. */
  readonly layoutWord: string;
  /** {bits}, {min}, {max}: the constant's width and range in a layout. */
  readonly layoutRange: string;
  /** {names}: the fields that sit in other digits than in the course's layout. */
  readonly layoutMoved: string;
  readonly layoutStill: string;
  /** After a prediction: the fields the packed layout moves, {answer}. */
  readonly layoutAnswer: string;

  // The encoding explorer and the calculator (encoding-explorer).
  readonly wordLabel: string;
  readonly wordHelp: string;
  /** {n}: digits a word has. */
  readonly wordProblem: string;
  readonly examples: string;
  readonly fieldsLabel: string;
  readonly meaningHeading: string;
  readonly meanings: Readonly<Record<string, string>>;
  readonly jobs: Readonly<Record<string, string>>;
  /** The ALU's eight jobs by their code, as Module 7 names them. */
  readonly jobNames: Readonly<Record<string, string>>;
  /** A branch condition's sign, by job, and its reading after the second register. */
  readonly conds: Readonly<Record<string, string>>;
  readonly condReadings: Readonly<Record<string, string>>;
  readonly systemJobs: Readonly<Record<string, string>>;
  readonly illegal: Readonly<Record<string, string>>;
  /** {c}: the constant's digits, {w}: its 64-bit word, {n}: its value read signed. */
  readonly widened: string;
  readonly calcHeading: string;
  readonly widthLegend: string;
  /** {n}: bits. */
  readonly widthOption: string;
  readonly formLegend: string;
  readonly formHex: string;
  readonly formSigned: string;
  readonly aLabel: string;
  readonly bLabel: string;
  readonly jobLabel: string;
  /** {k}: the job's code, {name}: its name. */
  readonly jobOption: string;
  readonly fromWord: string;
  readonly fromWordNone: string;
  /** {job}: the job the button took from J. */
  readonly tookJob: string;
  readonly tookB: string;
  readonly yHeading: string;
  readonly yHex: string;
  readonly yUnsigned: string;
  readonly ySigned: string;
  readonly flagsLabel: string;
  /** {name}, {value}. */
  readonly flag: string;
  readonly bitsRow: string;
  readonly entryEmpty: string;
  /** {char}. */
  readonly entryNotHex: string;
  /** {digits}. */
  readonly entryHexLong: string;
  /** {char}. */
  readonly entryNotNumber: string;
  /** {min}, {max}. */
  readonly entryRange: string;

  // The comparisons swapped (swap-compare).
  readonly casesLegend: string;
  /** {a}, {b}: R1's and R2's words. */
  readonly swapCaption: string;
  readonly relation: string;
  readonly branch: string;
  readonly taken: string;
  readonly relations: Readonly<Record<string, string>>;
  /** {rel} the relation's sign, {reading} signed or unsigned. */
  readonly relationForm: string;
  readonly signedWord: string;
  readonly unsignedWord: string;
  /** {a}, {b} registers, {cond} the condition's sign, {reading} its reading. */
  readonly branchForm: string;
  readonly yes: string;
  readonly no: string;
  readonly swapKey: string;
  /** The subtraction a row's branch makes and its flags: {x} - {y}, {minus}, {over}, {cout}. */
  readonly flagsSigned: string;
  readonly flagsUnsigned: string;
  /** Before a prediction, the pairs it asks about; after it, the rows it asked about. */
  readonly pairsCaption: string;
  readonly askedCaption: string;
  /** {a} and {b}: a pair's R1 and R2. */
  readonly pairHeading: string;
  /** After a prediction: the branch that says it, {answer}. */
  readonly swapAnswer: string;

  // Two programs compared (program-compare).
  readonly listingCaption: string;
  /** {n} in each. */
  readonly written: string;
  readonly ran: string;
  /** {n}: instructions run by a program that halted with a cause, at no stop. */
  readonly ranNoStop: string;
  readonly romBytes: string;
  /** {n} the register, {value} its word read signed. */
  readonly registerAfter: string;
  readonly displayAfter: string;
  readonly runBoth: string;
  /** {address}: where a run stopped at `stop`. */
  readonly stoppedAtStop: string;
  /** {address}, {cause}: where a run stopped, and the cause. */
  readonly stoppedCause: string;
  readonly notStopped: string;
  readonly address: string;
  /** After a prediction: {answer}. */
  readonly programAnswer: string;
  /** After a prediction of a kind's edges, on `kind-edges`: {answer}. */
  readonly edgesAnswer: string;

  /** `machine-parts`: each part the lesson names, as each machine's circuit has it. */
  readonly partsCaption: string;
  /** The band of parts both machines share, and each machine's own (inside its outline). */
  readonly partsShared: string;
  readonly partsOwn: string;
  /** Lesson 10.3's map of the constants used as addresses. */
  readonly constantsCaption: string;
  /** A run of constants: {first} and {last}, three hex digits. */
  readonly constantsRun: string;
  /** The addresses they widen to: {first} and {last}, 16 hex digits. */
  readonly constantsWiden: string;
  readonly constantsParts: Readonly<
    Record<"rom" | "ram" | "devices" | "none" | "negative", string>
  >;
  /** A run no part answers: {cause}. */
  readonly constantsStop: string;
  readonly partNames: Readonly<
    Record<
      "registers" | "pc" | "memory" | "devices" | "ir" | "ha" | "hb" | "hr" | "hm" | "state",
      string
    >
  >;
  /** {count} and {width} in registers; {width} in register and romOutput; {names}, devices. */
  readonly forms: Readonly<
    Record<"registers" | "register" | "romOutput" | "memory" | "devices" | "none", string>
  >;
  readonly deviceNames: Readonly<Record<"display" | "lamps" | "timer" | "waiting", string>>;
}

export const MACHINE10_STRINGS: Machine10Strings = {
  singleName: "Module 8's machine",
  multiName: "Module 9's machine",
  seenCaption: "What a program can see",
  part: "Part",
  differs: "Same?",
  differsMark: "differs",
  pc: "PC",
  register: "R{n}",
  display: "display",
  ownCaption: "What Module 9's machine keeps of its own",
  state: "controller's state",
  ownNote: "Module 8's machine has none of these parts.",
  logCaption: "Instructions run",
  instruction: "Instruction",
  singleEdges: "Module 8",
  multiEdges: "Module 9",
  after: "After it",
  agree: "same",
  disagree: "differ: {names}",
  stops: "stops",
  logNone: "No instruction has finished yet.",
  clock: "Clock edge (Module 9's)",
  next: "Next instruction",
  run: "Run until it stops",
  reset: "Start again",
  statusIn: "Module 9's machine has made {k} edges of the instruction at {address}.",
  statusBetween: "Both machines are between two instructions.",
  statusStopped: "Both machines have stopped.",
  statusGaveUp: "{n} instructions have run and the machines have not stopped.",
  answer: "The machines differ on: {answer}.",
  nothing: "nothing",

  courseLayout: "The course's layout",
  packedLayout: "A packed layout",
  layoutWord: "Word: {word}",
  layoutRange: "Constant: {bits} bits, {min} to {max}.",
  layoutMoved: "Moved: {names}.",
  layoutStill: "No field moves.",
  layoutAnswer: "The packed layout moves: {answer}.",

  wordLabel: "Instruction (8 hexadecimal digits)",
  wordHelp: "Type a word, or choose one below.",
  wordProblem: "An instruction has {n} hexadecimal digits.",
  examples: "Words to try",
  fieldsLabel: "The word's fields",
  meaningHeading: "What the machine makes of it",
  meanings: {
    register: "R{y} ← R{a} {job} R{b}",
    registerCopy: "R{y} ← R{b}",
    registerUp: "R{y} ← R{a} + 1",
    registerDown: "R{y} ← R{a} - 1",
    constant: "R{y} ← R{a} {job} {c}",
    constantCopy: "R{y} ← {c}",
    loadWord: "R{y} ← memory[{address}]",
    loadByte: "R{y} ← the byte at memory[{address}]",
    storeWord: "memory[{address}] ← R{b}",
    storeByte: "the byte at memory[{address}] ← R{b}'s low byte",
    branch: "if R{a} {cond} R{b}{reading}: PC ← PC + 4 × {c}",
    branchAlways: "PC ← PC + 4 × {c}",
    branchNever: "nothing: the PC moves on",
    call: "R{y} ← PC + 4, PC ← PC + 4 × {c}",
    jump: "PC ← R{a} + {c}",
    setIf: "R{y} ← 1 if R{a} {cond} R{b}{reading}, else 0",
    callRegister: "R{y} ← PC + 4, PC ← R{a} + {c}",
    setIfFixed: "R{y} ← {n}",
  },
  jobs: { "0": "AND", "1": "XOR", "2": "+", "3": "-", "4": "OR" },
  jobNames: {
    "0": "AND",
    "1": "XOR",
    "2": "add",
    "3": "subtract",
    "4": "OR",
    "5": "copy B",
    "6": "count up",
    "7": "count down",
  },
  conds: { "2": "==", "3": "!=", "4": "<", "5": ">=", "6": "<", "7": ">=" },
  condReadings: { "4": " unsigned", "5": " unsigned", "6": " signed", "7": " signed" },
  systemJobs: {
    "0": "call system",
    "1": "resume",
    "2": "R{y} ← C{c}",
    "3": "C{c} ← R{a}",
    "4": "stop",
  },
  illegal: {
    kind: "Not an instruction: kind {k} is not one of the machine's kinds; the machine stops with cause 21.",
    job: "Not an instruction: kind {k} has no job {j}; the machine stops with cause 21.",
    number: "Not an instruction: C{c} is not a control register; the machine stops with cause 21.",
  },
  widened: "The constant {c} widens to the 64-bit word {w}, which read signed is {n}.",
  calcHeading: "The calculator: Module 7's ALU",
  widthLegend: "Width",
  widthOption: "{n} bits",
  formLegend: "Type A and B as",
  formHex: "hexadecimal",
  formSigned: "numbers, read signed",
  aLabel: "A",
  bLabel: "B",
  jobLabel: "Job",
  jobOption: "{k} {name}",
  fromWord: "Take the job and B from the word",
  fromWordNone: "Only a register job or a constant job gives the ALU a job.",
  tookJob: "The job is the word's J, {job}.",
  tookB: "B is the word's constant, widened.",
  yHeading: "Y",
  yHex: "hexadecimal",
  yUnsigned: "unsigned",
  ySigned: "signed",
  flagsLabel: "Flags",
  flag: "{name} {value}",
  bitsRow: "bits {hi} to {lo}",
  entryEmpty: "Type a word.",
  entryNotHex: "{char} is not a hexadecimal digit.",
  entryHexLong: "A word this wide has at most {digits} hexadecimal digits.",
  entryNotNumber: "{char} is not part of a number.",
  entryRange: "The number must be from {min} to {max}.",

  casesLegend: "R1 and R2",
  swapCaption: "R1 is {a}, R2 is {b}",
  relation: "Comparison",
  branch: "Branch that says it",
  taken: "Taken?",
  relations: { "<": "R1 < R2", ">=": "R1 >= R2", ">": "R1 > R2", "<=": "R1 <= R2" },
  relationForm: "{rel}, {reading}",
  signedWord: "signed",
  unsignedWord: "unsigned",
  branchForm: "if {a} {cond} {b}{reading}",
  yes: "yes",
  no: "no",
  swapKey: "A marked row names its registers swapped.",
  flagsSigned: "{x} - {y}: MINUS {minus}, OVER {over}",
  flagsUnsigned: "{x} - {y}: COUT {cout}",
  pairsCaption: "Pairs of R1 and R2",
  askedCaption: "R1 > R2 and each branch for each pair",
  pairHeading: "R1 {a}, R2 {b}",
  swapAnswer: "The branch that says it is {answer}.",

  listingCaption: "The program",
  written: "Instructions written: {n}",
  ran: "Instructions run, the stop among them: {n}",
  ranNoStop: "Instructions run: {n}",
  romBytes: "ROM used: {n} bytes",
  registerAfter: "R{n} at the halt: {value}",
  displayAfter: "Display at the halt: {value}",
  runBoth: "Run the programs",
  stoppedAtStop: "The run halted at the stop, at {address}.",
  stoppedCause: "The run halted at {address}, with cause {cause}.",
  notStopped: "The run did not halt.",
  address: "Address",
  programAnswer: "The run gives {answer}.",
  edgesAnswer: "The controller takes {answer}.",

  partsCaption: "Each machine's parts",
  partsShared: "Shared parts: what a program can see.",
  partsOwn: "Parts this machine has alone.",
  constantsCaption: "Every constant as an address.",
  constantsRun: "constants {first} to {last}",
  constantsWiden: "widen to {first} to {last}",
  constantsParts: {
    rom: "the ROM",
    ram: "the RAM",
    devices: "the shop's devices",
    none: "no memory",
    negative: "no memory",
  },
  constantsStop: "a load stops the machine with cause {cause}",
  partNames: {
    registers: "R0 to R15",
    pc: "PC",
    memory: "memory",
    devices: "the shop's devices",
    ir: "IR",
    ha: "HA",
    hb: "HB",
    hr: "HR",
    hm: "HM",
    state: "the controller's state",
  },
  forms: {
    registers: "{count} registers of {width} bits each",
    register: "a register of {width} bits",
    romOutput: "not a register: a bus, the ROM's output at the PC, {width} bits",
    memory: "the ROM and the RAM",
    devices: "{names}",
    none: "none",
  },
  deviceNames: { display: "display", lamps: "lamps", timer: "timer", waiting: "waiting bits" },
};
