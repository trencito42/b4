import { describe, it, expect } from "vitest";
import {
  tokenizeText,
  diffTokens,
  segmentGraphemes,
  segmentWords,
  segmentNumeric,
  isNumericString,
} from "./engine.js";

describe("TextMorph Engine", () => {
  describe("segmentGraphemes", () => {
    it("preserves compound emoji as single graphemes", () => {
      // Family emoji with zero-width joiners
      const family = "👨‍👩‍👧‍👦";
      const segs = segmentGraphemes(family);
      expect(segs).toHaveLength(1);
      expect(segs[0]).toBe(family);
    });

    it("preserves skin tone modifiers as single graphemes", () => {
      const thumbsUp = "👍🏽";
      const segs = segmentGraphemes(thumbsUp);
      expect(segs).toHaveLength(1);
      expect(segs[0]).toBe(thumbsUp);
    });

    it("preserves Romanian diacritics and accented characters", () => {
      const text = "Bună dimineața și mulțumesc";
      const segs = segmentGraphemes(text);
      expect(segs.join("")).toBe(text);
      expect(segs.includes("ă")).toBe(true);
      expect(segs.includes("ț")).toBe(true);
      expect(segs.includes("ș")).toBe(true);
    });
  });

  describe("segmentWords", () => {
    it("distinguishes words, spaces, and punctuation", () => {
      const words = segmentWords("Save changes, now!");
      expect(words).toEqual([
        { text: "Save", type: "word" },
        { text: " ", type: "whitespace" },
        { text: "changes", type: "word" },
        { text: ",", type: "punctuation" },
        { text: " ", type: "whitespace" },
        { text: "now", type: "word" },
        { text: "!", type: "punctuation" },
      ]);
    });
  });

  describe("segmentNumeric & place values", () => {
    it("identifies numeric strings correctly", () => {
      expect(isNumericString("1204")).toBe(true);
      expect(isNumericString("$99.95")).toBe(true);
      expect(isNumericString("-12.5%")).toBe(true);
      expect(isNumericString("45 MB/s")).toBe(true);
      expect(isNumericString("Server deployed")).toBe(false);
    });

    it("assigns right-to-left place values to integer digits", () => {
      const tokens = segmentNumeric("1204");
      const digits = tokens.filter((t) => t.type === "digit");
      expect(digits).toHaveLength(4);
      // '1' is thousands (place 3), '2' is hundreds (place 2), '0' is tens (place 1), '4' is units (place 0)
      expect(digits[0]!.text).toBe("1");
      expect(digits[0]!.numericPlace).toBe(3);
      expect(digits[1]!.text).toBe("2");
      expect(digits[1]!.numericPlace).toBe(2);
      expect(digits[2]!.text).toBe("0");
      expect(digits[2]!.numericPlace).toBe(1);
      expect(digits[3]!.text).toBe("4");
      expect(digits[3]!.numericPlace).toBe(0);
    });

    it("assigns negative place values to fraction digits", () => {
      const tokens = segmentNumeric("$99.50");
      const prefix = tokens.find((t) => t.type === "symbol");
      expect(prefix?.text).toBe("$");

      const digits = tokens.filter((t) => t.type === "digit");
      expect(digits).toHaveLength(4);
      // 9, 9 are places 1, 0
      expect(digits[0]!.numericPlace).toBe(1);
      expect(digits[1]!.numericPlace).toBe(0);
      // 5, 0 are places -1, -2
      expect(digits[2]!.numericPlace).toBe(-1);
      expect(digits[3]!.numericPlace).toBe(-2);
    });
  });

  describe("diffTokens", () => {
    it("matches identical words and identifies entering/exiting", () => {
      const oldTokens = tokenizeText("Write report", "words");
      const newTokens = tokenizeText("Review report", "words");
      const diff = diffTokens(oldTokens, newTokens);

      // "report" and " " should match
      const matchedNew = diff.newTokens.filter((t) => diff.matches.has(t.id));
      expect(matchedNew.map((t) => t.text)).toEqual([" ", "report"]);

      // "Write" is exiting
      expect(diff.exitingTokens.map((t) => t.text)).toEqual(["Write"]);

      // "Review" is entering
      const entering = diff.newTokens.filter((t) => !diff.matches.has(t.id));
      expect(entering.map((t) => t.text)).toEqual(["Review"]);
    });

    it("supports word swapping with spatial continuity", () => {
      const oldTokens = tokenizeText("cat and dog", "words");
      const newTokens = tokenizeText("dog and cat", "words");
      const diff = diffTokens(oldTokens, newTokens);

      // Every token has a match
      expect(diff.exitingTokens).toHaveLength(0);
      expect(diff.matches.size).toBe(5);

      // "cat" in newTokens has the old "cat" id
      const oldCat = oldTokens.find((t) => t.text === "cat");
      const newCat = diff.newTokens.find((t) => t.text === "cat");
      expect(newCat?.id).toBe(oldCat?.id);

      // "dog" in newTokens has the old "dog" id
      const oldDog = oldTokens.find((t) => t.text === "dog");
      const newDog = diff.newTokens.find((t) => t.text === "dog");
      expect(newDog?.id).toBe(oldDog?.id);
    });

    it("matches repeated words by relative proximity rather than jumping", () => {
      const oldTokens = tokenizeText("the dog and the cat", "words");
      const newTokens = tokenizeText("the cat and the dog", "words");
      const diff = diffTokens(oldTokens, newTokens);

      const oldThe1 = oldTokens[0];
      const oldThe2 = oldTokens[6];

      const newThe1 = diff.newTokens[0];
      const newThe2 = diff.newTokens[6];

      // First "the" matches first "the", second matches second
      expect(newThe1?.id).toBe(oldThe1?.id);
      expect(newThe2?.id).toBe(oldThe2?.id);
    });

    it("digit-aware matching aligns place values for counters (99 -> 100)", () => {
      const oldTokens = tokenizeText("99", "numbers");
      const newTokens = tokenizeText("100", "numbers");
      const diff = diffTokens(oldTokens, newTokens);

      // In 99: places 1 (tens), 0 (units)
      // In 100: places 2 (hundreds), 1 (tens), 0 (units)
      // Units '0' matches units '9' in-place
      const oldUnits = oldTokens.find((t) => t.numericPlace === 0);
      const newUnits = diff.newTokens.find((t) => t.numericPlace === 0);
      expect(newUnits?.id).toBe(oldUnits?.id);

      // Tens '0' matches tens '9' in-place
      const oldTens = oldTokens.find((t) => t.numericPlace === 1);
      const newTens = diff.newTokens.find((t) => t.numericPlace === 1);
      expect(newTens?.id).toBe(oldTens?.id);

      // Hundreds '1' is entering
      const newHundreds = diff.newTokens.find((t) => t.numericPlace === 2);
      expect(diff.matches.has(newHundreds!.id)).toBe(false);
    });

    it("preserves stationary digits and currency symbols ($1204 -> $1318)", () => {
      const oldTokens = tokenizeText("$1204", "numbers");
      const newTokens = tokenizeText("$1318", "numbers");
      const diff = diffTokens(oldTokens, newTokens);

      const oldDollar = oldTokens.find((t) => t.text === "$");
      const newDollar = diff.newTokens.find((t) => t.text === "$");
      expect(newDollar?.id).toBe(oldDollar?.id);

      const oldThousands = oldTokens.find((t) => t.text === "1" && t.numericPlace === 3);
      const newThousands = diff.newTokens.find((t) => t.text === "1" && t.numericPlace === 3);
      expect(newThousands?.id).toBe(oldThousands?.id);
    });

    it("handles transition to and from empty text cleanly", () => {
      const emptyTokens = tokenizeText("", "words");
      const textTokens = tokenizeText("Hello", "words");

      const diffEnter = diffTokens(emptyTokens, textTokens);
      expect(diffEnter.exitingTokens).toHaveLength(0);
      expect(diffEnter.newTokens).toHaveLength(1);

      const diffExit = diffTokens(textTokens, emptyTokens);
      expect(diffExit.newTokens).toHaveLength(0);
      expect(diffExit.exitingTokens).toHaveLength(1);
      expect(diffExit.exitingTokens[0]?.text).toBe("Hello");
    });
  });
});
