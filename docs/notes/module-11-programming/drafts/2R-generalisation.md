generalisation: Every question about a list fits one pattern. Only the body changes: it can count, find or compare. Everything else stays the same.

One register walks the list by address, and another tracks when to stop. In this program, the count comes first in the log. A list could end with a marker word instead, and the test would look for that word.

The body can keep a value from one time round to the next in a register. One example is the reading before.

Readings are signed, so when you compare two readings you write `signed`. A count or an address is never below 0. Whether you read it as signed or unsigned, the result is the same.
