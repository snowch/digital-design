// Copyright © 2026 Christopher Snow

// The shell's own words. Drafted by the prose process; see CLAUDE.md.

// The names alone, not the lessons: the build reads these strings in Node (static-page.ts).
import { MODULE_NAMES } from "@dd/content/module-names";

export const STRINGS = {
  skip: "Skip to content",
  lessons: "Lessons",
  theme: "Theme",
  themeAuto: "System",
  themeLight: "Light",
  themeDark: "Dark",
  footer: "Everything runs in your browser. Nothing is sent anywhere.",
  /** For a browser that runs no scripts, under the cover's words (static-page.ts). */
  noScript:
    "This course runs a circuit simulator in your browser, so it needs JavaScript. Nothing is sent anywhere: everything runs here.",
  /** A page's name in the browser's tab, after its own name; the front page keeps the full title. */
  pageTitle: (page: string) => `${page} / Digital Design`,
  /** Under the footer's line, on every page. */
  copyright: "© 2026 Christopher Snow",
  noLessons: "No lessons are published yet.",
  noChallenges: "No challenges",
  /** Under the course title: what the course takes as known before Module 1. */
  assumes:
    "The course assumes you can turn binary numbers to decimal and back. It assumes everyday arithmetic, but nothing about electronics, circuits or programming.",
  /** Under the line above: the link to the page before the first lesson. */
  prefaceLink: "Check if you are ready and see how a lesson works.",
  preface: {
    title: "Before you start",
    /** What the course is. */
    what: "You build a working computer from its parts, one module at a time, starting from two voltages on a wire. You test everything you build in the page, with tests you can read. Everything runs in your browser, and your work stays there. Each new browser or device starts from nothing.",
    needHeading: "What you should know",
    /** What the learner needs, above the self-check. */
    need: "You need to know how to turn a binary number into decimal, and a decimal number into binary. The course uses both from Module 0 and does not teach them. You need everyday arithmetic. You do not need to know anything about electronics, circuits or programming.\n\nThe check below takes a minute or two. If it takes you longer, learn binary first, then come back.",
    lessonsHeading: "How a lesson works",
    /** How a lesson works, under the self-check. */
    lessons:
      'Each lesson starts from a question about something real. It has ten sections, each labelled: Question, Motivation, Prediction, Investigation, Construction, Failure experiment, Explanation, Generalisation, Challenge, Reflection. Before the course shows you an answer, it asks you to predict it. You choose an answer and press "Check my prediction". The course\'s model gives its answer and the working. You can predict again.\n\nYou build circuits and other answers in the page and run their tests. A failed test shows its inputs, what your work gave and what was expected. Each challenge has five hints, shown one at a time, and the last hint gives the answer. When you open a lesson, the course checks your saved work again. A figure carries a badge when the circuit\'s timing matters. The badge names how it counts time: "Stepped", "Clocked" or "Gate delays". Press it to read how. Module 0\'s figures run the course\'s simulator but carry no badge: a press runs a whole line of a program, and the circuit\'s timing is not shown.',
    start: (module: number, title: string) => `Start with Module ${module}: ${title}`,
  },
  selfCheck: {
    title: "Ready to start?",
    intro: "There are four questions. Type each answer, then press the check button.",
    check: "Check my answers",
    right: "Correct",
    blank: "Please answer",
    toDecimal: (binary: string) => `What is ${binary} in decimal?`,
    toBinary: (n: number) => `What is ${n} in 8-digit binary?`,
    workingDecimal: (binary: string, terms: string, value: number) =>
      `${binary} = ${terms} = ${value}`,
    workingBinary: (n: number, terms: string, binary: string) =>
      `${n} = ${terms} = ${binary} in binary`,
    score: (right: number, total: number) => `${right} of ${total} correct`,
  },
  module: (n: number) => `Module ${n}`,
  /**
   * The cover, at the top of the front page. A reader meets it before every lesson, so it uses no
   * term a lesson introduces (a test holds it to the term gate).
   */
  cover: {
    /**
     * What a search result and a shared link's preview show under the course's title, at most 155
     * characters (brief C3; static-page.ts writes it into the page).
     */
    description:
      "Build a working computer from its parts, starting from two voltages. For each circuit, predict, build, run, break and explain, all in your browser.",
    /** Under the course title, larger than the rest: what you do in the course (brief C3). */
    tagline: "You build a working computer from its parts, starting from two voltages on a wire.",
    /** Under the tagline: how the course goes about it. */
    lead: "By Module 8, reused parts form one machine that runs programs. For each circuit you predict, build, run, break and explain. Each idea and each name arrives when the circuit you are building raises a question that needs it. Every simulation runs the real circuit, not an animation. Everything runs and stays in your browser.",
    /** The way in, on two lines: the module, then its first lesson's question under it. */
    startLine: (where: string) => `Start with ${where}`,
    continueLine: (where: string) => `Continue with ${where}`,
    /**
     * Beside the opening words: Module 2's freezer-room alarm, live. Drafted by the prose process
     * (brief C1, docs/notes/cover/briefs/C1.md).
     */
    heroTitle: "Freezer room alarm",
    heroCaption:
      "This real circuit from Module 2 lights a lamp when the room is warm and the door is shut. Press WARM and DOOR to see it change.",
    /** The path through the course, in order: five stages, each over the modules it names. */
    journeyHeading: "Signals to computer in five stages",
    /**
     * Under the heading, above the path: where Module 0, the way in, sits (brief C4). Cut down by
     * brief C6 once Module 0's own line said what you do in it.
     */
    journeyIntro:
      "Module 0 comes first, before the five stages. The stages build the machine up from one wire, beginning in Module 1; two optional chapters follow them.",
    /** Under Module 0's line, before the stages: what you do in it, as each stage's `about` says (brief C6). */
    openingAbout:
      "Run a finished machine with a shop's program, line by line; open the machine level by level, down to one wire.",
    stages: [
      {
        name: "Signals",
        about:
          "Turn voltages into numbers; build logic circuits with AND, OR, NOT; choose, compare, add.",
        from: 1,
        to: 3,
      },
      {
        name: "Memory",
        about:
          "Build circuits that remember values; count and step through sequences; store and find numbers.",
        from: 4,
        to: 6,
      },
      {
        name: "Machine",
        about:
          "Build the arithmetic and logic circuit; join parts into one machine; build the control for each step.",
        from: 7,
        to: 9,
      },
      {
        name: "Programming",
        about:
          "Learn why the machine's vocabulary is as it is; write programs for it; find their mistakes.",
        from: 10,
        to: 11,
      },
      {
        name: "The whole machine",
        about:
          "Make the machine respond when errors occur; run complete programs from start to end.",
        from: 12,
        to: 13,
      },
    ],
    /** On a stage's line, under its name: the modules it holds. */
    stageModules: (from: number, to: number) =>
      to === from + 1 ? `Modules ${from} and ${to}` : `Modules ${from} to ${to}`,
    /**
     * On a stage's line, in place of its challenges complete (`progress`), when its modules have no
     * lessons yet.
     */
    stageToWrite: "Still to be written",
    /** Under a module with no lessons yet. */
    toWrite: "This module is still to be written.",
    /** Under a module's name, open or closed: its lessons and its challenges complete (brief C2). */
    moduleSummary: (lessons: number, passed: number, total: number) => {
      const count = lessons === 1 ? "1 lesson" : `${lessons} lessons`;
      return total > 0 ? `${count}, ${passed} of ${total} challenges complete` : count;
    },
    /** The way on for a reader who has passed a challenge: the first lesson not finished. */
    continueWith: (where: string, title: string) => `Continue with ${where}: ${title}`,
    /**
     * The optional chapters' line, after the five stages, in a stage's form (brief C7,
     * docs/notes/beyond-the-machine/briefs). Its name is the course plan's heading for them; the
     * way in and the links between lessons name a chapter by it, where a lesson's module goes.
     */
    beyond: {
      name: "Beyond the machine",
      /** Where a stage names its modules. */
      range: "Optional chapters",
      /** Under the line: what you do in the chapters, as a stage's `about` says. */
      about:
        "Watch a program write a shop's line as machine lines, one at a time; let a timer swap the machine between two programs.",
    },
  },
  /** Every module the plan has (`docs/plan.md`), by number from 0, in plain words. */
  // Module 0: the names live with the lessons, so a lesson can name a module in these words.
  moduleNames: MODULE_NAMES,
  progress: (passed: number, total: number) => `${passed} of ${total} challenges complete`,
  missing: (path: string) => `There is no page at ${path}.`,
  noLesson: (id: string) => `There is no lesson called ${id}.`,
  backToLessons: "Back to the lessons",
  /**
   * The heading over a lesson's note on how what it shows differs from a real machine, on a page
   * with no clocked figure (runtime-strings.ts). The platform's own says "the model", a word the
   * course's first page has not given its reader, over notes that are about the simulator.
   * Drafted from brief N1 (docs/notes/cover/briefs).
   */
  modelNoteHeading: "How the page differs from hardware",
  /** The links at the bottom of a lesson to the lesson before it and the lesson after it. */
  pager: {
    /** What a screen reader calls the links' bar; the bar at the top of the page is "Lessons". */
    label: "Next and previous lesson",
    previous: "Previous",
    next: "Next",
    /** On the last lesson written so far, above "Back to the lessons". */
    notYet: "Next lesson is still to be written.",
    /** In place of the line above, after the last lesson when it is an optional chapter (brief C7). */
    end: "The course ends here.",
  },
};
