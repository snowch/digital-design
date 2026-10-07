investigation: The figure runs the program with a breakpoint on `warmRooms`'s first line. The watch shows R1, R11 and R14, and the stack shows the words each call has pushed.

framesLead: 1. Press "Run to a breakpoint" again and again. Each pause is a new call of `warmRooms`, with the room's address in R1, or 0 for a door that leads nowhere.
2. Watch the stack grow by 4 words each time a call finds a room, and shrink as calls return.
3. Compare R14 at each pause with how many rooms deep the call is.

framesAfter: 1. `warmRooms` was called 13 times: the hall, the prep room, the store, `chillA`, `deep` and `chillB`, and 7 doors that lead nowhere.
2. The display shows 3: the hall, the prep room and the deep freeze are warmer than -180.
3. The stack was deepest, 16 words with R14 at `740`, in the calls for the deep freeze's doors: the hall, the store, `chillA` and `deep` each had 4 words on it.
4. 223 instructions ran.

depthLead: 1. The figure counts the words on the stack after each instruction of the whole run.
2. The stack rises and falls with the way in: it climbs as the calls go deeper, falls as they return, and climbs again for the next door.

construction: 1. How deep the stack goes depends on the longest way in, not on how many rooms there are.
2. The figure shows a second cold store, which the lesson does not run. Work out a run of `warmRooms` on it from the hall, with the limit -180, as the program in the lesson does.

longStoreLead: 1. The second store's rooms, three words each, as the program keeps them.
2. The hall is at `0A0` again. Follow the doors from there.

storeDepthLead: Work out each answer from the rooms, then run the tests.

c1Task: 1. For a run of `warmRooms` from the hall of the second store, work out:
   - how many times `warmRooms` is called;
   - the most words the stack holds;
   - what R14 holds when the stack holds the most words, in hexadecimal.
2. There are 3 tests, one for each answer.

c1Hints.1: The idea: count a call for every room and one for every door that leads nowhere. The stack holds 4 words for each room on the way in to the deepest call.

c1Hints.2: A common mistake: counting 4 words for a call on a door that leads nowhere. That call pushes nothing.

c1Hints.3: A smaller example: in the lesson's store, the longest way in has 4 rooms, so the stack holds 16 words, and R14 is `7C0` less 16 × 8 bytes, which is `740`.

c1Hints.4: Part of the answer: the second store has 7 rooms, and its longest way in is the hall, the lobby, `coolB`, `frost` and `blast`.

c1Hints.5: The whole answer: 15 calls, 20 words, and `720`.
