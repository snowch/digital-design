import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { assembleChecked, listing, debugStart, debugStep, memoryWord, endOf } from "@dd/dd-model";
import { depthRun } from "@dd/dd-views";
import * as P from "./module11";
const sig = (v?: bigint) => (v === undefined ? "X" : BigInt.asIntN(64, v).toString());
it("l", () => {
  const out: string[] = [];
  out.push(listing(assembleChecked(P.TOTAL).program!).join("\n"));
  const i = { door: 0 as const, warm: 0 as const, sensorA: -170n, sensorB: -190n };
  for (const [n, src] of [
    ["total", P.TOTAL],
    ["nostack", P.TOTAL_NO_STACK],
    ["nostart", P.TOTAL_NO_START],
    ["both", P.BOTH_REFERENCE],
  ] as const) {
    let s = debugStart(assembleChecked(src).program!.rom);
    const tr: string[] = [];
    while (!s.stopped && s.ran < 5000) {
      s = debugStep(s, i);
      if (n !== "nostack" || s.ran < 30)
        tr.push(
          `${s.ran}:${s.cpu.pc.toString(16)} R14=${s.cpu.regs[14]?.toString(16)} R15=${s.cpu.regs[15]?.toString(16)} R10=${sig(s.cpu.regs[10])} R1=${sig(s.cpu.regs[1])} calls=${s.calls.length}`,
        );
    }
    out.push(
      `== ${n}: ${JSON.stringify(endOf(s.stopped))} ran ${s.ran} disp ${sig(s.cpu.display)} deepest ${s.deepest?.toString(16)} 7b8=${memoryWord(s.cpu, 0x7b8)?.toString(16)} 7b0=${sig(memoryWord(s.cpu, 0x7b0))}`,
    );
    if (n === "total" || n === "nostack") out.push(...tr);
  }
  const d = depthRun(P.TOTAL, { door: 0, warm: 0, sensorA: -170n, sensorB: -190n });
  out.push(`depths ${d!.depths.join(",")} calls ${d!.calls}`);
  writeFileSync(
    "/tmp/claude-0/-home-user-digital-design/19ee372a-46f4-58ab-ae38-fa9bac24ae35/scratchpad/e.txt",
    out.join("\n"),
  );
});
