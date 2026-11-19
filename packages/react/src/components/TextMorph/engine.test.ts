import { describe, expect, it } from "vitest";
import { segment, segmentFallback, matchByLcs, matchByPlaceValue, looksNumeric } from "./engine";

describe("segment", () => {
  it("splits words, keeping whitespace as its own token", () => {
    expect(segment("Write report", "word")).toEqual(["Write", " ", "report"]);
  });

  it("splits grapheme clusters, including a real emoji as one token", () => {
    const result = segment("Hi👍", "grapheme");
    expect(result).toEqual(["H", "i", "👍"]);
  });

  it("keeps Romanian diacritics as single precomposed graphemes", () => {
    expect(segment("Bună", "grapheme")).toEqual(["B", "u", "n", "ă"]);
  });
});

describe("segmentFallback", () => {
  it("still handles astral/surrogate-pair characters as one token each", () => {
    expect(segmentFallback("Hi👍", "grapheme")).toEqual(["H", "i", "👍"]);
  });

  it("splits words and keeps whitespace tokens", () => {
    expect(segmentFallback("cat and dog", "word")).toEqual(["cat", " ", "and", " ", "dog"]);
  });
});

describe("looksNumeric", () => {
  it("accepts currency, percentages and thousands separators", () => {
    expect(looksNumeric("$98,204")).toBe(true);
    expect(looksNumeric("18.7%")).toBe(true);
    expect(looksNumeric("-12.5")).toBe(true);
  });

  it("rejects ordinary text and version-like strings with letters", () => {
    expect(looksNumeric("Write report")).toBe(false);
    expect(looksNumeric("v1.2.3-beta")).toBe(false);
  });
});

describe("matchByLcs", () => {
  it("marks every token persistent when nothing changed", () => {
    const result = matchByLcs(["cat", " ", "and", " ", "dog"], ["cat", " ", "and", " ", "dog"]);
    expect(result.every((t) => t.kind === "persistent")).toBe(true);
  });

  it("keeps the unmoved middle token persistent in a full two-word swap", () => {
    const result = matchByLcs(["cat", " ", "and", " ", "dog"], ["dog", " ", "and", " ", "cat"]);
    const persistentTexts = result.filter((t) => t.kind === "persistent").map((t) => t.text);
    // "and" and its surrounding spaces never moved relative to each
    // other, so LCS keeps all three persistent. A full swap of the
    // *first and last* tokens, though, is a known, honest limitation
    // of plain LCS diffing (shared with Git diffs, Myers diff, and
    // React's own key-based list reconciliation): LCS can only express
    // insert/delete, never "move", so when two tokens trade places
    // with nothing in between to anchor a direction, both genuinely
    // exit and re-enter rather than animating a swap — see the
    // `matchByLcs` doc comment.
    expect(persistentTexts).toEqual([" ", "and", " "]);
    expect(result.filter((t) => t.kind === "exiting").map((t) => t.text)).toEqual(["cat", "dog"]);
    expect(result.filter((t) => t.kind === "entering").map((t) => t.text)).toEqual(["dog", "cat"]);
  });

  it("keeps duplicate tokens as distinct, independently tracked instances", () => {
    const result = matchByLcs(["cat", " ", "and", " ", "cat"], ["cat", " ", "and", " ", "cat", "!"]);
    const persistent = result.filter((t) => t.kind === "persistent");
    expect(persistent).toHaveLength(5);
    // Both "cat" instances matched to *different* prior occurrences,
    // not both collapsed onto the first "cat".
    const catMatches = persistent.filter((t) => t.text === "cat");
    const prevIndices = catMatches.map((t) => (t.kind === "persistent" ? t.prevIndex : -1));
    expect(new Set(prevIndices).size).toBe(2);
  });

  it("handles insertions and deletions", () => {
    const result = matchByLcs(["Write", " ", "report"], ["Review", " ", "report"]);
    expect(result.some((t) => t.kind === "exiting" && t.text === "Write")).toBe(true);
    expect(result.some((t) => t.kind === "entering" && t.text === "Review")).toBe(true);
    expect(result.some((t) => t.kind === "persistent" && t.text === " ")).toBe(true);
    expect(result.some((t) => t.kind === "persistent" && t.text === "report")).toBe(true);
  });

  it("handles empty-to-text and text-to-empty", () => {
    const toEmpty = matchByLcs(["hi"], []);
    expect(toEmpty.every((t) => t.kind === "exiting")).toBe(true);
    const fromEmpty = matchByLcs([], ["hi"]);
    expect(fromEmpty.every((t) => t.kind === "entering")).toBe(true);
  });
});

describe("matchByPlaceValue", () => {
  it("keeps unchanged low-order digits persistent, e.g. 1204 -> 1318 shares no digit by position but matches by value where it genuinely repeats", () => {
    const result = matchByPlaceValue("99", "100");
    // 99 -> 100: ones place 9->0 changes, tens place 9->0 changes, a
    // new hundreds-place "1" enters — nothing is wrongly treated as
    // "the whole number replaced".
    const entering = result.filter((t) => t.kind === "entering").map((t) => t.text);
    expect(entering).toContain("1");
  });

  it("preserves an unchanged currency symbol and thousands separator", () => {
    const result = matchByPlaceValue("$98,204", "$99,204");
    const persistentTexts = result.filter((t) => t.kind === "persistent").map((t) => t.text);
    expect(persistentTexts).toContain("$");
    expect(persistentTexts).toContain(",");
    expect(persistentTexts.filter((t) => t === "2" || t === "0" || t === "4")).toHaveLength(3);
  });

  it("only changes the ones digit when going from 0 to 1000 at the low end, and enters new high-order digits", () => {
    const result = matchByPlaceValue("0", "1000");
    const entering = result.filter((t) => t.kind === "entering").map((t) => t.text);
    expect(entering).toEqual(["1", "0", "0"]);
  });

  it("handles negative-to-positive decimal transitions", () => {
    const result = matchByPlaceValue("-12.5", "18.7");
    expect(result.some((t) => t.kind === "exiting" && t.text === "-")).toBe(true);
    expect(result.some((t) => t.kind === "persistent" && t.text === ".")).toBe(true);
  });

  it("keeps reading order left-to-right in its output", () => {
    const result = matchByPlaceValue("200", "200");
    const text = result.map((t) => t.text).join("");
    expect(text).toBe("200");
  });
});
