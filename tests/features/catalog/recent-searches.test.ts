// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  RECENT_SEARCHES_STORAGE_KEY,
  removeRecentSearch,
  writeRecentSearches,
} from "@/features/catalog/recent-searches";

describe("recent searches storage", () => {
  it("trims queries, avoids duplicates, and keeps most recent first", () => {
    const first = addRecentSearch([], "  Face Wash  ");
    const second = addRecentSearch(first, "rice");
    const third = addRecentSearch(second, "face   wash");

    expect(third).toEqual(["face wash", "rice"]);
  });

  it("enforces max item size", () => {
    const max = 3;
    const withA = addRecentSearch([], "a", max);
    const withB = addRecentSearch(withA, "b", max);
    const withC = addRecentSearch(withB, "c", max);
    const withD = addRecentSearch(withC, "d", max);

    expect(withD).toEqual(["d", "c", "b"]);
  });

  it("ignores empty queries", () => {
    const current = ["rice", "face wash"];

    expect(addRecentSearch(current, "   ")).toEqual(current);
  });

  it("removes one recent search item case-insensitively", () => {
    expect(removeRecentSearch(["Face Wash", "Rice"], "face wash")).toEqual(["Rice"]);
  });

  it("writes, reads, and clears from storage", () => {
    const storage = window.localStorage;

    writeRecentSearches(["Rice", "Face Wash", "rice"], storage);
    expect(readRecentSearches(storage)).toEqual(["Rice", "Face Wash"]);

    clearRecentSearches(storage);
    expect(storage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBeNull();
    expect(readRecentSearches(storage)).toEqual([]);
  });

  it("returns empty state when stored JSON is invalid", () => {
    const storage = window.localStorage;
    storage.setItem(RECENT_SEARCHES_STORAGE_KEY, "{invalid-json");

    expect(readRecentSearches(storage)).toEqual([]);
  });
});
