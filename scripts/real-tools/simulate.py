# Copyright © 2026 Christopher Snow

"""Does real simulation agree with the course's engine?

For every text collect.mts recorded a trace for (the stimulus, and what the course's engine gave
after each step), this writes a SystemVerilog testbench that applies the same stimulus, simulates
the text in Verilator, and compares every output bit the engine knows. Verilator has two values
for a bit and the engine has three, so a bit the engine calls X is not compared: the engine says
it cannot decide, and real hardware may start either way.

Usage: simulate.py [dir] (default: real-tools-out). Exit 1 if any output differs.
"""

import concurrent.futures
import json
import os
import re
import shutil
import subprocess
import sys

OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "real-tools-out")
VERILATOR = os.environ.get("VERILATOR") or shutil.which("verilator")
# A text bigger than this is not simulated: its compile costs more than the check is worth.
MAX_BYTES = int(os.environ.get("REAL_TOOLS_MAX_BYTES", "250000"))


def decl(width, name):
    return f"logic [{width - 1}:0] {name}" if width > 1 else f"logic {name}"


def bench(entry, trace):
    ins, outs = trace["inputs"], trace["outputs"]
    clock = next((s["clock"] for s in trace["steps"] if s.get("clock")), None)
    lines = ["module tb;"]
    for i in ins:
        init = "= 0"
        lines.append(f"  {decl(i['width'], i['name'])} {init};")
    for o in outs:
        lines.append(f"  wire {decl(o['width'], o['name'])[0:]};".replace("wire logic", "wire"))
    ports = ", ".join(f".{p['name']}({p['name']})" for p in [*ins, *outs])
    lines.append(f"  {entry['top']} dut ({ports});")
    lines.append("  initial begin")
    width = {i["name"]: i["width"] for i in ins}
    for n, step in enumerate(trace["steps"]):
        for name, (value, known) in step["set"].items():
            lines.append(f"    {name} = {width[name]}'h{int(value):x};")
        lines.append("    #1;")
        if step.get("clock"):
            lines.append(f"    {step['clock']} = 1; #1; {step['clock']} = 0; #1;")
        for o in outs:
            lines.append(f'    $display("{n} {o["name"]} %h", {o["name"]});')
    lines.append("    $finish;")
    lines.append("  end")
    lines.append("endmodule")
    return "\n".join(lines) + "\n"


def check(entry):
    trace = json.load(open(os.path.join(OUT, entry["trace"])))
    work = os.path.join(OUT, "sim", re.sub(r"[^A-Za-z0-9]+", "-", entry["id"]))
    os.makedirs(work, exist_ok=True)
    tb = os.path.join(work, "tb.sv")
    open(tb, "w").write(bench(entry, trace))
    build = subprocess.run(
        [VERILATOR, "--binary", "--timing", "-Wno-fatal", "-Wno-lint", "-Wno-style", "-CFLAGS", "-O0",
         "--top-module", "tb", os.path.abspath(tb), *[os.path.join(OUT, f) for f in [*entry["deps"], entry["file"]]],
         "-Mdir", os.path.join(work, "obj")],
        capture_output=True, text=True,
    )
    exe = os.path.join(work, "obj", "Vtb")
    if build.returncode != 0 or not os.path.exists(exe):
        return entry, [f"does not build: {build.stderr.strip()[-300:]}"], 0
    run = subprocess.run([exe], capture_output=True, text=True)
    got = {}
    for line in run.stdout.splitlines():
        m = re.match(r"(\d+) (\S+) ([0-9a-fA-F]+)$", line)
        if m:
            got[(int(m.group(1)), m.group(2))] = int(m.group(3), 16)
    problems, compared = [], 0
    for n, step in enumerate(trace["steps"]):
        for name, (value, known) in step["read"].items():
            known = int(known)
            if not known:
                continue
            compared += 1
            actual = got.get((n, name))
            if actual is None:
                problems.append(f"step {n + 1}: no value for {name}")
            elif (actual ^ int(value)) & known:
                set_ = {k: hex(int(v[0])) for k, v in step["set"].items()}
                problems.append(
                    f"step {n + 1}: {name} is {hex(actual)} in Verilator, the engine gave {hex(int(value))}"
                    f" (known bits {hex(known)}); inputs set {set_}"
                )
    shutil.rmtree(work, ignore_errors=True)
    return entry, problems, compared


def main():
    manifest = json.load(open(os.path.join(OUT, "manifest.json")))
    todo, skipped = [], []
    for e in manifest["entries"]:
        if "trace" not in e or not re.search(os.environ.get("REAL_TOOLS_ONLY", ""), e["id"]):
            continue
        size = sum(os.path.getsize(os.path.join(OUT, f)) for f in [*e["deps"], e["file"]])
        (skipped if size > MAX_BYTES else todo).append(e)
    failures, compared = [], 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 2) as pool:
        for entry, problems, n in pool.map(check, todo):
            compared += n
            for p in problems[:3]:
                failures.append(f"{entry['id']} ({entry['source']}): {p}")
    print(f"{len(todo)} texts simulated in Verilator against the engine, {compared} output values compared")
    if skipped:
        print(f"  not simulated (over {MAX_BYTES} bytes of text): {len(skipped)}")
    json.dump({"simulated": len(todo), "compared": compared, "skipped": len(skipped), "failures": failures},
              open(os.path.join(OUT, "meaning.json"), "w"))
    if failures:
        print(f"\n{len(failures)} difference(s):")
        for f in failures:
            print("  " + f[:500])
        sys.exit(1)
    print("Verilator and the engine agree.")


main()
