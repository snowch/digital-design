// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { elaborate } from "@dd/hdl";
import { Simulator, formatWord, parseWord, type Circuit } from "@dd/sim";

import {
  inputCombinations,
  machineCircuit,
  machineProblems,
  machineText,
  nextState,
  stateNamed,
  stateOfCode,
  type Machine,
} from "./fsm";
import { MACHINES } from "./machines";

type Inputs = Record<string, 0 | 1>;

/** A run of a machine's circuit: reset, then edges with the given inputs. */
function driver(circuit: Circuit, m: Machine) {
  const sim = new Simulator(circuit);
  const set = (values: Inputs) => {
    for (const i of m.inputs) sim.setInput(i, parseWord(String(values[i] ?? 0), 1));
  };
  sim.setInput("CLK", parseWord("0", 1));
  sim.setInput("RST", parseWord("1", 1));
  set({});
  sim.clockCycle("CLK");
  sim.setInput("RST", parseWord("0", 1));
  return {
    sim,
    edge(values: Inputs) {
      set(values);
      sim.clockCycle("CLK");
    },
    state: () => formatWord(sim.read("S")),
  };
}

/** Inputs that take the machine from its reset state to each state, by the table. */
function paths(m: Machine): Map<string, Inputs[]> {
  const start = stateOfCode(m, "0".repeat(m.states[0]!.code.length))!.name;
  const found = new Map<string, Inputs[]>([[start, []]]);
  const queue = [start];
  while (queue.length) {
    const s = queue.shift()!;
    for (const values of inputCombinations(m)) {
      const t = nextState(m, s, values)!;
      if (!found.has(t)) {
        found.set(t, [...found.get(s)!, values]);
        queue.push(t);
      }
    }
  }
  return found;
}

/** Every state, every input combination: the circuit goes where the table says. */
function agrees(m: Machine, circuit: Circuit): string[] {
  const wrong: string[] = [];
  for (const [state, path] of paths(m)) {
    for (const values of inputCombinations(m)) {
      const run = driver(circuit, m);
      for (const v of path) run.edge(v);
      expect(run.state()).toBe(stateNamed(m, state).code);
      for (const o of m.outputs)
        expect(formatWord(run.sim.read(o)), `${o} in ${state}`).toBe(
          String(stateNamed(m, state).outputs?.[o] ?? 0),
        );
      run.edge(values);
      const want = stateNamed(m, nextState(m, state, values)!).code;
      if (run.state() !== want)
        wrong.push(`${state} ${JSON.stringify(values)}: ${run.state()} not ${want}`);
    }
  }
  return wrong;
}

describe("state machines as data", () => {
  for (const m of Object.values(MACHINES)) {
    it(`${m.id}: is a well-formed table`, () => {
      expect(machineProblems(m)).toEqual([]);
    });
  }

  it("refuses a table with a gap or an overlap", () => {
    const m = MACHINES.retry;
    const gap = { ...m, rows: m.rows.filter((r) => !(r.from === "WAIT" && r.when["TICK"] === 1)) };
    expect(machineProblems(gap)).toContain("in WAIT no row covers GO 0, OK 0, FAIL 0, TICK 1");
    const twice = { ...m, rows: [...m.rows, { from: "IDLE", when: {}, to: "IDLE" }] };
    expect(machineProblems(twice).some((p) => p.startsWith("in IDLE 2 rows cover"))).toBe(true);
  });

  for (const m of Object.values(MACHINES)) {
    it(`${m.id}: the circuit goes where the table says, in every state, for every input`, () => {
      // Every state the reset can reach; a machine whose reset is no state reaches none.
      if (!stateOfCode(m, "0".repeat(m.states[0]!.code.length))) return;
      expect(agrees(m, machineCircuit(m))).toEqual([]);
    });

    for (const style of ["codes", "enum"] as const)
      it(`${m.id}: its text with ${style}, elaborated, does what the table says`, () => {
        if (!stateOfCode(m, "0".repeat(m.states[0]!.code.length))) return;
        const result = elaborate(machineText(m, { style }));
        expect(result.messages).toEqual([]);
        expect(agrees(m, result.circuit!)).toEqual([]);
      });
  }

  it("names a net on every port of its three blocks, so a drawing wires each one", () => {
    for (const m of Object.values(MACHINES)) {
      const c = machineCircuit(m);
      for (const block of c.composites.filter((x) => !x.path.includes("/")))
        for (const [port, net] of Object.entries({ ...block.inputs, ...block.outputs }))
          expect(net, `${m.id} ${block.path}.${port}`).toBeTypeOf("number");
      const out = c.composites.find((x) => x.path === "output-logic")!;
      expect(Object.keys(out.outputs)).toEqual(m.outputs);
    }
  });

  it("the retry controller's reset leads to IDLE, and with TRY at 00 to TRY", () => {
    const ok = driver(machineCircuit(MACHINES.retry), MACHINES.retry);
    expect(ok.state()).toBe("00");
    expect(formatWord(ok.sim.read("SEND"))).toBe("0");
    const bad = driver(machineCircuit(MACHINES["retry-try-zero"]), MACHINES["retry-try-zero"]);
    expect(formatWord(bad.sim.read("SEND"))).toBe("1");
  });

  it("one flip-flop per state: after a reset no state's line is on, and none ever comes on", () => {
    const m = MACHINES["retry-one-hot"];
    const run = driver(machineCircuit(m), m);
    expect(run.state()).toBe("0000");
    run.edge({ GO: 1 });
    run.edge({ GO: 1, TICK: 1 });
    expect(run.state()).toBe("0000");
    expect(formatWord(run.sim.read("SEND"))).toBe("0");
  });

  it("writes the retry controller's text with one case arm per state", () => {
    expect(machineText(MACHINES.retry, { style: "codes" })).toMatchInlineSnapshot(`
      "module retry(input logic GO, input logic OK, input logic FAIL, input logic TICK, input logic RST, input logic CLK, output logic SEND, output logic SIREN, output logic [1:0] S);
        logic [1:0] state;
        logic [1:0] next;
        always_ff @(posedge CLK) begin
          if (RST) state <= 2'b00;
          else state <= next;
        end
        always_comb begin
          case (state)
            2'b00: begin // IDLE
              if (GO) next = 2'b01;
              else next = 2'b00;
            end
            2'b01: begin // TRY
              if (OK) next = 2'b00;
              else if (~OK & FAIL) next = 2'b10;
              else if (~OK & ~FAIL & TICK) next = 2'b11;
              else next = 2'b01;
            end
            2'b10: begin // WAIT
              if (TICK) next = 2'b01;
              else next = 2'b10;
            end
            default: next = 2'b11; // GIVE_UP
          endcase
        end
        assign SEND = (state == 2'b01);
        assign SIREN = (state == 2'b11);
        assign S = state;
      endmodule
      "
    `);
  });
});
