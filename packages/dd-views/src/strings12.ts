// Copyright © 2026 Christopher Snow

// Module 12's figure words: the debugger's control registers, the mode and the shop's events, the
// trap timeline, and the memory map in user mode. Kept in a file of their own and joined to the
// view strings as `machine12`. Drafted by the prose process (docs/notes/module-12-traps/briefs)
// and checked against the figures.

export interface Machine12Strings {
  // The debugger: the control registers.
  readonly controlCaption: string;
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
  /** Halts with no handler, by cause, with {address}. */
  readonly stops: Readonly<Record<string, string>>;
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

  // The program grader: what a check names, and each challenge's sentence for what was wrong.
  readonly checks: Readonly<Record<string, string>>;
  readonly details: Readonly<Record<string, string>>;
}

export const MACHINE12_STRINGS: Machine12Strings = {
  controlCaption: "The control registers",
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
      "The machine halted with cause 22: the instruction at {address} is one that user mode refuses (resume, a control-register job or stop).",
    cause32:
      "The machine halted with cause 32: the instruction at {address} reached a device's address in user mode.",
    cause81:
      "The machine halted with cause 81: the timer reached 0 before the instruction at {address}.",
    cause82:
      "The machine halted with cause 82: the door opened before the instruction at {address}.",
    "unknown-control":
      "The debugger ended the run before the instruction at {address}: it copies {reg} into a control register, and nothing has set {reg}.",
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
  stopsAt: "stop, at {address}: the program stops.",
  transfersLabel: "At this edge",
  nothingChanges: "Nothing changes.",
  modeAfter: "Then, {mode}.",
  mapCaptionUser: "What user mode does with each access",
  checks: {
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
      "The handler must count and skip each refused store, and leave every register the program used as it was before the trap.",
    startUser:
      "The handler's start must run program in user mode. The handler must keep the cause in the word at 400 and stop.",
    sensorService:
      "Job 2 must put the reading of the room in R2 into R1: room A for 0 and room B for 1. The handler must put R8 and R9 back before resume.",
    doorTimer:
      "The timer's part must clear the timer's bit and light ALARM only if the door is still open. The program must still show 30 and end.",
    waitDoor:
      "Job 5 must let the door and the timer in while it waits. The program must go on after the wait as before.",
    shopHandler:
      "The handler must run each program in the table in user mode, offer jobs 1 to 4, leave each program's record (0 for job 4, else its cause) at 400 plus 8 times its number, and stop after the last.",
  },
};
