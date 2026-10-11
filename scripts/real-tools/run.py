# Copyright © 2026 Christopher Snow

"""Runs the course's SystemVerilog through real tools.

Reads `<dir>/manifest.json` (written by collect.mts) and, for every text:

- `verilator --lint-only -Wall`, with the warnings listed in waivers.json set aside;
- Yosys `read_verilog -sv`, `hierarchy -check`, `proc`, `synth` and `check`.

A warning that no waiver covers fails the run, and so does a waiver that covers nothing, so the
list stays what the course needs and no more. Usage: run.py [dir] (default: real-tools-out).
"""

import collections
import concurrent.futures
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "real-tools-out")
YOSYS = os.environ.get("YOSYS") or shutil.which("yowasp-yosys") or shutil.which("yosys")
VERILATOR = os.environ.get("VERILATOR") or shutil.which("verilator")


def matches(where, entry, file):
    if "categories" in where and entry["category"] not in where["categories"]:
        return False
    if "ids" in where and entry["id"] not in where["ids"]:
        return False
    if where.get("loop") and not entry["loop"]:
        return False
    if "filePrefix" in where and not (file or "").startswith(where["filePrefix"]):
        return False
    return True


def lint(entry):
    """Verilator's findings: (code, file, message) per warning or error."""
    cmd = [VERILATOR, "--lint-only", "-Wall", "--top-module", entry["top"], *entry["deps"], entry["file"]]
    r = subprocess.run(cmd, cwd=OUT, capture_output=True, text=True)
    found = []
    for line in r.stderr.splitlines():
        m = re.match(r"%(Warning|Error)(?:-(\w+))?: (?:([^:\s]+):\d+:\d+: )?(.*)", line)
        if not m:
            continue
        kind, code, file, message = m.groups()
        if message.startswith("Exiting due to"):
            continue
        found.append((code or "ERROR", file, message))
    if r.returncode != 0 and not found:
        found.append(("ERROR", None, r.stderr.strip()[:300]))
    return found


def warm_yosys():
    """Runs Yosys once on its own, before any worker does.

    The WebAssembly Yosys (yowasp) compiles its module on first use and writes the result into a
    cache file, in place and without a lock. Workers that start together on a cold cache read a
    file another is still writing, or have the file cut short under them, and die silently. So the
    cache is filled by one process first.
    """
    r = subprocess.run([YOSYS, "-V"], cwd=OUT, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"{YOSYS} -V failed with exit code {r.returncode}:\n{r.stdout}{r.stderr}")


def synth(entry):
    """Yosys's findings: (code, file, message). Errors are code ERROR, with everything Yosys said."""
    files = " ".join([*entry["deps"], entry["file"]])
    script = (
        f"read_verilog -sv {files}; hierarchy -check -top {entry['top']}; "
        f"proc; synth -top {entry['top']}; check"
    )
    r = subprocess.run([YOSYS, "-q", "-p", script], cwd=OUT, capture_output=True, text=True)
    text = r.stdout + r.stderr
    found = []
    for line in text.splitlines():
        if line.startswith("ERROR"):
            found.append(("ERROR", None, line))
        elif "found logic loop" in line:
            found.append(("LOOP", None, line))
        elif "is used but has no driver" in line:
            found.append(("NODRIVER", None, line))
        elif "implicitly declared" in line:
            found.append(("IMPLICIT", None, line))
        elif line.startswith("Warning"):
            found.append(("WARNING", None, line))
    if r.returncode != 0 and not any(c == "ERROR" for c, _, _ in found):
        found.append(
            (
                "ERROR",
                None,
                f"{os.path.basename(YOSYS)} exited with code {r.returncode} and no ERROR line. "
                f"Command: {script}\nOutput:\n{text if text.strip() else '(none)'}",
            )
        )
    return found


def main():
    manifest = json.load(open(os.path.join(OUT, "manifest.json")))
    waivers = json.load(open(os.path.join(HERE, "waivers.json")))
    entries = manifest["entries"]
    used = collections.Counter()
    failures = []
    waived_count = collections.Counter()

    grouped = collections.OrderedDict()

    def judge(tool, entry, findings):
        for code, file, message in findings:
            for i, w in enumerate(waivers[tool]):
                if w["code"] == code and matches(w["where"], entry, file):
                    used[(tool, i)] += 1
                    waived_count[(tool, code)] += 1
                    break
            else:
                key = (tool, code, entry["id"], entry["source"])
                grouped.setdefault(key, [message, 0])[1] += 1

    def work(entry):
        return entry, lint(entry), synth(entry)

    warm_yosys()
    workers = os.cpu_count() or 2
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for entry, v, y in pool.map(work, entries):
            judge("verilator", entry, v)
            judge("yosys", entry, y)

    for (tool, code, ident, source), (message, n) in grouped.items():
        more = f" (and {n - 1} more)" if n > 1 else ""
        failures.append(f"{tool} {code} in {ident} ({source}): {message}{more}")
    for p in manifest["problems"]:
        failures.append(f"collect: {p}")
    for tool in ("verilator", "yosys"):
        for i, w in enumerate(waivers[tool]):
            if not used[(tool, i)]:
                failures.append(f"waiver covers nothing: {tool} {w['code']} {json.dumps(w['where'])}")

    print(f"{len(entries)} texts checked in Verilator and Yosys")
    for (tool, code), n in sorted(waived_count.items()):
        print(f"  waived {n:4d}  {tool} {code}")
    print(f"  waived total {sum(waived_count.values())}")
    json.dump(
        {"files": len(entries), "waived": sum(waived_count.values()), "failures": failures},
        open(os.path.join(OUT, "result.json"), "w"),
    )
    if failures:
        print(f"\n{len(failures)} problem(s):")
        for f in failures[:80]:
            print("  " + f[:400])
        sys.exit(1)
    print("All real-tool checks passed.")


main()
