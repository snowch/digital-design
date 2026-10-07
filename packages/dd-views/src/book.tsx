// Copyright © 2026 Christopher Snow

// The digital-design book: the grader and the challenge editor the runtime calls, and the
// registry of interactives the lessons name. The grader is the engine's test runner behind a
// check that the artifact is a circuit with the challenge's ports.

import { useMemo, useState, type ComponentType } from "react";

import {
  assemble,
  chainSlices,
  depthOf,
  gatesNotOf,
  gatesOf,
  libraryCircuit,
  wordOf,
} from "@dd/dd-model";
import {
  elaborate,
  generate,
  machine9Modules,
  machineModules,
  type Construct,
  type CourseModule,
} from "@dd/hdl";
import { limitCount, type Artifact, type Challenge, type Lesson } from "@platform/lesson-schema";
import type {
  Book,
  ChallengeEditorProps,
  InteractiveProps,
  Verdict,
} from "@platform/lesson-runtime";
import { bitAt, parseWord, runSuite, type Circuit } from "@dd/sim";

import { AnswerEditor, gradeAnswers } from "./AnswerEditor";
import { Builder } from "./Builder";
import { rememberVerdicts } from "./grade-cache";
import { CircuitView, levelOf, SignalTable } from "./CircuitView";
import { HdlPanel } from "./HdlPanel";
import { GATE_IDS, labelFor } from "./parts";
import {
  circuitToDrawing,
  compileDrawing,
  emptyDrawing,
  undrivenOutputs,
  withInterface,
  type Drawing,
} from "./drawing";
import { DEFAULT_VIEW_STRINGS, format, useViewStrings, type ViewStrings } from "./strings";
import { useSettleSim } from "./useSim";
import { WordInputs } from "./WordInputs";

const list = (names: readonly string[]) => names.join(", ");
const isGateKind = (kind: string) => GATE_IDS.includes(kind);

/** Why a circuit cannot be tested against a challenge's interface, or undefined if it can. */
export function portProblem(
  circuit: Circuit,
  challenge: Challenge,
  strings: ViewStrings,
): string | undefined {
  const inputs = new Set(circuit.inputs.map((p) => p.name));
  const outputs = new Set(circuit.outputs.map((p) => p.name));
  const ok =
    challenge.interface.inputs.every((p) => inputs.has(p.name)) &&
    challenge.interface.outputs.every((p) => outputs.has(p.name));
  if (ok) return undefined;
  return format(strings.grade.ports, {
    inputs: list(challenge.interface.inputs.map((p) => p.name)),
    outputs: list(challenge.interface.outputs.map((p) => p.name)),
  });
}

/** Module 8: the course's modules a challenge's text may use, built once per challenge. */
const MODULES = new WeakMap<Challenge, Record<string, CourseModule>>();

export function modulesOption(challenge: Challenge): { modules?: Record<string, CourseModule> } {
  const given = challenge.courseModules;
  // Module 9: "machine9" is the machine of several edges an instruction, whose memory has one
  // port; "machine9-call" is the same with the capstone's call through a register, which the
  // program is assembled with.
  // Module 10: "machine9-set" is the learner's copy with the call through a register and set if.
  const sets = ["machine", "machine9", "machine9-call", "machine9-set"];
  if (!given || !sets.includes(given.set)) return {};
  let modules = MODULES.get(challenge);
  if (!modules) {
    const registers = Array.from({ length: 16 }, (_, k) => {
      const v = given.registers?.[`R${k}`];
      return v === undefined ? undefined : wordOf(v, 64).value;
    });
    const assembly =
      given.set === "machine9-call"
        ? { callThroughRegister: 9 }
        : given.set === "machine9-set"
          ? { callThroughRegister: 9, setIf: 10 }
          : {};
    const context = {
      ...(given.program !== undefined ? { rom: assemble(given.program, assembly).rom } : {}),
      registers,
    };
    modules = given.set === "machine" ? machineModules(context) : machine9Modules(context);
    MODULES.set(challenge, modules);
  }
  return { modules };
}

/**
 * The circuit an artifact holds for a challenge, or why there is none. Whatever form the artifact
 * takes is graded: a drawn circuit, a library id, or text elaborated under the challenge's
 * construct gate. The graded direction only decides what to say when there is nothing yet.
 */
export function circuitOf(
  challenge: Challenge,
  artifact: Artifact,
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): { circuit?: Circuit; blocked?: string } {
  let circuit: Circuit | undefined;
  if (artifact.circuit) circuit = artifact.circuit as Circuit;
  else if (artifact.libraryId) circuit = libraryCircuit(artifact.libraryId);
  else if (artifact.hdl?.trim()) {
    const result = elaborate(artifact.hdl, {
      allowed: challenge.allowedConstructs as Construct[],
      ...modulesOption(challenge),
    });
    const errors = result.messages.filter((m) => m.severity !== "warning");
    if (errors.length || !result.circuit) {
      return {
        blocked: errors.map((m) => (m.at ? `${m.text} (line ${m.at.line})` : m.text)).join("\n"),
      };
    }
    circuit = result.circuit;
  }
  if (!circuit) {
    return {
      blocked:
        challenge.gradedDirection === "write"
          ? strings.grade.nothingWritten
          : strings.grade.nothingDrawn,
    };
  }
  const undriven = undrivenOutputs(circuit);
  if (undriven.length)
    return { blocked: format(strings.grade.undriven, { names: list(undriven) }) };
  const ports = portProblem(circuit, challenge, strings);
  return ports ? { blocked: ports } : { circuit };
}

export function grade(challenge: Challenge, artifact: Artifact): Verdict {
  if (challenge.tests.kind === "answers") return gradeAnswers(challenge, artifact);
  const { circuit, blocked } = circuitOf(challenge, artifact);
  const total =
    (challenge.tests.kind === "combinational"
      ? challenge.tests.vectors.length
      : challenge.tests.steps.filter((s) => s.expect).length) + limitCount(challenge);
  if (!circuit) return { passed: false, total, failures: [], blocked: blocked ?? "" };
  if (challenge.tests.kind === "combinational" && challenge.tests.chain)
    return gradeChain(circuit, challenge.tests.vectors, challenge.tests.chain);
  if (
    challenge.tests.kind === "combinational" &&
    artifact.hdl?.trim() &&
    challenge.tests.vectors.some((v) => v.parameters)
  )
    return gradeWidths(challenge, artifact.hdl, challenge.tests.vectors);
  const verdict = runSuite(circuit, challenge.tests);
  const failures = [
    ...verdict.failures.map(withPartLabel),
    ...limitFailures(challenge, circuit, verdict.total),
  ];
  return { ...verdict, total, passed: failures.length === 0, failures };
}

/**
 * Module 2: each limit a challenge sets is one more test, numbered after the suite's. A failed
 * one says what the circuit has and marks the parts it is about: every gate over a budget, the
 * gates on the longest path, the gates of a kind not allowed.
 */
export function limitFailures(
  challenge: Challenge,
  circuit: Circuit,
  first: number,
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): Verdict["failures"] {
  const limits = challenge.limits;
  if (!limits) return [];
  const out: Verdict["failures"][number][] = [];
  let index = first;
  const fail = (label: string, detail: string, marked: readonly string[]) =>
    out.push({ index, label, inputs: {}, actual: {}, expected: {}, detail, marked });
  if (limits.gates !== undefined) {
    const gates = gatesOf(circuit);
    if (gates.length > limits.gates)
      fail(
        format(strings.limits.gates, { limit: limits.gates }),
        format(strings.limits.gatesFound, { count: gates.length, limit: limits.gates }),
        gates.map((g) => g.path),
      );
    index++;
  }
  if (limits.depth !== undefined) {
    const d = depthOf(circuit);
    if (d.depth > limits.depth)
      fail(
        format(strings.limits.depth, { limit: limits.depth }),
        format(strings.limits.depthFound, {
          count: d.depth,
          path: d.path.join(", "),
          limit: limits.depth,
        }),
        d.path,
      );
    index++;
  }
  if (limits.only) {
    const kinds = limits.only.map(labelFor).join(strings.limits.and);
    const others = gatesNotOf(circuit, limits.only);
    if (others.length)
      fail(
        format(strings.limits.only, { kinds }),
        format(strings.limits.onlyFound, {
          list: others.map((g) => `${labelFor(g.kind)} ${g.path}`).join(", "),
          kinds,
        }),
        others.map((g) => g.path),
      );
  }
  return out;
}

type Vectors = Extract<Challenge["tests"], { kind: "combinational" }>["vectors"];

/**
 * Module 7: a text graded at the widths its tests choose. The text is elaborated once for each set
 * of parameter values the vectors give (a text that does not elaborate at one of them is blocked
 * with that width's messages), each group of vectors is run against its circuit, and the
 * failures are put back in the vectors' order.
 */
function gradeWidths(challenge: Challenge, hdl: string, vectors: Vectors): Verdict {
  const keyOf = (v: Vectors[number]) => JSON.stringify(v.parameters ?? {});
  const keys = [...new Set(vectors.map(keyOf))];
  const failures: Verdict["failures"][number][] = [];
  for (const key of keys) {
    const parameters = JSON.parse(key) as Record<string, number>;
    const result = elaborate(hdl, {
      allowed: challenge.allowedConstructs as Construct[],
      parameters,
      ...modulesOption(challenge),
    });
    const errors = result.messages.filter((m) => m.severity !== "warning");
    if (errors.length || !result.circuit)
      return {
        passed: false,
        total: vectors.length,
        failures: [],
        blocked: errors.map((m) => (m.at ? `${m.text} (line ${m.at.line})` : m.text)).join("\n"),
      };
    const ports = portProblem(result.circuit, challenge, DEFAULT_VIEW_STRINGS);
    if (ports) return { passed: false, total: vectors.length, failures: [], blocked: ports };
    const indices = vectors.flatMap((v, i) => (keyOf(v) === key ? [i] : []));
    const verdict = runSuite(result.circuit, {
      kind: "combinational",
      vectors: indices.map((i) => {
        const { parameters: _p, slices: _s, ...rest } = vectors[i]!;
        return rest;
      }),
    });
    if (verdict.blocked)
      return { passed: false, total: vectors.length, failures: [], blocked: verdict.blocked };
    for (const f of verdict.failures)
      failures.push(withPartLabel({ ...f, index: indices[f.index] ?? f.index }));
  }
  failures.sort((a, b) => a.index - b.index);
  return { passed: failures.length === 0, total: vectors.length, failures };
}
type Chain = NonNullable<Extract<Challenge["tests"], { kind: "combinational" }>["chain"]>;

/**
 * Module 3: a slice graded at the widths its tests choose. The vectors are run in groups by how
 * many copies of the slice each asks for, each group against a chain of that many copies, and
 * the failures are put back in the vectors' order.
 */
function gradeChain(slice: Circuit, vectors: Vectors, chain: Chain): Verdict {
  const counts = [...new Set(vectors.map((v) => v.slices ?? 1))];
  const failures: Verdict["failures"][number][] = [];
  for (const count of counts) {
    const indices = vectors.flatMap((v, i) => ((v.slices ?? 1) === count ? [i] : []));
    const circuit = chainSlices(slice, count, chain);
    const verdict = runSuite(circuit, {
      kind: "combinational",
      vectors: indices.map((i) => {
        const { slices: _slices, ...rest } = vectors[i]!;
        // Each expected output bit, named at its copy from bit 0 up, so a failure is reported at
        // the lowest copy that went wrong rather than at the join that makes the word.
        const internal: Record<string, string> = {};
        for (const name of chain.outputs) {
          const value = rest.expect[name];
          if (value === undefined) continue;
          const word = parseWord(String(value), count);
          for (let k = 0; k < count; k++) internal[`bit${k}.${name}`] = bitAt(word, k);
        }
        return { ...rest, internal: { ...internal, ...(rest.internal ?? {}) } };
      }),
    });
    if (verdict.blocked)
      return { passed: false, total: vectors.length, failures: [], blocked: verdict.blocked };
    for (const f of verdict.failures)
      failures.push(withPartLabel({ ...f, index: indices[f.index] ?? f.index }));
  }
  failures.sort((a, b) => a.index - b.index);
  return { passed: failures.length === 0, total: vectors.length, failures };
}

/** The part a failure names, as the drawing labels it: "NOR gate", "D flip-flop". */
function withPartLabel(failure: Verdict["failures"][number]): Verdict["failures"][number] {
  const component = failure.divergence?.component;
  if (!failure.divergence || !component) return failure;
  const label = isGateKind(component.kind)
    ? `${labelFor(component.kind)} gate`
    : labelFor(component.kind);
  return { ...failure, divergence: { ...failure.divergence, component: { ...component, label } } };
}

function markedPath(verdict: Verdict | undefined): string[] {
  const first = verdict?.failures[0];
  if (first?.marked) return [...first.marked];
  const path = first?.divergence?.component?.path;
  return path ? [path] : [];
}

/** The circuit, running: toggle the inputs, clock it if it has a clock, read the outputs. */
export function TryIt({
  circuit,
  clockName,
  highlight,
  pins = false,
  words = false,
}: {
  circuit: Circuit;
  clockName?: string;
  highlight?: readonly string[];
  /** Module 5: the inputs as buttons and the signals as a table, with no drawing. */
  pins?: boolean;
  /** Module 8: words written as the challenge's lesson writes them (`feedback: "words"`). */
  words?: boolean;
}) {
  const strings = useViewStrings();
  const sim = useSettleSim(circuit);
  const [scope, setScope] = useState("");
  const bits = circuit.inputs.filter(
    (i) => i.name !== clockName && (circuit.nets[i.net]?.width ?? 1) === 1,
  );
  return (
    <div className="try-it">
      {pins ? (
        <div className="try-it-pins">
          <p className="hdl-label">{strings.editor.tryItTitle}</p>
          <div className="machine-inputs" role="group" aria-label={strings.machine.inputsLabel}>
            {bits.map((i) => {
              const on = levelOf(sim.values[i.net]) === "high";
              return (
                <button
                  key={i.name}
                  type="button"
                  className="button secondary"
                  aria-pressed={on}
                  onClick={() => sim.toggle(i.name)}
                >
                  {format(strings.machine.inputButton, { name: i.name, value: on ? 1 : 0 })}
                </button>
              );
            })}
          </div>
          <WordInputs circuit={circuit} values={sim.values} onSet={(n, v) => sim.set(n, v)} />
          <SignalTable circuit={circuit} values={sim.values} words={words} />
        </div>
      ) : (
        <CircuitView
          circuit={circuit}
          values={sim.values}
          title={strings.editor.tryItTitle}
          onToggleInput={(name) => sim.toggle(name)}
          scope={scope}
          onScope={setScope}
          {...(highlight ? { highlight } : {})}
        />
      )}
      {!pins && scope === "" && (
        <WordInputs circuit={circuit} values={sim.values} onSet={(n, v) => sim.set(n, v)} />
      )}
      <div className="try-it-actions">
        {clockName && (
          <button type="button" className="button secondary" onClick={() => sim.clock(clockName)}>
            {format(strings.editor.clock, { name: clockName })}
          </button>
        )}
        <button type="button" className="button secondary" onClick={() => sim.reset()}>
          {strings.editor.resetSim}
        </button>
      </div>
      {!sim.converged && <p className="try-it-note">{strings.editor.notSettled}</p>}
    </div>
  );
}

function clockOf(challenge: Challenge): string | undefined {
  if (challenge.tests.kind !== "sequence") return undefined;
  return challenge.tests.steps.find((s) => s.clock)?.clock;
}

function DrawEditor({ challenge, artifact, onChange, verdict }: ChallengeEditorProps) {
  const strings = useViewStrings();
  const iface = challenge.interface;
  const drawing = useMemo<Drawing>(() => {
    const stored = artifact.circuit ?? challenge.initial.circuit;
    return stored ? withInterface(circuitToDrawing(stored as Circuit), iface) : emptyDrawing(iface);
  }, [artifact.circuit, challenge.initial.circuit, iface]);
  const [importText, setImportText] = useState("");
  const [importNote, setImportNote] = useState<string[]>([]);
  const compiled = useMemo(() => compileDrawing(drawing, challenge.id), [drawing, challenge.id]);
  const generated = useMemo(
    () => (compiled.circuit ? generate(compiled.circuit) : undefined),
    [compiled.circuit],
  );

  const onDrawing = (next: Drawing) => {
    const result = compileDrawing(next, challenge.id);
    if (result.circuit) onChange({ ...artifact, circuit: result.circuit });
  };

  const importFromText = () => {
    const result = elaborate(importText, {
      allowed: challenge.allowedConstructs as Construct[],
      ...modulesOption(challenge),
    });
    const errors = result.messages.filter((m) => m.severity !== "warning");
    if (errors.length || !result.circuit) {
      setImportNote(errors.map((m) => (m.at ? `${m.text} (line ${m.at.line})` : m.text)));
      return;
    }
    const ports = portProblem(result.circuit, challenge, strings);
    if (ports) {
      setImportNote([
        format(strings.editor.importPorts, {
          ports: list([...iface.inputs.map((p) => p.name), ...iface.outputs.map((p) => p.name)]),
        }),
      ]);
      return;
    }
    setImportNote([strings.editor.imported]);
    onDrawing(withInterface(circuitToDrawing(result.circuit), iface));
  };

  const marked = markedPath(verdict);
  return (
    <div className="draw-editor">
      <Builder
        drawing={drawing}
        onChange={onDrawing}
        palette={challenge.palette}
        highlight={marked}
        title={strings.editor.drawingTitle}
      />
      {compiled.circuit && undrivenOutputs(compiled.circuit).length === 0 && (
        <details className="editor-try" open>
          <summary>{strings.editor.tryIt}</summary>
          <TryIt
            circuit={compiled.circuit}
            {...(clockOf(challenge) ? { clockName: clockOf(challenge) as string } : {})}
            highlight={marked}
            pins={challenge.tryIt === "pins"}
            words={challenge.feedback === "words"}
          />
        </details>
      )}
      {generated && (
        <details className="editor-as-text">
          <summary>{strings.editor.asText}</summary>
          <pre className="hdl-generated">{generated.text}</pre>
        </details>
      )}
      <details className="editor-import">
        <summary>{strings.editor.importHeading}</summary>
        <label>
          <span>{strings.editor.importLabel}</span>
          <textarea
            className="hdl-text"
            rows={6}
            spellCheck={false}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
        </label>
        <button type="button" className="button secondary" onClick={importFromText}>
          {strings.editor.importButton}
        </button>
        {importNote.length > 0 && (
          <ul className="editor-import-note" role="status">
            {importNote.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}

function WriteEditor({ challenge, artifact, onChange, verdict }: ChallengeEditorProps) {
  const strings = useViewStrings();
  const text = artifact.hdl ?? challenge.initial.hdl ?? "";
  const result = useMemo(
    () => circuitOf(challenge, { hdl: text }, strings),
    [challenge, text, strings],
  );
  const marked = markedPath(verdict);
  return (
    <div className="write-editor">
      <HdlPanel
        text={text}
        onChange={(hdl) => onChange({ ...artifact, hdl })}
        allowed={challenge.allowedConstructs as Construct[]}
        {...modulesOption(challenge)}
        title={strings.editor.writeTitle}
        highlight={marked}
        {...(challenge.initial.hdl !== undefined ? { untouched: challenge.initial.hdl } : {})}
        drawn={challenge.tryIt !== "pins"}
      />
      {/* A pins Try it is long (a word's bits are buttons): folded, it leaves Run tests near
          the text. */}
      {result.circuit && (
        <details className="editor-try" open={challenge.tryIt !== "pins"}>
          <summary>{strings.editor.tryIt}</summary>
          <TryIt
            circuit={result.circuit}
            {...(clockOf(challenge) ? { clockName: clockOf(challenge) as string } : {})}
            highlight={marked}
            pins={challenge.tryIt === "pins"}
            words={challenge.feedback === "words"}
          />
        </details>
      )}
    </div>
  );
}

export const ChallengeEditor: ComponentType<ChallengeEditorProps> = (props) =>
  props.challenge.gradedDirection === "answer" ? (
    <AnswerEditor {...props} />
  ) : props.challenge.gradedDirection === "write" ? (
    <WriteEditor {...props} />
  ) : (
    <DrawEditor {...props} />
  );

export const TIME_MODEL_NOTES: Book["timeModelNotes"] = {
  settle:
    "Every gate takes one step. After you change an input, the circuit is recomputed step by step until nothing changes. A signal that keeps changing is shown as X. Nothing here is real time.",
  clocked:
    'In figures marked "Clocked", you change an input only while CLK is 0. Pressing "Clock CLK" raises CLK and then lowers it. The circuit settles before each rising edge, after it, and after CLK falls. A challenge\'s tests work differently: they set CLK themselves, step by step, and some steps change an input while CLK is 1.',
  delay:
    "Each gate has its own propagation delay. Changes are worked through in time order. Two changes can race, and which arrives first decides the result. This is the model in which setup and hold times can be seen.",
};

export function createBook(
  lessons: readonly Lesson[],
  interactives: Readonly<Record<string, ComponentType<InteractiveProps>>>,
): Book {
  return {
    id: "dd",
    title: "Digital Design: From Bits to a Working Computer",
    lessons,
    interactives,
    ChallengeEditor,
    // Remembered, so the front page and a lesson re-check saved work without running it again.
    grade: rememberVerdicts(grade),
    timeModelNotes: TIME_MODEL_NOTES,
  };
}
