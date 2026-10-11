// Copyright © 2026 Christopher Snow

// Beyond the machine: the two optional chapters' figure words, the compiler at work first. Kept in
// a file of their own and joined to the view strings as `beyond`. Drafted by the prose process
// (docs/notes/beyond-the-machine/briefs) and checked against the figures.

export interface BeyondStrings {
  // The compiler at work (compile-steps).
  /** The radio group of lines to compile. */
  readonly linesLegend: string;
  /** The radio group of the shop's readings for the run. */
  readonly readingsLegend: string;
  /** Over the line as first written. */
  readonly written: string;
  /** Over the line as it stands now: {line}, the line's number in the text. */
  readonly lineNow: string;
  /** In place of the line once nothing of it is left. */
  readonly nothingLeft: string;
  /** Before the rule that applies to the marked piece. */
  readonly ruleHeading: string;
  /** Each rule in one sentence. */
  readonly rules: Readonly<Record<"read" | "number" | "job" | "branch" | "store", string>>;
  /** While the question waits for a prediction, in place of the rule. */
  readonly ruleHidden: string;
  readonly next: string;
  readonly back: string;
  readonly again: string;
  /** {n} instructions written of {total}. */
  readonly progress: string;
  /** The listing so far. */
  readonly listingCaption: string;
  readonly address: string;
  readonly instruction: string;
  /** Under the listing: press an instruction to mark the piece it came from. */
  readonly linkHint: string;
  /** A listing row's button, read out: {instruction}. */
  readonly rowLabel: string;
  /** After the last step: the program ends with stop. */
  readonly ended: string;
  /** The run: room A at {a}, room B at {b}; the display shows {display}, the lamps {lamps}. */
  readonly run: string;
  /** The lamps' word when none is lit, and the CLASH lamp's name. */
  readonly lampsDark: string;
  readonly lampsLit: string;
  /** The display before anything is written to it. */
  readonly displayNothing: string;
  /** The verdict's answer: the compiler writes {answer}. */
  readonly answer: string;
  /** The piece marked in the line, read out: {piece}. */
  readonly pieceLabel: string;
  /** The compiler's refusals, by code (CompileProblemCode): {name}, {number}, {text}. */
  readonly refusals: Readonly<Record<string, string>>;

  // The challenges' feedback: a sentence for each case's rule, and how a run must end.
  readonly details: Readonly<Record<string, string>>;
  readonly ends: Readonly<Record<string, string>>;
}

export const BEYOND_STRINGS: BeyondStrings = {
  linesLegend: "Line to compile",
  readingsLegend: "Readings for the run",
  written: "The line as you wrote it",
  lineNow: "The line as it stands: {line}",
  nothingLeft: "Nothing of the line is left.",
  ruleHeading: "The rule:",
  rules: {
    read: "A device's name the line reads puts its word in the next register: R1 <= word[sensorA].",
    number: "A number goes into the next register first: R4 <= 100.",
    job: "Two registers joined by a job give the next register their result: R3 <= R1 - R2.",
    branch:
      "A branch skips the rest of the line when the comparison fails, written as the comparison turned over and read signed, swapping the two registers for > and <=.",
    store: "A device the line writes takes a register's word: word[lamps] <= R5.",
  },
  ruleHidden: "The rule shows once you have checked your prediction.",
  next: "Next instruction",
  back: "Back",
  again: "Start again",
  progress: "{n} instructions written of {total}",
  listingCaption: "The instructions written",
  address: "Address",
  instruction: "Instruction",
  linkHint: "Press an instruction to mark the piece of the line it came from.",
  rowLabel: "{instruction}, press to mark its piece of the line",
  ended: "Nothing of the line is left. The program ends with stop.",
  run: "Room A at {a} and room B at {b}; the display shows {display}; the lamps: {lamps}.",
  lampsDark: "None lit",
  lampsLit: "CLASH is lit",
  displayNothing: "Nothing written",
  answer: "The compiler writes {answer}.",
  pieceLabel: "Marked piece: {piece}",
  refusals: {
    name: "{name} is no device a line may read; the names are sensorA, sensorB, signals and lamps.",
    range: "{number} does not fit in an instruction's constant; write a number from -2048 to 2047.",
    multiply: "The machine has no multiplication or division, so use +, -, &, | or ^ instead.",
    form: "The line is in neither of the two forms: write it as display or lamps <= a piece, or as if a piece, a comparison and a piece, then display or lamps <= a piece.",
    registers:
      "The line has more pieces than the registers R1 to R13 can hold, so write a shorter line.",
  },
  details: {
    compilerWarmer:
      "Rule 1 points here: each room's reading comes from word[...], not from the name alone, and rule 3 takes the gap as room B minus room A, in that order.",
    compilerExactly:
      "Rule 4 points here: the line says more than 100, so the turned-over comparison must send a gap of exactly 100 to the branch, which skips the lamps.",
    compilerJustOver:
      "Rule 4 points here: the branch must go past the lamps only when the comparison fails.",
    compilerSigned:
      "Rule 4 points here: readings and gaps can be negative, so the comparison is read signed.",
    compilerBothSigns:
      "Rules 3 and 4 point here: the gap is room B minus room A, and it is read signed.",
    compilerClose: "Rule 4 points here: the branch must skip the lamps when the comparison fails.",
  },
  ends: {},
};
