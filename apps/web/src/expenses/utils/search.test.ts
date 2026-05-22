import { describe, expect, it } from "vitest";

import { parseSearchQuery } from "./search";

describe("parseSearchQuery", () => {
  it("returns empty array for undefined", () => {
    expect(parseSearchQuery(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseSearchQuery("")).toEqual([]);
  });

  it("returns empty array for 1-char query", () => {
    expect(parseSearchQuery("a")).toEqual([]);
  });

  it("returns empty array for 2-char query", () => {
    expect(parseSearchQuery("ab")).toEqual([]);
  });

  it("returns word for exactly 3-char query", () => {
    expect(parseSearchQuery("abc")).toEqual(["abc"]);
  });

  it("splits multi-word query", () => {
    expect(parseSearchQuery("zakupy spożywcze")).toEqual(["zakupy", "spożywcze"]);
  });

  it("trims leading and trailing whitespace before splitting", () => {
    expect(parseSearchQuery("  zakupy  ")).toEqual(["zakupy"]);
  });

  it("collapses multiple spaces between words", () => {
    expect(parseSearchQuery("zakupy  spożywcze")).toEqual(["zakupy", "spożywcze"]);
  });

  it("returns empty array for whitespace-only string shorter than 3 chars", () => {
    expect(parseSearchQuery("  ")).toEqual([]);
  });

  it("returns empty array for whitespace-only string of length >= 3", () => {
    expect(parseSearchQuery("   ")).toEqual([]);
  });

  it("handles leading whitespace padding a short word to length >= 3", () => {
    // "  a" has length 3 — passes the gate, trims to "a", returns ["a"]
    expect(parseSearchQuery("  a")).toEqual(["a"]);
  });

  it("splits three-word query into three tokens", () => {
    expect(parseSearchQuery("obiad w pracy")).toEqual(["obiad", "w", "pracy"]);
  });
});
