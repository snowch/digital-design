// Titles, objectives, captions and labels of the lesson on signals and bits, drafted by the
// prose process from a brief of facts (see CLAUDE.md) and checked against the lesson's structure.

export const LABELS = {
  title: "How does the display know the temperature?",
  objectives: [
    "Choose a threshold for a noisy signal and explain why the gap between the threshold and the nearest sample on each side matters.",
    "Read a row of bits as a binary number by adding place values.",
    "Read the same 16 bits as unsigned, signed and hexadecimal.",
    "Explain why a pattern of bits has no meaning until you choose how to read it.",
  ],
  titles: {
    question: "The sensor and the display",
    motivation: "Two levels survive noise",
    prediction: "Which threshold?",
    investigation: "Moving the threshold",
    construction: "From signals to numbers",
    failureExperiment: "The noise limit",
    explanation: "A different rule",
    generalisation: "Four ways",
    challenge: "The freezer temperature",
    reflection: "What does it mean?",
  },
  challengeTitles: {
    c1: "Choose your threshold",
    c2: "Set the freezer temperature",
  },
  captions: {
    predictThreshold: "Compare two thresholds on the same signal.",
    exploreSignal: "Choose a recording and move the threshold.",
    setThreshold: "Type your threshold and run the tests.",
    buildNumber: "Change bits and watch the number.",
    breakSignal: "Increase the noise and watch the valid thresholds shrink.",
    signedWord: "Change the bits and read them two ways.",
    manyReadings: "Pick a word and pick how to read it.",
    predictTop: "Predict the signed reading when only the top bit is 1.",
    freezerWord: "Set the bits and run the tests.",
  },
  options: {
    p1High: "2.40 V causes fewer to come out wrong",
    p1Middle: "1.40 V causes fewer to come out wrong",
    p1Same: "both cause the same number to come out wrong",
    p2Positive: "32768",
    p2Negative: "-32768",
    p2Zero: "0",
  },
  recordings: {
    quiet: "Compressor off",
    compressor: "Compressor on",
  },
  words: {
    sensor: "The cold room's word",
    warm: "1.8 degrees",
    allOnes: "All ones",
  },
  fields: {
    threshold: "Threshold",
    bits: "The 16 bits the sensor sends for the freezer",
    unsigned: "Unsigned",
    hex: "Hexadecimal",
  },
  cases: {
    quietRight: "Compressor off, samples correct",
    compressorRight: "Compressor on, samples correct",
    quietMargin: "Compressor off, at least 0.30 V on both sides",
    compressorMargin: "Compressor on, at least 0.30 V on both sides",
    bitsSigned: "Signed reading is -250",
    unsignedRight: "Your unsigned answer matches your bits",
    hexRight: "Your hexadecimal answer matches your bits",
  },
} as const;
