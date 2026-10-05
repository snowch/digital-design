// The digital-design book: the grader and the challenge editor the runtime calls, and the
// registry of interactives the lessons name. The grader is the engine's test runner behind a
// check that the artifact is a circuit with the challenge's ports.

import { useMemo, useState, type ComponentType } from "react";

import { depthOf, gatesNotOf, gatesOf, libraryCircuit } from "@dd/dd-model";
import { elaborate, generate, type Construct } from "@dd/hdl";
import { limitCount, type Artifact, type Challenge, type Lesson } from "@dd/lesson-schema";
import type { Book, ChallengeEditorProps, InteractiveProps, Verdict } from "@dd/lesson-runtime";
import { runSuite, type Circuit } from "@dd/sim";

import { AnswerEditor, gradeAnswers } from "./AnswerEditor";
import { Builder } from "./Builder";
import { CircuitView } from "./CircuitView";
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
    const result = elaborate(artifact.hdl, { allowed: challenge.allowedConstructs as Construct[] });
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
        }),
        others.map((g) => g.path),
      );
  }
  return out;
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
}: {
  circuit: Circuit;
  clockName?: string;
  highlight?: readonly string[];
}) {
  const strings = useViewStrings();
  const sim = useSettleSim(circuit);
  const [scope, setScope] = useState("");
  return (
    <div className="try-it">
      <CircuitView
        circuit={circuit}
        values={sim.values}
        title={strings.editor.tryItTitle}
        onToggleInput={(name) => sim.toggle(name)}
        scope={scope}
        onScope={setScope}
        {...(highlight ? { highlight } : {})}
      />
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
    const result = elaborate(importText, { allowed: challenge.allowedConstructs as Construct[] });
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
        title={strings.editor.writeTitle}
        highlight={marked}
        {...(challenge.initial.hdl !== undefined ? { untouched: challenge.initial.hdl } : {})}
      />
      {result.circuit && (
        <details className="editor-try" open>
          <summary>{strings.editor.tryIt}</summary>
          <TryIt
            circuit={result.circuit}
            {...(clockOf(challenge) ? { clockName: clockOf(challenge) as string } : {})}
            highlight={marked}
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
    'Inputs change only while CLK is 0. Pressing "Clock CLK" raises CLK and then lowers it. The circuit settles before each rising edge, after it, and after CLK falls.',
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
    grade,
    timeModelNotes: TIME_MODEL_NOTES,
  };
}
