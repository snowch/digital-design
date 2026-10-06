// Copyright © 2026 Christopher Snow

// A wide word typed in a challenge's Try it, at both widths: fetch's PC checks take PC typed in
// hexadecimal or as a number, the circuit shows the word, and a value the field cannot take is
// refused with the word left as it was.

import { expect, test, type Locator } from "@playwright/test";

import { V, challenge, challengeData, format, lessonData, openLesson, writeText } from "./helpers";

/** The value the Try it table shows for a signal. */
function signal(tryIt: Locator, name: string): Locator {
  return tryIt
    .locator("table.signal-table tr")
    .filter({ has: tryIt.page().locator(`th:text-is("${name}")`) })
    .locator("td")
    .last();
}

test.describe("a wide word, typed in Try it", () => {
  test("PC typed in hexadecimal and as a number sets the word the checks read", async ({
    page,
  }) => {
    await openLesson(page, "fetch");
    const section = challenge(page, "checks-text");
    await writeText(section, challengeData("checks-text", lessonData("fetch")).reference.hdl!);
    const tryIt = section.locator("details.editor-try");
    await tryIt.locator(":scope > summary").click();
    const hex = tryIt.getByRole("textbox", { name: format(V.words.hexLabel, { name: "PC" }) });
    const number = tryIt.getByRole("textbox", {
      name: format(V.words.numberLabel, { name: "PC" }),
    });
    await expect(hex).toBeVisible();

    // Outside the ROM: CAUSEF 11.
    await hex.fill("7d8");
    await hex.press("Enter");
    await expect(signal(tryIt, "PC")).toHaveText("00000000000007D8");
    await expect(hex).toHaveValue("00000000000007D8");
    await expect(number).toHaveValue("2008");
    await expect(signal(tryIt, "CAUSEF")).toHaveText("11");

    // Not a multiple of 4, typed as a number: CAUSEF 12.
    await number.fill("2");
    await number.press("Enter");
    await expect(hex).toHaveValue("0000000000000002");
    await expect(signal(tryIt, "CAUSEF")).toHaveText("12");

    // A negative number is the signed reading of its word.
    await number.fill("-8");
    await tryIt.getByRole("button", { name: format(V.words.setLabel, { name: "PC" }) }).click();
    await expect(hex).toHaveValue("FFFFFFFFFFFFFFF8");
    await expect(signal(tryIt, "CAUSEF")).toHaveText("11");

    // What the field cannot take is refused, and the word keeps its value.
    await hex.fill("7G8");
    await hex.press("Enter");
    await expect(tryIt.locator(".word-problem")).toHaveText(format(V.words.notHex, { char: "G" }));
    await expect(hex).toHaveAttribute("aria-invalid", "true");
    await expect(signal(tryIt, "PC")).toHaveText("FFFFFFFFFFFFFFF8");
    await hex.press("Escape");
    await expect(hex).toHaveValue("FFFFFFFFFFFFFFF8");
    await expect(tryIt.locator(".word-problem")).toHaveText("");
  });

  test("the bits stay one press away, and a field is a control a phone can reach", async ({
    page,
  }) => {
    await openLesson(page, "fetch");
    const section = challenge(page, "checks-text");
    await writeText(section, challengeData("checks-text", lessonData("fetch")).reference.hdl!);
    const tryIt = section.locator("details.editor-try");
    await tryIt.locator(":scope > summary").click();
    const hex = tryIt.getByRole("textbox", { name: format(V.words.hexLabel, { name: "PC" }) });
    expect((await hex.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(40);
    const bits = tryIt.locator("details.word-bits");
    await bits.locator(":scope > summary").click();
    const row = bits.getByRole("group", { name: format(V.words.row, { name: "PC" }) });
    await row.getByRole("button").last().click();
    await expect(hex).toHaveValue("0000000000000001");
  });
});
