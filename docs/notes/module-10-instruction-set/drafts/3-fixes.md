construction: A branch at address P to address T encodes the distance as a constant: (T - P) / 4. This constant is written as three hexadecimal digits and read as signed. In the colder-room program, a branch at `008` to `010` encodes (`010` - `008`) / 4 = 2, written `002`. A branch back from `010` to `008` encodes -2, written `FFE`.

reflection: Twelve bits say every address, reach every branch target in the ROM, and hold the small numbers jobs use most. The swap gives all comparisons.

Kinds 0 and 9 to F say nothing. The decoder rejects any word with these kinds.

What does the machine do with a word it has no instruction for? What else does it choose to leave out? What would it cost to add each missing piece?
