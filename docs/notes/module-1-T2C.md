# Brief T2C: naming two's complement in lesson 1.1

Read `docs/style.md` first; it applies. Return only the new paragraph, as `newParagraph: text`.

The author asked whether a reader should know two's complement before the course. They should
not: lesson 1.1 (`signals`) teaches the signed reading from scratch, and the course builds on it
in Module 3 (adding a negative correction, signed overflow) and Module 7 (minus B is NOT B plus
1). But the lessons never use the name the reader will meet everywhere else.

Lesson 1.1's figure note `signedWordAfter` ends its second paragraph with: "Neither rule is wrong
in itself: each gives the right number, by its own rule, from the same bits."

Facts for one short new paragraph, placed after the existing text:
- The signed reading this lesson describes, with the top bit's worth counted as negative, is the
  one computers use for whole numbers that can be negative.
- Books and programming languages call it **two's complement** (in bold, as this lesson writes
  every term it introduces).
- The course calls it the signed reading.

Must not: explain where the name comes from; add any other fact.

- `newParagraph`: two or three short sentences.

## The draft, as returned (6 October 2026)

newParagraph: The signed reading is what computers use for whole numbers that can be negative.
Books and programming languages call it **two's complement**. This course calls it the signed
reading.

Checked: the three facts kept, none added. The draft says "the signed reading" for "the signed
reading this lesson describes, with the top bit's worth counted as negative"; the paragraph above
it defines the reading, so nothing is lost. Placed after `signedWordAfter`'s second paragraph,
unchanged; "two's complement" added to the lesson's `introduces`.
