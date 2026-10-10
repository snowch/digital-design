// Copyright © 2026 Christopher Snow

// Module 12's figure words: the debugger's control registers, the mode and the shop's events, the
// trap timeline, and the memory map in user mode. Kept in a file of their own and joined to the
// view strings as `machine12`. Drafted by the prose process (docs/notes/module-12-traps/briefs)
// and checked against the figures.

export interface Machine12Strings {
  // The debugger: the control registers.
  readonly controlCaption: string;
  /** Under the controller's states, {state}: the next edge traps, so it leads to FETCH. */
  readonly trapMove: string;
  /** {state}: the next edge halts, so the controller stays in {state}. */
  readonly heldMove: string;
  /** Each register's job, after its name: C0 to C4. */
  readonly controlNames: readonly [string, string, string, string, string];
  /** C0's or C1's two bits in words: {mode}, {interrupts}. */
  readonly statusWords: string;
  readonly systemMode: string;
  readonly userMode: string;
  readonly interruptsOn: string;
  readonly interruptsOff: string;
  /** {address}: the instruction; {cause}; {handler}: C4. */
  readonly trapped: string;
  /** {address}: the instruction not yet run; {cause}; {handler}. */
  readonly interrupted: string;
  /** {n}: traps that went to the handler. */
  readonly trapCount: string;
  readonly trapCountOne: string;
  /**
   * How a run ended, by key, with {address}, {cause}, {reg}, {n}: on Module 12's pages, first. A
   * stop there is the handler's or the reset lines', never "the program's".
   */
  readonly stops: Readonly<Record<string, string>>;
  /** {name}: a register, named in a failure as it was at the run's last trap. */
  readonly atTrap: string;
  /** {address}, {cause}: a fault at one of the learner's own lines. */
  /** 12.8: the run stopped at a `stop` of the learner's own, but no line is named `handler`. */
  readonly stopUnnamed: string;
  /** 12.8: the run stopped at a `stop` at or after the line `handler`, so it is the handler's. */
  readonly stopAfterHandler: string;
  readonly ownFault: string;
  /** Over a test's lines, in a challenge: the tests add them after the learner's. */
  readonly dataAdded: string;
  /** {n}: instructions; {bytes}: ROM bytes the start, the handler and a test's lines take. */
  readonly assembled: string;
  /** {state}: the controller's state, beside the datapath figure's buttons. */
  readonly stateNow: string;
  /** The debugger's listing caption on Module 12's pages. */
  readonly listingCaption: string;
  /** Each challenge's sentence for how its runs must end, by the challenge's detail key. */
  readonly ends: Readonly<Record<string, string>>;
  // The debugger: the shop's events.
  readonly eventsCaption: string;
  readonly timer: string;
  readonly timerReached: string;
  readonly doorOpened: string;
  readonly door: string;
  readonly warm: string;
  readonly yes: string;
  readonly no: string;
  readonly open: string;
  readonly closed: string;
  /** The control that chooses when the door opens. */
  readonly doorChoice: string;
  /** {n}: the door opens before the instruction with this number, counted from 0. */
  readonly doorBefore: string;
  readonly doorNever: string;

  // The trap timeline.
  readonly timelineTitle: string;
  readonly nextEdge: string;
  readonly backEdge: string;
  readonly toEnd: string;
  readonly reset: string;
  readonly noEdge: string;
  /** An edge at an address no line of the program names: a word of data, or of 0s. */
  readonly noLine: string;
  /** {n}: the edge's number. */
  readonly edge: string;
  /** {line}, {address}. */
  readonly runs: string;
  /** {line}, {address}, {cause}. */
  readonly traps: string;
  /** {line}, {address}, {cause}: an event before the instruction runs. */
  readonly interrupts: string;
  /** {address}: `resume`. */
  readonly resumes: string;
  /** {line}, {address}, {cause}. */
  readonly halts: string;
  /** {address}. */
  readonly stopsAt: string;
  readonly transfersLabel: string;
  readonly nothingChanges: string;
  /** {mode}: the mode after the edge, in words. */
  readonly modeAfter: string;

  // The memory map in user mode.
  readonly mapCaptionUser: string;

  /** The text box of a Module 12 challenge, which holds a handler and the lines before it. */
  readonly handlerLabel: string;
  /** A failed test of a Module 12 challenge: {left}, what the run left. */
  readonly failedLeft: string;
  /** The results cards on Module 12's runs: the column of what the handler left, and a mismatch. */
  readonly leftCol: string;
  readonly runDiffers: string;
  /** The results cards: a run of Module 12's that left what it should. */
  readonly runMatches: string;
  /** How a run ended, as a results card writes it: the module's fixed words. */
  readonly endWords: Readonly<Record<string, string>>;

  // The program grader: what a check names, and each challenge's sentence for what was wrong.
  readonly checks: Readonly<Record<string, string>>;
  readonly details: Readonly<Record<string, string>>;
}

export const MACHINE12_STRINGS: Machine12Strings = {
  controlCaption: "The control registers",
  trapMove:
    "The next edge traps, so the controller goes to FETCH, whatever its table says for {state}.",
  heldMove: "GO is 0 and nothing traps, so the controller stays in {state}.",
  controlNames: ["status", "status before the trap", "return point", "cause", "handler's address"],
  statusWords: "{mode}, {interrupts}",
  systemMode: "system mode",
  userMode: "user mode",
  interruptsOn: "interrupts on",
  interruptsOff: "interrupts off",
  trapped:
    "The instruction at {address} trapped with cause {cause}, and the machine went to the handler at {handler}.",
  interrupted:
    "Before the instruction at {address} ran, an interrupt with cause {cause} came, and the machine went to the handler at {handler}.",
  trapCount: "{n} traps went to the handler.",
  trapCountOne: "1 trap went to the handler.",
  stops: {
    cause22:
      "The machine halted with cause 22: the instruction at {address} is one that user mode refuses (resume, a control-register copy or stop).",
    cause32:
      "The machine halted with cause 32: the instruction at {address} reached a device's address in user mode.",
    cause81:
      "The machine halted with cause 81: the timer reached 0 before the instruction at {address}.",
    cause82:
      "The machine halted with cause 82: the door opened before the instruction at {address}.",
    stop: "The run stopped at the stop at {address}.",
    cutOff: "The debugger cut the run off after {n} instructions, because the run had not stopped.",
    "unknown-control":
      "The debugger ended the run before the instruction at {address}: it copies {reg} into a control register, and nothing has set {reg}.",
  },
  atTrap: "{name} as the program left it at its last trap",
  stopUnnamed:
    "No line of your text is named handler, so the test cannot tell the start's stop from the handler's lines. Name the handler's first line handler.",
  stopAfterHandler:
    "The run ended at the stop at {address}, which comes at or after the line named handler, so the test counts it as the handler's. The start's stop must come above that line.",
  ownFault:
    "An instruction you wrote, in the start or the handler, at {address} faulted with cause {cause} (it is not one of the tests' lines).",
  dataAdded: "The tests add these lines, which hold the program, after your start and handler:",
  assembled:
    "The assembler made {n} instructions; the listing, instructions and words of data together, takes {bytes} bytes of ROM.",
  listingCaption:
    "The listing as the assembler made it: the start, the handler and the program together",
  stateNow: "The controller is in the state {state} now.",
  ends: {
    skip34:
      "A run must stop at the program's end line, or at the handler's stop after a cause other than 34.",
    saveRegisters: "A run must stop at the program's end line, with every refused store skipped.",
    startUser: "A run must end at the handler's stop.",
    sensorService:
      "A run must end at the handler's stop for job 4, with no trap but the system calls.",
    doorTimer: "A run must end at the handler's stop for job 4, after the program has shown 30.",
    waitDoor:
      "A run must end at the handler's stop for job 4. Job 6 must put C1 and C2 back before its resume.",
    shopHandler:
      "A run must end at the start's stop after the last program, with a record for every program.",
  },
  eventsCaption: "The timer and the door",
  timer: "Timer",
  timerReached: "Timer reached 0",
  doorOpened: "Door opened",
  door: "DOOR",
  warm: "WARM",
  yes: "yes",
  no: "no",
  open: "open",
  closed: "closed",
  doorChoice: "When the door opens",
  doorBefore: "after {n} instructions",
  doorNever: "never",
  timelineTitle: "The run, edge by edge",
  nextEdge: "Next edge",
  backEdge: "Step back",
  toEnd: "Run to the end",
  reset: "Reset",
  noEdge: "No edge yet.",
  noLine: "the word",
  edge: "Edge {n}",
  runs: "{line}, at {address}, runs.",
  traps: "{line}, at {address}, traps with cause {cause}.",
  interrupts: "{line}, at {address}, does not run: an interrupt with cause {cause} comes first.",
  resumes: "resume, at {address}, runs.",
  halts: "{line}, at {address}: the machine halts with cause {cause}.",
  stopsAt: "{line}, at {address}: the run stops.",
  transfersLabel: "At this edge",
  nothingChanges: "Nothing changes.",
  modeAfter: "Then, {mode}.",
  mapCaptionUser: "What user mode does with each access",
  runMatches: "The run left what the test asks.",
  handlerLabel: "Your start and handler",
  failedLeft: "The run left {left}.",
  leftCol: "The run left",
  runDiffers: "The run left something else.",
  endWords: { stop: "stop", cutOff: "cut off" },
  checks: {
    C2at: "C2, the return point",
    mode: "the mode at the end",
    traps: "how many traps went to the handler",
    causes: "the causes, in order",
    waiting: "the waiting events",
    timer: "the timer's count",
  },
  details: {
    skip34:
      "The handler must count each refused store (cause 34) in the word at 400 and skip it, and run stop on any other cause.",
    saveRegisters:
      "The handler must count and skip each refused store, and leave every register, R0 to R15, as it was before the trap.",
    startUser:
      "The program must run in user mode. The handler must count and skip each cause 32, and save any other cause in the word at 408, then stop.",
    sensorService:
      "Job 2 must put into R1 the reading of the room that R2 names: room A for 0 and room B for 1. A system call may change only R1 and R2. The handler must put R8 and R9 back before resume and leave every other register as it was.",
    doorTimer:
      "The timer's part must clear the timer's bit and, only if the door is still open, light ALARM beside the lamps already lit. It may change no register.",
    waitDoor:
      "Job 6 must let the door and the timer in while it counts, then give the program back its mode, its return point and every register but R1 and R2.",
    shopHandler:
      "The runner must run each program in the table in user mode with interrupts off, offer jobs 1 to 4, and leave each program's record (0 for job 4, else its cause) at 400 plus 8 times its number.",
  },
};
