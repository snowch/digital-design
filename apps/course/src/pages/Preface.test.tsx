// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { bitsOf, bitsText, parseBits, unsignedOf } from "@dd/dd-model";
import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LESSONS } from "@dd/content";

import { lessonHref, parseRoute } from "../route";
import { STRINGS } from "../strings";
import { Preface } from "./Preface";
import { SELF_CHECK, verdictOf, workingOf, type CheckItem } from "./SelfCheck";

const book = createBook(LESSONS, INTERACTIVES);

/** The right answer to a question, from the model. */
const answerTo = (item: CheckItem) =>
  item.kind === "toDecimal"
    ? String(unsignedOf(parseBits(item.binary)))
    : bitsText(bitsOf(item.n, 8));

describe("the page before the first lesson", () => {
  it("has its own route, and ends at the first lesson", () => {
    expect(parseRoute("#/start")).toEqual({ kind: "preface" });
    render(<Preface book={book} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(STRINGS.preface.title);
    const first = book.lessons[0]!;
    expect(
      screen.getByRole("link", { name: STRINGS.preface.start(first.module, first.title) }),
    ).toHaveAttribute("href", lessonHref(first.id));
  });

  it("asks two conversions each way, with answers the model gives", () => {
    expect(SELF_CHECK.map((i) => i.kind)).toEqual([
      "toDecimal",
      "toBinary",
      "toDecimal",
      "toBinary",
    ]);
    expect(SELF_CHECK.map(answerTo)).toEqual(["178", "0010 0101", "77", "1100 1000"]);
    expect(workingOf(SELF_CHECK[0]!)).toBe(
      STRINGS.selfCheck.workingDecimal("1011 0010", "128 + 32 + 16 + 2", 178),
    );
    expect(workingOf(SELF_CHECK[1]!)).toBe(
      STRINGS.selfCheck.workingBinary(37, "32 + 4 + 1", "0010 0101"),
    );
  });

  it("accepts a binary answer with or without its leading 0s and spaces, and nothing else", () => {
    const item = SELF_CHECK[1]!;
    for (const a of ["0010 0101", "00100101", "100101", " 10 0101 "])
      expect(verdictOf(item, a), a).toBe("right");
    for (const a of ["100100", "37", "0010 0102", "1 0010 0101"])
      expect(verdictOf(item, a), a).toBe("wrong");
    expect(verdictOf(item, "  ")).toBe("blank");
    expect(verdictOf(SELF_CHECK[0]!, "178")).toBe("right");
    expect(verdictOf(SELF_CHECK[0]!, "178.5")).toBe("wrong");
  });

  it("marks each answer, shows the working under a wrong one, and clears the marks on an edit", async () => {
    const user = userEvent.setup();
    render(<Preface book={book} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
    await user.type(inputs[0]!, "178");
    await user.type(inputs[1]!, "100100");
    await user.type(inputs[3]!, "11001000");
    await user.click(screen.getByRole("button", { name: STRINGS.selfCheck.check }));
    expect(screen.getByRole("status")).toHaveTextContent(STRINGS.selfCheck.score(2, 4));
    expect(screen.getByText(workingOf(SELF_CHECK[1]!))).toBeInTheDocument();
    expect(screen.getByText(STRINGS.selfCheck.blank)).toBeInTheDocument();
    expect(screen.getAllByText(STRINGS.selfCheck.right)).toHaveLength(2);
    await user.type(inputs[2]!, "77");
    expect(screen.queryByText(STRINGS.selfCheck.blank)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
