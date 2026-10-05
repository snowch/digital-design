# The page before the first lesson

The author asked whether the course should have a preface with its prerequisites. It has one now,
at `#/start`, linked from the front page under the line that says what the course assumes.

## Why, and what it holds

The front page said in one line that the course assumes binary to decimal and back. A learner
who is unsure has no way to find out before Module 1 shows them, so the page holds:

- **What the course is**, in four sentences, including that work is kept in this browser only.
- **What you should know**: binary to decimal and back, everyday arithmetic, and nothing about
  electronics, circuits or programming; then a self-check of four conversions, two each way,
  marked in the page. A wrong answer shows its working (the place values of the 1s, added), so a
  learner who is only rusty can see what they forgot. The answers and the working come from the
  model (`bitsOf`, `termsOf`, `unsignedOf`), as every number in a lesson does. A binary answer
  may leave out its leading 0s and group with spaces. Any edit clears the marks until the learner
  checks again, so a mark never sits beside an answer it was not given for.
- **How a lesson works**: the ten labelled sections, predictions, tests and what a failed one
  shows, the five hints, the check of saved work on load, and the time badge.
- A link to the first lesson, named from the lesson's own data.

The header links to it from every page, beside "Lessons", because "how a lesson works" is
reference a learner may want mid-lesson; the nav marks the page it is on.

It is not the curriculum's Module 0, "Meet the machine", which runs a program on the finished
computer and so cannot be written until the computer exists. When it is, "how a lesson works"
may move into it.

## How the words were made

One fact brief to the drafting subagent, each fact checked against the code first: the section
labels (`lesson-runtime` strings), the five hints (the schema refuses four), what a failed test
shows (inputs, actual, expected), the re-check on load, the badge only on simulated figures, and
browser-local storage. The brief banned the words Module 1 introduces (bit, word, threshold) and
the words of later lessons. The first reply described the draft instead of giving it, and was
asked again. Added by the managing session: "in binary" at the end of the working for a decimal
to binary question, which the draft had written as "37 = 32 + 4 + 1 = 0010 0101", leaving the
reader to guess that the last number is binary. The module number in the closing link comes
from the lesson's data, not the draft. The two section headings were a second, smaller brief,
after the first look at the page showed a wall of text.

## The checks

Unit tests hold the route, the answers and the working against the model, what counts as a right
binary answer, and that an edit clears the marks. A browser test walks from the front page
through the self-check to the first lesson at desktop and phone widths. The look test now holds
the front page and this page to the same rules as the lessons.
