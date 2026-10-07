details.report: The display must show how many readings are warmer than the limit, ALARM must be on when that is not 0, and the words at 400 and 408 must hold the lowest and highest readings.

details.report-report: R1 must hold how many readings are warmer than the limit in R3, the words at 400 and 408 must hold the lowest and highest readings, 3 calls must return, R10 to R14 must be as they were, and the return must go through R15.

answers.details.storeCalls: {actual} is not it; warmRooms is called once for the hall, then once for what lies behind each door of every room it finds, a room or nothing.

answers.details.storeWords: {actual} is not it; a call that finds a room pushes 4 words, and the words of every call not yet returned are on the stack together.

answers.details.storeR14: {actual} is not it; R14 starts at 7C0, and each word pushed takes 8 off it; give the address as three hexadecimal digits.

answers.details.edgeLog: On that log, the program and a right one show the same number, so that log cannot show the mistake.
