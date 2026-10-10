# Brief V5c: the lab-run figures' map, after the review

Read `V5.md` first. A correction: the `lab-run` figures run the course's own text with one line
changed, so they must not draw any port's join; that would show the joins the lab asks for. In
those figures the drawing is the map alone: the three frames, each part's name and how many of its
ports are open (every port is joined in every figure's text). Before any run, nothing is marked.
After a run, if its sentence names a value one of the nine parts holds, that part is marked: the
memory for the timer, "waiting", the display or the lamps; the register file for a register; the
control registers for C0 to C4; the trap logic when the machine halts and the model does not. A
sentence about the PC names no part, since the next PC is worked out in the text's own logic, and
marks nothing.

- `joinsRunMark`: the label under a marked part on a figure's map, a few words, lower case, no full
  stop: the last run's sentence names a value this part holds.
- `joinsMarkNote`: one sentence under a figure's map: after a run, the part that holds the value
  its sentence names is marked; a sentence about the PC marks none.
