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
  controlCaption: "[draft] Control registers",
  controlNames: [
    "[draft] status",
    "[draft] status before the trap",
    "[draft] return point",
    "[draft] cause",
    "[draft] handler's address",
  ],
  statusWords: "{mode}, {interrupts}",
  systemMode: "[draft] system mode",
  userMode: "[draft] user mode",
  interruptsOn: "[draft] interrupts on",
  interruptsOff: "[draft] interrupts off",
  trapped:
    "[draft] The instruction at {address} trapped with cause {cause}; the machine went to the handler at {handler}.",
  interrupted:
    "[draft] Before the instruction at {address} ran, cause {cause}; the machine went to the handler at {handler}.",
  trapCount: "[draft] {n} traps went to the handler.",
  trapCountOne: "[draft] 1 trap went to the handler.",
  stops: {
    cause22: "[draft] The machine halted with cause 22 at {address}.",
    cause32: "[draft] The machine halted with cause 32 at {address}.",
    cause81: "[draft] The machine halted with cause 81 at {address}.",
    cause82: "[draft] The machine halted with cause 82 at {address}.",
    "unknown-control":
      "[draft] The debugger ended the run before {address}: {reg} goes to a control register, and nothing has set it.",
  },
  eventsCaption: "[draft] The timer and the door",
  timer: "[draft] Timer",
  timerReached: "[draft] Timer reached 0",
  doorOpened: "[draft] Door opened",
  door: "DOOR",
  warm: "WARM",
  yes: "[draft] yes",
  no: "[draft] no",
  open: "[draft] open",
  closed: "[draft] closed",
  doorChoice: "[draft] When the door opens",
  doorBefore: "[draft] before instruction {n}",
  doorNever: "[draft] never",
  timelineTitle: "[draft] The run, edge by edge",
  nextEdge: "[draft] Next edge",
  backEdge: "[draft] Step back",
  toEnd: "[draft] Run to the end",
  reset: "[draft] Reset",
  noEdge: "[draft] No edge yet.",
  edge: "[draft] Edge {n}",
  runs: "[draft] {line}, at {address}, runs.",
  traps: "[draft] {line}, at {address}, traps with cause {cause}.",
  interrupts: "[draft] {line}, at {address}, does not run: cause {cause}.",
  resumes: "[draft] resume, at {address}, runs.",
  halts: "[draft] {line}, at {address}: the machine halts with cause {cause}.",
  stopsAt: "[draft] stop, at {address}: the program stops.",
  transfersLabel: "[draft] At this edge",
  nothingChanges: "[draft] Nothing changes.",
  modeAfter: "[draft] Then: {mode}.",
  mapCaptionUser: "[draft] The memory map in user mode",
  checks: {
    mode: "[draft] the mode",
    traps: "[draft] traps that went to the handler",
    causes: "[draft] the causes, in order",
    waiting: "[draft] the waiting events",
    timer: "[draft] the timer",
  },
  details: {
    skip34: "[draft] skip34",
  },
};
