question: Lesson 4 asked: can a function call itself? The shop's cold store is a hall with rooms behind it, some opening onto further rooms. The office wants to know how many rooms are warmer than -180, counting every room reachable from the hall. A loop walks one list from start to end. Here each room can lead two ways, and the path back from a room must be kept until both its doors have been explored.

roomsLead: The figure shows the rooms as the program keeps them: three words per room. The first word is the reading. The second and third words hold the addresses of the rooms behind the room's two doors, or 0 where a door leads nowhere. Find the hall at `0A0`: its doors hold `0B8`, the prep room, and `0D0`, the store.

motivation: The count for a room is: 1 if the room is warmer than the limit, plus the count for the room behind its first door, plus the count for the room behind its second door.

The count for a room behind a door is the same question again, for a different room. So the function `warmRooms` answers it by calling itself: it calls itself to count the rooms beyond the first door, then calls itself again for the second door.

A function that calls itself is a **recursion**.

A door that leads nowhere holds 0. `warmRooms` on 0 calls nothing and returns 0: this is the last case. Every way in ends at one, so the calls stop.

Each call that finds a room pushes 4 words: R15, and the three kept registers it uses for the room's address, the limit and its count. So each call keeps its own room while it follows the doors.

prediction: The figure lists the program, the function `warmRooms` and the rooms. Choose your answer for how many warm rooms there are, then press "Check my prediction". The listing shows the program's words alongside the room data.

p1Question: In the run from the hall, how many times is `warmRooms` called?

p1Explain: `warmRooms` is called 13 times. It is called once for each of the 6 rooms. It is called once more for each door that leads nowhere: the 6 rooms have 12 doors, 5 of which lead to a room, so 7 lead nowhere. That is 6 and 7, which make 13. When `warmRooms` is called with 0, it calls nothing and returns 0: this is the last case. The next figure runs the program, so you can count the calls as the run pauses.
