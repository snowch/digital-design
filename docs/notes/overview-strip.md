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
- **The zoom**: from fitting the box (about 0.13 on a 375-pixel phone) to twice the drawing's size.
  Two fingers on the drawing zoom it, and one finger still scrolls it; a trackpad's pinch, which
  the browser sends as the wheel with Ctrl held, zooms it too. The buttons Make smaller and Make
  larger zoom by 1.5 a press: they are the one-pointer equal that WCAG 2.5.1 requires of a
  gesture of two fingers, and a keyboard's way to zoom. Outside the drawing the browser's own zoom
  works as before; inside it, two fingers zoom the drawing instead of the page.
- **Below half size** the drawing's words are hidden, since they would be under 6 pixels high, and
  its lines stay 1 to 2 pixels wide, as in the strip. A wire's touch target stays 14 pixels wide.

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
