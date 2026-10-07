// Copyright © 2026 Christopher Snow

// Module 11's figure words: the assembler's refusals, the debugger, the listing, the stack's depth,
// a program's results over several logs, and the program editor. Kept in a file of their own and
// joined to the view strings as `machine11`. Drafted by the prose process (brief 8S,
// docs/notes/module-11-programming/briefs/8S.md) and checked against the figures.

import type { AssemblyProblemCode } from "@dd/dd-model";

export interface Machine11Strings {
  // The assembler.
  readonly programLabel: string;
  readonly restore: string;
  /** {n}: instructions; {bytes}: the ROM's bytes the program and its data take. */
  readonly assembled: string;
  /** {n}: how many lines the assembler refuses. */
  readonly refusedTitle: string;
  /** {line}: the line's number; {sentence}: why. */
  readonly refusedLine: string;
  /** One sentence per refusal, with the values it names in braces. */
  readonly refusals: Readonly<Record<AssemblyProblemCode, string>>;

  // The listing.
  readonly listingCaption: string;
  readonly address: string;
  readonly word: string;
  readonly line: string;
  readonly data: string;
  /** {address}: a breakpoint's button. */
  readonly pauseBefore: string;
  readonly nextMark: string;
  readonly namesCaption: string;
  readonly name: string;
  /** {name}, {address}, {c}: where a branch or call goes. */
  readonly goesTo: string;

  // The debugger's controls and status.
  readonly step: string;
  readonly back: string;
  readonly run: string;
  readonly runToPause: string;
  readonly reset: string;
  readonly atStart: string;
  /** {n}: instructions run so far. */
  readonly ran: string;
  /** {address}: the instruction about to run. */
  readonly next: string;
  /** {address}: a breakpoint. */
  readonly paused: string;
  /** Why the run ended, by key (program-tests.ts `endOf`), with {address}, {cause}, {reg}, {n}. */
  readonly stops: Readonly<Record<string, string>>;

  // What the debugger shows.
  readonly registersCaption: string;
  readonly pc: string;
  readonly unknown: string;
  readonly changed: string;
  readonly devicesCaption: string;
  readonly display: string;
  readonly lamps: string;
  readonly lampNames: readonly [string, string, string];
  readonly lampOn: string;
  readonly lampOff: string;
  readonly sensorA: string;
  readonly sensorB: string;
  readonly hex: string;

  // The watch.
  readonly watchCaption: string;
  readonly watchLabel: string;
  readonly watchAdd: string;
  /** {name}: a watched value's remove button. */
  readonly watchRemove: string;
  /** {text}: what the learner typed. */
  readonly watchBad: string;
  /** {value}: the value before the last instruction. */
  readonly watchWas: string;
  readonly watchNone: string;

  // Memory and the stack.
  readonly memoryValue: string;
  /** {names}: registers that hold this word's address. */
  readonly pointsHere: string;
  readonly stackCaption: string;
  readonly stackEmpty: string;
  readonly stackUnset: string;
  readonly frameMain: string;
  /** {name}: the function; {address}: the call. */
  readonly frameCall: string;

  // The question.
  /** {answer}: what the run gave. */
  readonly answer: string;

  // The stack's depth over a run.
  readonly depthCaption: string;
  readonly depthAxis: string;
  readonly depthRan: string;
  /** {n}: the deepest, in words. */
  readonly depthMost: string;
  readonly depthCalls: string;

  // A program over several logs.
  readonly logCol: string;
  readonly readingsCol: string;
  readonly asks: string;
  readonly left: string;
  readonly empty: string;
  readonly results: Readonly<Record<string, string>>;
  readonly matches: string;
  readonly differs: string;
  readonly runAll: string;
  /** {limit}: a log's warm limit. */
  readonly limitNote: string;

  // The program editor in a challenge.
  readonly runWith: string;
  readonly dataAdded: string;
  readonly startSkeleton: string;
  readonly startEmpty: string;

  // A failed test.
  /** What each checked value is called, by the case's key. */
  readonly checks: Readonly<Record<string, string>>;
  readonly end: string;
  readonly notAssembled: string;
  /** {left}: each checked value the program left, named. */
  readonly failedLeft: string;
  /** {name}: a register; {address}: a word of the RAM, as a failed test names them. */
  readonly checkRegister: string;
  readonly checkWord: string;
  /** {value}: a value a failed test names. */
  readonly checkValue: string;
  /** The sentence a failed case adds, by its `detail` key: which part of the task is not met. */
  readonly details: Readonly<Record<string, string>>;
  readonly nothingWritten: string;
}

export const MACHINE11_STRINGS: Machine11Strings = {
  programLabel: "The program",
  restore: "Put back the program",
  assembled:
    "The assembler made {n} instructions; the program and its data take {bytes} bytes of ROM.",
  refusedTitle: "The assembler refuses {n} lines.",
  refusedLine: "Line {line}: {sentence}",
  refusals: {
    notNumber: "{text} is not a number.",
    notRegister: "{text} is not a register; the registers are R0 to R15.",
    constantRange:
      "{value} does not fit in an instruction's constant, which holds -2048 to 2047. A larger number can be kept as a word of data and loaded.",
    notWhole: "{name} is not a whole number of instructions away.",
    tooFar: "{name} is too far; a branch's constant counts -2048 to 2047 instructions.",
    noGreater: "The language has no >; swap the two registers and write <.",
    signedOrUnsigned: "After < or >=, write signed or unsigned.",
    noCallThroughRegister: "The course's machine has no call through a register.",
    noSetIf: "The course's machine has no set if.",
    unreadable: "Each line is one instruction. Write it as a transfer, such as R3 <= R1 + R2.",
    romFull: "The program and data need {bytes} bytes, and the ROM holds {rom}.",
    unknownName: "No line names {name}. Check the spelling, or add it with a colon before a line.",
    twice: "{name} names another line already. Each name names one line.",
    dataTarget: "{name} is data. A branch or call goes to an instruction line.",
    wordTooWide: "{text} does not fit in a {size}.",
    useArrow: "The transfer arrow is <=, not =.",
    noMultiply: "The machine has no multiplication, division or shift. Add in a loop instead.",
    twoJobs: "One line does one job. Split it across two lines.",
    storeRegister: "A store writes a register's word. Put the number in a register first.",
    compareRegisters:
      "A branch compares two registers. Put the number in a register first; to compare with 0, keep 0 in a register.",
    callRegister: "A call names the register that keeps the return address, as in call above, R15.",
    addressForm:
      "An address is a register, plus or minus a number, or a name. It cannot add two registers.",
    reservedName: "{name} is a word the language uses, so it cannot name a line.",
  },
  listingCaption: "The program as the assembler made it",
  address: "Address",
  word: "Word",
  line: "Line",
  data: "data",
  pauseBefore: "Pause before {address}",
  nextMark: "Runs next",
  namesCaption: "Names and addresses",
  name: "Name",
  goesTo: "Goes to {name}, at {address}, constant {c}",
  step: "Step",
  back: "Step back",
  run: "Run to the end",
  runToPause: "Run to a breakpoint",
  reset: "Reset",
  atStart: "Ready to run",
  ran: "{n} instructions run.",
  next: "The next instruction is at {address}.",
  paused: "Paused at the breakpoint before {address}.",
  stops: {
    stop: "Stopped: the program ran stop at {address}.",
    later: "The instruction at {address} is one a later module builds; the machine halts.",
    cause11: "The machine halted with cause 11: {address} is outside the ROM.",
    cause12: "The machine halted with cause 12: {address} is not a multiple of 4.",
    cause21: "The machine halted with cause 21: the word at {address} is not an instruction.",
    cause31:
      "The machine halted with cause 31: the instruction at {address} reached an address with no memory.",
    cause33:
      "The machine halted with cause 33: the instruction at {address} used a word address not a multiple of 8.",
    cause34:
      "The machine halted with cause 34: the instruction at {address} stored to the ROM or to a sensor.",
    cause41:
      "The machine halted with cause 41: the instruction at {address} is call system, which Module 12 builds.",
    "unknown-address":
      "The debugger paused before the instruction at {address}: the address needs {reg}, which is not set.",
    "unknown-branch":
      "The debugger paused before the instruction at {address}: the branch compares {reg}, which is not set.",
    "unknown-jump":
      "The debugger paused before the instruction at {address}: the jump targets {reg}, which is not set.",
    cutOff: "The debugger cut the run off after {n} instructions: the program may never stop.",
    running: "",
  },
  registersCaption: "Registers",
  pc: "PC",
  unknown: "X",
  changed: "The last instruction wrote this register.",
  devicesCaption: "The shop's devices",
  display: "Display",
  lamps: "Lamps",
  lampNames: ["ALARM", "NIGHT", "CLASH"],
  lampOn: "on",
  lampOff: "off",
  sensorA: "Room A's sensor",
  sensorB: "Room B's sensor",
  hex: "hexadecimal",
  watchCaption: "Watch",
  watchLabel: "A register or a word to watch, such as R1 or word[R1].",
  watchAdd: "Watch",
  watchRemove: "Stop watching {name}",
  watchBad:
    "The debugger cannot read {text} as a register or a word. Write R1, PC, or word[...] with an address.",
  watchWas: "was {value}",
  watchNone: "Nothing watched yet.",
  memoryValue: "Memory value",
  pointsHere: "{names} holds this word's address.",
  stackCaption: "Stack",
  stackEmpty: "Nothing on the stack.",
  stackUnset: "R14 not set, so no stack yet.",
  frameMain: "Main program",
  frameCall: "{name}, called from {address}",
  answer: "The run gives {answer}.",
  depthCaption: "Words on the stack after each instruction.",
  depthAxis: "Words",
  depthRan: "Instructions run",
  depthMost: "At most, the stack held {n} words.",
  depthCalls: "Calls",
  logCol: "What is checked",
  readingsCol: "Readings",
  asks: "Task expects",
  left: "Program left",
  empty: "None",
  results: {},
  matches: "The program left what the task asks.",
  differs: "The program left something else.",
  runAll: "Run all",
  limitNote: "(limit {limit})",
  runWith: "Run with",
  dataAdded: "The tests add these lines after your program:",
  startSkeleton: "Start from the outline",
  startEmpty: "Start from an empty program",
  checks: {
    display: "the display",
    lamps: "the lamps",
    end: "how the run ended",
    shown: "what the display showed, in order",
    stackWords: "words on the stack at its deepest",
    kept: "registers the function did not put back",
    returned: "whether the run came back to R15",
    calls: "how many calls returned",
  },
  end: "How the run ended",
  notAssembled: "The program does not assemble.",
  failedLeft: "Your program left {left}.",
  checkRegister: "{name}",
  checkWord: "the word at {address}",
  checkValue: "{name} {value}",
  details: {
    // Module 11, lesson 1 (brief 1L).
    // Module 11, lesson 7 (brief 7L).
    report:
      "The report must show the warm count on the display, ALARM when it is not 0, and the lowest and highest at 400 and 408.",
    "report-lowest":
      "R1 must hold the list's lowest reading (or 0 for an empty list), with R10 to R14 as they were and a return through R15.",
    "report-highest":
      "R1 must hold the list's highest reading (or 0), with R10 to R14 as they were and a return through R15.",
    "report-warmer":
      "R1 must hold how many readings are warmer than the limit in R3, with R10 to R14 as they were and a return through R15.",
    // Module 11, lesson 6 (brief 6L).
    warmerCount: "The display must show how many readings are warmer than the limit.",
    mendTotal: "The display must show the total of both rooms' amounts above their limits.",
    // Module 11, lesson 5 (brief 5L).
    colderNewest:
      "The display must show the readings below the limit, newest first, from a function that calls itself once for each reading.",
    // Module 11, lesson 4 (brief 4L).
    bothCall:
      "R1 must hold how many rooms are above their limits, with R10 to R14 as they were and a return through R15.",
    bothRun: "The display must show how many rooms are above their limits.",
    // Module 11, lesson 3 (brief 3L).
    aboveCall:
      "The function sets R1 to how far the reading in R1 is above the limit in R2, or 0; keeps R10 to R14 unchanged; and returns through R15.",
    twoRooms:
      "The display shows room A's amount above -180, or 0, and ALARM is on only when room B is above -200.",
    // Module 11, lesson 2 (brief 2L).
    firstWarmer:
      "The display must show the position, from 1, of the first reading warmer than the limit, or 0 when none is.",
    largestRise:
      "The display must show the largest of the rises from each reading to the next, which may be below 0.",
    warmerDisplay: "The display must show the higher of the two readings, read as signed numbers.",
  },
  nothingWritten: "No program yet.",
};
