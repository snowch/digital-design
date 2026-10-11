#!/usr/bin/env bash
# Copyright © 2026 Christopher Snow

# The course's SystemVerilog, through real tools (docs/simulator.md, "Real tools"). CI runs this as
# its own job on every push to main. It needs Verilator (apt: verilator) and Yosys (pip install -r
# scripts/real-tools/requirements.txt), so `scripts/check.sh` does not run it.
set -euo pipefail
cd "$(dirname "$0")/../.."

OUT="${1:-real-tools-out}"
echo "== collect every text the course shows or accepts =="
npx vite-node scripts/real-tools/collect.mts "$OUT"

echo "== Verilator lint and Yosys synthesis =="
python3 scripts/real-tools/run.py "$OUT"

echo "== Verilator simulation against the course's engine =="
python3 scripts/real-tools/simulate.py "$OUT"
