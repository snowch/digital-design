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
  /** The same, for one line. */
  readonly refusedTitleOne: string;
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
  readonly ranOne: string;
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
  /** Why a watch is refused: a name nothing defines, an address off a word, an address with no word. */
  readonly watchName: string;
  readonly watchAlign: string;
  readonly watchOutside: string;
  /** {value}: the value before the last instruction. */
  readonly watchWas: string;
  readonly watchNone: string;

  // Memory and the stack.
  readonly memoryValue: string;
  /** {names}: registers that hold this word's address. */
  readonly pointsHere: string;
  readonly stackCaption: string;
  /** A run of like calls folded: {n} calls, {name} the group's name, {words} the words they hold. */
  readonly stackFolded: string;
  readonly stackEmpty: string;
  readonly stackUnset: string;
  readonly frameMain: string;
  /** {name}: the function; {address}: the call. */
  readonly frameCall: string;

  // The question.
  /** {answer}: what the run gave. */
  readonly answer: string;
  /** The verdict of a question about what the assembler made, not about a run. */
  readonly assemblerAnswer: string;

  // The stack's depth over a run.
  readonly depthCaption: string;
  readonly depthAxis: string;
  readonly depthRan: string;
  readonly depthRanOne: string;
  /** {n}: the deepest, in words. */
  readonly depthMost: string;
  readonly depthCalls: string;

  // A program over several logs.
  readonly logCol: string;
  readonly readingsCol: string;
  /** What follows "Readings: " for a log with no readings. */
  readonly emptyLog: string;
  readonly asks: string;
  readonly left: string;
  readonly empty: string;
  /** Inside a sentence, where a check left nothing: "what the display showed, in order" and none. */
  readonly emptyLeft: string;
  readonly results: Readonly<Record<string, string>>;
  readonly matches: string;
  readonly differs: string;
  readonly runAll: string;
  /** {limit}: a log's warm limit. */
  readonly limitNote: string;

  // The program editor in a challenge.
  readonly runWith: string;
  readonly dataAdded: string;
  /** {name}: a line name the learner's text and a test's lines both give; {test}: the test. */
  readonly nameShared: string;
  /** {decimal} and {hex}: a word in a failure's text, from 10 to 7FF, with its hexadecimal. */
  readonly wordInText: string;
  /** The button under a box of rows (the listing, memory, the stack, the edges): open, then close. */
  readonly rowsAll: string;
  readonly rowsFewer: string;
  /** The run drawn as lanes (Modules 11 and 12). */
  readonly lanes: {
    /** The drawing's name for a screen reader. */
    readonly title: string;
    /**
     * A move in words, by its kind. {from} and {to} are lanes' names, "the" in lower case
     * ("the handler", "overBy"); {transfer} is what the move writes, such as R15 ← 00C. The
     * sentence's first letter is made a capital on the page.
     */
    readonly moveCall: string;
    readonly moveBack: string;
    readonly moveTrap: string;
    readonly moveInterrupt: string;
    readonly moveResume: string;
    /** The start's `resume`: it starts a program that has not yet run. */
    readonly moveStart: string;
    readonly moveJump: string;
    /** A mark in words: {lane} is where it is; {label} what a store wrote. */
    readonly markDoor: string;
    readonly markTimer: string;
    readonly markStore: string;
    readonly markStop: string;
    readonly markCut: string;
    /** Beside the drawing's marks: the run stops here; the drawing stops here, the run goes on. */
    readonly stops: string;
    readonly cut: string;
    /** The key: the dot that marks where the run is now; the band for interrupts on. */
    readonly nowKey: string;
    readonly interruptsBand: string;
    /** Where the door opens, and where the timer reaches 0, between two instructions. */
    readonly doorOpens: string;
    readonly timerReaches: string;
    /** The band's key: the machine in system mode, and in user mode. */
    readonly systemBand: string;
    readonly userBand: string;
    /** The trap timeline's buttons that run on to the next move between lanes, and back to the last. */
    readonly nextMove: string;
    readonly backMove: string;
  };
  /** Memory drawn as boxes, the stack the same way, and the cold store as rooms. */
  readonly boxes: {
    /** {title}: the region's title; the drawing's name for a screen reader. */
    readonly label: string;
    /** Under a drawing whose last step stored a word: the outline marks it. */
    readonly changed: string;
    /** {reg}: the register whose word a push stored there. */
    readonly saves: string;
    /** The heading over words a pop has passed. */
    readonly popped: string;
    readonly stackLabel: string;
    readonly roomsLabel: string;
    /** {name}: a room a door leads back to, drawn already above. */
    readonly roomAgain: string;
    /** Under the rooms: what the door marks and the lit room say. */
    readonly roomsKey: string;
    /** The key of a rooms drawing with no run: the boxes and the circles only. */
    readonly roomsKeyStill: string;
    /** Said after the drawing's label: the lit room. */
    readonly roomLit: string;
    /** Said after the drawing's label: the door a call about no room followed. */
    readonly doorFollowed: string;
  };
  readonly startSkeleton: string;
  readonly startEmpty: string;
  /** Asking before a start replaces a program the learner changed. */
  readonly replaceConfirm: string;
  readonly replaceCancel: string;

  // A failed test.
  /** What each checked value is called, by the case's key. */
  readonly checks: Readonly<Record<string, string>>;
  readonly end: string;
  readonly notAssembled: string;
  /** A failed case whose run did not end at the program's stop. */
  readonly mustStop: string;
  /** {left}: each checked value the program left, named. */
  readonly failedLeft: string;
  /** {name}: a register; {address}: a word of the RAM, as a failed test names them. */
  readonly checkRegister: string;
  readonly checkWord: string;
  /** {value}: a value a failed test names. */
  readonly checkValue: string;
  /** The sentence a failed case adds, by its `detail` key: which part of the task is not met. */
  readonly details: Readonly<Record<string, string>>;
  /** What a function called alone left of the registers it keeps, and whether it returned. */
  readonly keptAll: string;
  readonly keptNot: string;
  readonly returnedYes: string;
  readonly returnedNo: string;
  readonly nothingWritten: string;
}

export const MACHINE11_STRINGS: Machine11Strings = {
  programLabel: "The program",
  restore: "Put back the program",
  assembled:
    "The assembler made {n} instructions; the program and its data take {bytes} bytes of ROM.",
  refusedTitle: "The assembler refuses {n} lines.",
  // Brief 8L.
  refusedTitleOne: "The assembler refuses 1 line.",
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
    callRegister:
      "A call names the register that keeps the return address, as in call overBy, R15.",
    addressForm:
      "An address is a register, plus or minus a number, or a name. It cannot add two registers.",
    reservedName: "{name} is a word the language uses, so it cannot name a line.",
    // Module 12.
    controlRegister:
      "{name} is not a control register. The machine has five control registers, C0 to C4.",
    controlTransfer:
      "A control register is copied only to or from an R register, on a line of its own, such as R5 <= C2 or C2 <= R5. Do the work in the R register.",
    // Brief 8L.
    noFunction:
      "The tests call the function {name}, but no line of your program starts with {name}:, so start the function's first line with {name}: to give it that name.",
  },
  listingCaption: "The program as the assembler made it",
  address: "Address",
  word: "Instruction",
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
  // Brief 8M.
  ranOne: "1 instruction run.",
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
      "The debugger ended the run before the instruction at {address}: the address needs {reg}, which nothing has set.",
    "unknown-branch":
      "The debugger ended the run before the instruction at {address}: the branch compares {reg}, which nothing has set.",
    "unknown-jump":
      "The debugger ended the run before the instruction at {address}: the jump goes to the address in {reg}, which nothing has set.",
    // Brief 8M: the tests' own guard after a called function.
    fellOff:
      "A test called a function, and the function ran past its last line without a return through R15. The machine halted there, at a word that is not an instruction.",
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
  // Brief 8M.
  watchName: "A watch names {name}, and no line of the program names it.",
  watchAlign:
    "A watch's address, {address} ({decimal} in decimal), is not a multiple of 8, so no word starts there.",
  watchOutside:
    "A watch's address, {address} ({decimal} in decimal), has no word of memory: the ROM and the RAM run from 000 to 7BF.",
  watchBad:
    "The debugger cannot read {text}: write a register (R1, PC) or word[...] with an address; a number is decimal, or hexadecimal after 0x, as in a program.",
  watchWas: "was {value}",
  watchNone: "Nothing watched yet.",
  memoryValue: "Memory value",
  pointsHere: "{names} holds this word's address.",
  stackCaption: "Stack",
  // Brief 8M.
  stackFolded: "{n} more calls, each {name}, holding {words} words between them.",
  stackEmpty: "Nothing on the stack.",
  stackUnset: "R14 not set, so no stack yet.",
  frameMain: "Main program",
  frameCall: "{name}, called from {address}",
  answer: "The run gives {answer}.",
  // Brief 8M.
  assemblerAnswer: "The assembler gives {answer}.",
  depthCaption: "Words on the stack after each instruction.",
  depthAxis: "Words",
  // Brief 8M.
  depthRan: "{n} instructions run",
  depthRanOne: "1 instruction run",
  depthMost: "At most, the stack held {n} words.",
  depthCalls: "The marks under the chart's axis are the {n} calls the run made.",
  logCol: "What is checked",
  readingsCol: "Readings",
  asks: "Should show",
  left: "Program left",
  empty: "None",
  emptyLeft: "nothing",
  // Brief 8N.
  emptyLog: "none, an empty log",
  results: {},
  matches: "The program left what the log should show.",
  differs: "The program left something else.",
  runAll: "Run all",
  limitNote: "(limit {limit})",
  runWith: "Run with",
  dataAdded: "The tests add these lines after your program:",
  nameShared:
    "Your text names a line {name}. The test {test} adds lines after your text, and they use the same name. The assembler cannot tell the two apart, so the test does not run. Give your line another name.",
  wordInText: "{decimal} ({hex} in hexadecimal)",
  rowsAll: "Show every row",
  rowsFewer: "Show fewer rows",
  lanes: {
    title:
      "The run drawn as lanes side by side, time running down, where each lane is one stretch of lines the run goes to and the arrows between lanes are the moves",
    moveCall: "a call goes to {to}, a function that {from} calls: {transfer}.",
    moveBack: "the function {from} goes back to {to}: {transfer}.",
    moveTrap: "an instruction in {from} traps, and the machine goes to {to}: {transfer}.",
    moveInterrupt:
      "an interrupt comes while {from} runs, and the machine goes to {to}: {transfer}.",
    moveResume: "{from} resumes {to}: {transfer}.",
    moveStart: "[draft] moveStart {from} {to} {transfer}",
    moveJump: "{from} goes back to {to}: {transfer}.",
    markDoor: "the freezer door opens while {lane} runs.",
    markTimer: "the timer reaches 0 while {lane} runs.",
    markStore: "{lane} stores a word that the lesson marks: {label}.",
    markStop: "the run stops in {lane}.",
    markCut: "the drawing ends here, in {lane}, but the run goes on.",
    stops: "the run stops",
    cut: "drawing ends, run goes on",
    nowKey: "where the run has got to",
    interruptsBand: "interrupts are on",
    doorOpens: "freezer door opens",
    timerReaches: "timer reaches 0",
    systemBand: "system mode",
    userBand: "user mode",
    nextMove: "Next move",
    backMove: "Previous move",
  },
  boxes: {
    label:
      "{title} drawn as words in boxes at their addresses, with an arrow from each register that holds an address",
    changed: "The box with the thick outline is the word the last step stored.",
    saves: "saves {reg}",
    popped: "Off the stack, still in the RAM",
    stackLabel:
      "The stack drawn as boxes, R14's word at the top, then the words below it grouped by the call that pushed them, and the words a pop has passed set apart above",
    roomsLabel: "The rooms reachable from the hall, each with its reading and its two doors",
    roomAgain: "{name}, drawn above",
    roomsKey:
      "The lit room is the room whose address R1 holds. Each room is a box with its name and reading. Its two doors are circles to its right. A circle with 1 or 2 is a door to a room. A dashed circle with 0 is a door that leads nowhere. When R1 holds 0, a door drawn with a thick ring is the door the current call came through. Each room behind a door is drawn below, a step to the right, with a line from the box of the room it opens from.",
    roomsKeyStill:
      "Each room is a box with its name and reading. Its two doors are circles to its right. A circle with 1 or 2 is a door to a room. A dashed circle with 0 is a door that leads nowhere. Each room behind a door is drawn below, a step to the right, with a line from the box of the room it opens from.",
    roomLit: "{name} is lit, and R1 holds its address.",
    doorFollowed:
      "Door {door} of {name} is marked. R1 holds 0, and the current call came through that door.",
  },
  startSkeleton: "Start from the outline",
  startEmpty: "Start from an empty program",
  // Brief 8M.
  replaceConfirm: "Replace my program",
  replaceCancel: "Keep my program",
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
  // Brief 8M.
  mustStop: "A whole run must end at the program's own stop.",
  failedLeft: "Your program left {left}.",
  checkRegister: "{name}",
  checkWord: "the word at {address}",
  checkValue: "{name}: {value}",
  details: {
    // Module 11, lesson 1 (brief 1L).
    // Module 11, lesson 7 (briefs 7L and 7R2).
    report:
      "The display must show how many readings are warmer than the limit, ALARM must be on when that is not 0, and the words at 400 and 408 must hold the lowest and highest readings.",
    "report-report":
      "R1 must hold how many readings are warmer than the limit in R3, the words at 400 and 408 must hold the lowest and highest readings, 3 calls must return, R10 to R14 must be as they were, and the return must go through R15.",
    "report-lowestOf":
      "R1 must hold the list's lowest reading (or 0 for an empty list), with R10 to R14 as they were and a return through R15.",
    "report-highestOf":
      "R1 must hold the list's highest reading (or 0), with R10 to R14 as they were and a return through R15.",
    "report-warmCount":
      "R1 must hold how many readings are warmer than the limit in R3, with R10 to R14 as they were and a return through R15.",
    // Module 11, lesson 6 (briefs 6L and 8R).
    warmerCount: "The display must show how many readings are warmer than the limit.",
    mendOver: "The display must show how many readings are above the limit.",
    // Module 11, lesson 5 (brief 8R).
    farthestRun:
      "The display must show how many rooms lie on the longest way in from the hall, counting the hall.",
    farthestCall:
      "R1 must hold how many rooms lie on the longest way in from the room in R1, or 0 for none, with R10 to R14 as they were and a return through R15.",
    // Module 11, lesson 4 (brief 8R).
    roomsCall:
      "R1 must hold how many rooms are above their limits, with R10 to R14 as they were and a return through R15.",
    roomsRun: "The display must show how many rooms are above their limits.",
    // Module 11, lesson 3 (brief 8R).
    larger:
      "The display must show the larger of room A's amount above -180 and room B's amount above -200 from two calls of overBy.",
    rangeCall:
      "R1 must hold how far the reading in R1 lies outside the range from R2 to R3, or 0 inside it, with R10 to R14 as they were and a return through R15.",
    rangeRun:
      "The display must show how far the fridge's reading lies outside 20 to 50, and ALARM must be on only when that is not 0.",
    // Module 11, lesson 2 (brief 2L).
    firstWarmer:
      "The display must show the position, from 1, of the first reading warmer than the limit, or 0 when none is.",
    largestRise:
      "The display must show the largest of the rises from each reading to the next, which may be below 0.",
    warmerDisplay: "The display must show the higher of the two readings, read as signed numbers.",
  },
  nothingWritten: "No program yet.",
  // Brief 8K.
  keptAll: "R10 to R14 as they were",
  keptNot: "{names} not put back",
  returnedYes: "a return through R15",
  returnedNo: "no return through R15",
};
