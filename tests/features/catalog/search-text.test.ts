/**
 * Unit tests for the storefront search-text helpers (tokenization, plural
 * widening, and substring matching) in
 * `src/features/catalog/lib/search-text.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  expandSearchQuery,
  expandSearchToken,
  tokenizeSearchQuery,
  tokenMatchesText,
} from "@/features/catalog/lib/search-text";

describe("tokenizeSearchQuery", () => {
  it("splits on whitespace and lowercases", () => {
    expect(tokenizeSearchQuery("Scented Candle")).toEqual(["scented", "candle"]);
  });

  it("splits on punctuation and trims stray separators", () => {
    expect(tokenizeSearchQuery("  chains!  ")).toEqual(["chains"]);
    expect(tokenizeSearchQuery("phone-stand")).toEqual(["phone", "stand"]);
  });

  it("drops tokens shorter than the minimum length", () => {
    expect(tokenizeSearchQuery("a b c")).toEqual([]);
    expect(tokenizeSearchQuery("candle 2 pack")).toEqual(["candle", "pack"]);
  });

  it("deduplicates repeated tokens", () => {
    expect(tokenizeSearchQuery("candle candle jar")).toEqual(["candle", "jar"]);
  });
});

describe("expandSearchToken", () => {
  it("keeps the base token for singular words", () => {
    expect(expandSearchToken("chain")).toEqual(["chain"]);
    expect(expandSearchToken("candle")).toEqual(["candle"]);
    expect(expandSearchToken("glass")).toEqual(["glass"]);
  });

  it("widens plain plurals by stripping a trailing s", () => {
    expect(expandSearchToken("chains")).toContain("chain");
    expect(expandSearchToken("tumblers")).toContain("tumbler");
  });

  it("widens -es plurals to both plausible singulars", () => {
    expect(expandSearchToken("candles")).toContain("candle");
    expect(expandSearchToken("boxes")).toContain("box");
    expect(expandSearchToken("dishes")).toContain("dish");
    expect(expandSearchToken("glasses")).toContain("glass");
  });

  it("widens -ies plurals to the -y form", () => {
    expect(expandSearchToken("candies")).toContain("candy");
    expect(expandSearchToken("parties")).toContain("party");
  });

  it("never mangles short words ending in s", () => {
    expect(expandSearchToken("bus")).toEqual(["bus"]);
    expect(expandSearchToken("gas")).toEqual(["gas"]);
  });

  it("does not strip double-s endings", () => {
    expect(expandSearchToken("class")).toEqual(["class"]);
  });
});

describe("expandSearchQuery", () => {
  it("flattens and deduplicates variants across all tokens", () => {
    const variants = expandSearchQuery("chains candle");

    expect(variants).toContain("chain");
    expect(variants).toContain("candle");
    expect(variants).toContain("chains");
  });

  it("returns an empty list for a query with no usable tokens", () => {
    expect(expandSearchQuery("!!")).toEqual([]);
    expect(expandSearchQuery("a")).toEqual([]);
  });
});

describe("tokenMatchesText", () => {
  it("matches singular queries against plural text", () => {
    expect(tokenMatchesText("chain", "Gold Chains")).toBe(true);
  });

  it("matches plural queries against singular text", () => {
    expect(tokenMatchesText("chains", "Gold Chain")).toBe(true);
    expect(tokenMatchesText("candles", "Candle Jar")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(tokenMatchesText("CANDLE", "Scented Candle")).toBe(true);
    expect(tokenMatchesText("candle", "SCENTED CANDLE")).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(tokenMatchesText("candles", "Birthday Balloons")).toBe(false);
  });

  it("returns false for null, undefined, and empty text", () => {
    expect(tokenMatchesText("candle", null)).toBe(false);
    expect(tokenMatchesText("candle", undefined)).toBe(false);
    expect(tokenMatchesText("candle", "")).toBe(false);
  });
});
