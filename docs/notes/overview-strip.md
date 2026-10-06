# The overview strip and zoom: tried on one drawing, then on every large one

On a phone the author found that Module 8's whole datapath, 2,099 pixels wide in `branches`, shows
about a sixth of its width in its box, and that the browser's pinch zoom only enlarges the page
from the size it loads at. They asked to try a strip with the whole drawing above large drawings,
and a pinch that zooms the drawing out, on one drawing first. The managing session built it on
6 October 2026, after showing the author a mock.

## What the trial figure does

The figure is `branches`' stepped loop (`sum`, a `datapath` figure with `overview: true`). The
strip and the zoom show only where a figure asks for them and its drawing, at its own size, is
wider than its box: on a phone and on a desktop alike for this drawing.

- **The strip**: the whole drawing, small, above it, without its words, in the drawing's own live
  colours. A frame marks the part on screen, across and down. Pressing or dragging in the strip
  moves the drawing there. From a keyboard the strip is one slider: the arrow keys move the
  drawing half a box, Home and End go to the ends. The strip stays at the top of the window while
  the drawing is on screen, which matters because the drawing is taller than a phone's screen.
- **The zoom**: from half the drawing's size (or fitting the box, where that is larger) to twice
  its size. Two fingers on the drawing zoom it, and one finger still scrolls it; a trackpad's
  pinch, which the browser sends as the wheel with Ctrl held, zooms it too. The buttons Make
  smaller and Make larger step through half, three quarters, its own size, one and a half and
  twice: they are the one-pointer equal that WCAG 2.5.1 requires of a gesture of two fingers, and
  a keyboard's way to zoom. Outside the drawing the browser's own zoom works as before; inside it,
  two fingers zoom the drawing instead of the page.
- **Below 0.6 of its size** the drawing's words are hidden, since they would be under about
  7 pixels high, and its lines stay 1 to 2 pixels wide, as in the strip. A wire's touch target
  stays 14 pixels wide. Between 0.6 and 1 the words show smaller than the page's 11-pixel rule:
  that rule holds for the page as it loads, and a learner who zooms a drawing out chooses smaller
  words, as with the browser's own zoom.

## How it is built

- `packages/dd-views/src/overview.ts`: the geometry, pure, tested in `overview.test.ts`: the zoom's
  limits, the part of the drawing on screen, and the scroll that puts a point under a finger.
- `packages/dd-views/src/Overview.tsx`: `useZoom` sets the custom property `--zoom` on the
  drawing's box, which the drawing's size follows, so a pinch needs no render of the drawing's
  parts; `OverviewStrip` copies the drawing after each render, takes out its words, titles and
  controls, and marks the copy `aria-hidden` and `inert`.
- `CircuitView` takes `overview`; the `datapath` figure passes its prop on.
- Six strings, drafted by the drafting subagent from a brief of facts. Its first note said one
  press of Make smaller fits the whole drawing, which takes about five presses on a phone; it was
  sent back once with that fact, and the second draft stands.
- `tests/educational/overview.spec.ts` drives the figure at both widths: the strip on that figure
  only, the keys and a press moving the drawing, the buttons from fit to twice the size, two
  fingers through Chromium's touch input on the phone, Ctrl and the wheel on the desktop, and the
  strip held at the top of the window. The diagram checks skip the strip's copy
  (`svg.circuit:not(.circuit-overview)`), which has no words and no controls by design.

## Before it is turned on for every large drawing

- **Which drawings are large.** The trial shows the strip whenever the drawing is wider than its
  box. On a phone that is most of Module 8's drawings and some earlier ones. A higher threshold,
  such as twice the box, may serve the reader better; the trial should decide.
- **Real phones.** One finger scrolling while two zoom depends on the browser: Chrome on Android
  and Safari on iOS (whose own gesture events are stopped inside the drawing) need trying by hand.
- **Cost.** The copy is taken after every render of the drawing, at each edge and each wire
  pointed at. It is quick for the datapath on a desktop; a slow phone should be tried.
- **Opening a block** gives a new drawing, which starts at its own size.

## On every large drawing

On 6 October 2026, after trying it, the author asked for the strip and the zoom on every large
drawing. Large means at least 1,000 pixels wide at the drawing's own size (`LARGE_DRAWING` in
`Overview.tsx`): three phone screens across, and wider than the page on a desktop. The measure of
the 139 figures that draw a circuit put the line there. Above it are 15 figures, all in Module 7
(the ALU in `alu-jobs`, `flags` and `wide-alu`) and Module 8 (the datapath in `fetch`,
`memory-access` and `branches`). Below it the widest are 932 pixels (Module 8's `constants`), 864
(Module 3's adder that subtracts) and 852 (Module 8's `instructions`), then drawings of 500 to 824
that scroll comfortably and would only gain clutter. Eight more figures name a circuit wider than
the line but never draw it: Module 7's test suites and carry steppers, and `fetch`'s timeline.

`CircuitView` decides for every figure that draws a circuit: a large drawing that is wider than its
box has the strip and the zoom, unless the figure sets `overview` to false. A figure can also set it
to true, to give them to a smaller drawing wider than its box; none does. The per-figure trial
setting on `branches` went. `tests/educational/overview.spec.ts` checks the rule across a lesson
under the line and two over it, and drives the strip and the zoom on `branches`' loop.

## What a learner's walk found, and what changed

The session that built Module 8 walked `branches`' loop as a learner, at 1280 and 375 pixels,
after the trial went live:

1. A drag in the strip from its own place, before it was held at the top of the window, threw the
   page down: about 16,000 pixels on a desktop, to the end of the page on a phone. Each move of a
   drag scrolled the page to bring the pressed row on screen, which moved the strip under a still
   finger, so the next move scrolled again. The tests had pressed and used the keys, never dragged.
   Now only a press brings a row on screen; a drag moves the drawing across and never the page,
   and a browser test drags from the strip's own place.
2. Zoomed to fit, on a phone the drawing (285 pixels across) was smaller than the strip above it.
   The zoom now stops at half the drawing's size.
3. After zooming out, Make larger stepped by 1.5 from wherever the zoom was and never landed on
   the drawing's own size again. The buttons now step through fixed sizes with 1 among them.
4. At about 0.67 the words measured 10 pixels, under the page's 11-pixel rule; at about 0.69 on a
   phone, with the strip, the walk found the best view of the lesson's branch logic. The words now
   show down to 0.6 of their size, smaller than the rule by the learner's choice, and hide below.

It also found every Module 8 lesson's words pointing at blocks that lie off the drawing's first
view on a phone. The strip shows where they are; opening a figure at the part its words name is
left for later.

## Where a wide drawing opens

After checkpoint 3 the author asked for the gaps the report listed to be closed, this one among
them. A figure names the parts its words point at (`focus`), and its drawing opens with them in
the middle of the box (`focus.ts`, `CircuitView.tsx`). Module 8's learner pass had named them in
`fetch`, `memory-access` and `branches`. The code stepped aside for a drawing with the strip, but
scrolled before the drawing knew it had one, so those figures opened on their parts by an accident
of order. Opening on the named parts is now the rule, with the strip or without it, and the
strip's frame follows.

- **As many as fit, in the order given.** A phone's box shows about 320 pixels of a drawing at its
  own size. The names are taken in order for as long as their parts fit the box together; a first
  name too wide to fit alone is shown anyway. Before, the middle of all the names was shown, which
  on a phone could be bare wire: `branches`' call figure opened between `next` and `yWord` with
  neither on screen, and `memory-access`'s first figure with no named part whole. That lesson now
  names the memory and `pickLoad` first, the load's way to R2, and `pickA` last.
- **A part as drawn.** A part is measured on the page with its words and the values written at its
  outputs, which reach past its box: `pickLoad` is 99 pixels across as drawn, over a box of 60. The
  measure is taken again once the site's fonts have loaded, unless the learner has moved the
  drawing meanwhile. A stretch up to 8 pixels wider than the box still fits, since what falls
  outside is the halo round a word: a phone 375 pixels wide holds the memory and `pickLoad`, 318
  pixels as drawn, in 317.
- **A fault the learner chooses.** Its wire or its gate comes first, then the figure's own names as
  far as they fit. A fault on a wire is found by the wire, from its driver to its nearest reader;
  at that reader instead when the wire is longer than the box, or when it starts at the fault's
  own fixed value, which the layout places wherever there is room (in `constants`, "BCONST stuck
  at 0" draws its value at the far left, and acts at `pickB`). A wire is tried before a pin of the
  same name, which the fault cuts off. A wrong gate is found by the gate, or by the block that
  holds it, so a fault inside Module 9's control unit opens on the control unit. On a phone, Module
  7's "C2 stuck at 0" was about 300 pixels past the first view; it now opens in the middle of the
  box, with the two slices it joins.
- **Two figures name their parts.** `wide-alu`'s 64-bit ALU opens on g0 and g1, as its lead asks the
  learner to press a group; `branches`' loop on `condition` and `next`, which make NEXT, the bus its
  lead says to watch.

`focus.test.ts` holds the rule. `tests/educational/overview.spec.ts` checks the loop, the 64-bit
ALU, and a fault in Module 7's ALU and in `memory-access`, at both widths.
