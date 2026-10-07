# Copyright © 2026 Christopher Snow
#
# Places the drafting subagent's drafts (drafts/*.md, "key: text" blocks, as returned) into a
# lesson's prose and labels files, after applying the managing model's checked fixes, each listed
# in fixes.json as [draft, key, old, new, why]. A fix whose old text is not found fails loudly.
# Usage: python3 place.py <lesson-id> <prose drafts...> -- <label drafts...>
import json, re, sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent.parent
KEY = re.compile(r"^([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)?): ?(.*)$")


def read(draft):
    out, key, buf = {}, None, []
    for line in (HERE / "drafts" / f"{draft}.md").read_text().splitlines():
        m = KEY.match(line)
        if m:
            if key:
                out[key] = "\n".join(buf).strip()
            key, buf = m.group(1), [m.group(2)]
        else:
            buf.append(line)
    if key:
        out[key] = "\n".join(buf).strip()
    return out


def fixed(draft, values):
    fixes = json.loads((HERE / "fixes.json").read_text())
    for d, key, old, new, _why in fixes:
        if d != draft:
            continue
        if old not in values.get(key, ""):
            sys.exit(f"fix not applied: {d} {key}: {old!r}")
        values[key] = values[key].replace(old, new, 1)
    return values


def nest(flat):
    root = {}
    for k, v in flat.items():
        parts = k.split(".")
        node = root
        for p in parts[:-1]:
            node = node.setdefault(p, {})
        node[parts[-1]] = v
    def arrays(n):
        if isinstance(n, dict):
            if n and all(k.isdigit() for k in n):
                return [arrays(n[k]) for k in sorted(n, key=int)]
            return {k: arrays(v) for k, v in n.items()}
        return n
    return arrays(root)


def ts(value, indent=1):
    pad = "  " * indent
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return "[\n" + "".join(f"{pad}{ts(v, indent + 1)},\n" for v in value) + "  " * (indent - 1) + "]"
    items = "".join(f"{pad}{k}: {ts(v, indent + 1)},\n" for k, v in value.items())
    return "{\n" + items + "  " * (indent - 1) + "}"


def main():
    lesson = sys.argv[1]
    rest = sys.argv[2:]
    split = rest.index("--")
    prose, labels = {}, {}
    for d in rest[:split]:
        prose.update(fixed(d, read(d)))
    for d in rest[split + 1 :]:
        labels.update(fixed(d, read(d)))
    head = "// Copyright © 2026 Christopher Snow\n\n"
    note = (
        "// Drafted by the course's prose process from briefs of checked facts\n"
        "// (docs/notes/module-0-machine/briefs), checked for facts only and placed by\n"
        "// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.\n\n"
    )
    out = ROOT / "content" / "lessons"
    (out / f"{lesson}.prose.ts").write_text(
        head + f"// The words of the lesson {lesson}.\n" + note + "export const PROSE = " + ts(nest(prose)) + " as const;\n"
    )
    (out / f"{lesson}.labels.ts").write_text(
        head + f"// Titles, objectives, captions and labels of the lesson {lesson}.\n" + note + "export const LABELS = " + ts(nest(labels)) + " as const;\n"
    )


main()
