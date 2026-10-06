# Digital Design: From Bits to a Working Computer

Copyright © 2026 Christopher Snow.

An interactive, browser-based course that teaches from signals to a working CPU, built on a
reusable interactive learning platform.

**The course is published at <https://snowch.github.io/digital-design/>.** The site is deployed
from the `main` branch by `.github/workflows/deploy.yml`; a branch not yet merged into `main` is
not on the site.

**Status.** Which modules have lessons, the list of lessons on the site says: it is worked out
from the lessons themselves. On 6 October 2026 the course machine passed checkpoint 2, and the
first shared primitives were extracted.

## Read first

- [`CLAUDE.md`](CLAUDE.md): the binding project rules, including what breaks the build and why.
- [`docs/plan.md`](docs/plan.md): the modules in order, what each builds, the checkpoints, and the
  decisions taken since the course brief.
- [`docs/machine.md`](docs/machine.md) and [`docs/isa.md`](docs/isa.md): the course machine, its
  hardware and its instructions, approved at checkpoint 2.
- [`docs/platform.md`](docs/platform.md): the packages, what the platform shares with any book
  built the same way, and what is the course's own.
- [`docs/inventory.md`](docs/inventory.md): the corpus as found, its tests run, every interaction
  catalogued, the layering and the decisions the author approved.
- [`docs/simulator.md`](docs/simulator.md): what the engine models, its three time models, the
  trace, the diagnosis, the capture map of the flip-flop and the metastability overlay.
- [`docs/authoring.md`](docs/authoring.md): how a lesson is made, the interactives and their
  props, the prose process and what the tests hold a lesson to.
- [`docs/style.md`](docs/style.md): the style checklist every learner-facing string is edited
  against.

## Working on it

```sh
npm ci            # once; .npmrc sets legacy-peer-deps, see CLAUDE.md
npm run dev       # the course at http://localhost:5173/digital-design/
npm run check     # exactly what CI runs: Prettier, tsc, Vitest, the build, Playwright
```

The repository is an npm workspace: `apps/course` (the shell), `content/lessons` (the lessons as
data), `packages/lesson-schema` and `packages/lesson-runtime` (the platform), `packages/sim`,
`packages/dd-model`, `packages/hdl` and `packages/dd-views` (the digital-design domain), and
`tests/educational` (Playwright). The companion repository `snowch/learning-platform` holds the
cross-book regression job and, in time, the platform contract.
