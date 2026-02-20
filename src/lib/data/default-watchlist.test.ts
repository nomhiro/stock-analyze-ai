import { describe, it, expect } from "vitest";
import { DEFAULT_WATCHLIST_SYMBOLS } from "./default-watchlist";

describe("DEFAULT_WATCHLIST_SYMBOLS", () => {
  it("すべてのシンボルが .T サフィックスを持つ", () => {
    for (const symbol of DEFAULT_WATCHLIST_SYMBOLS) {
      expect(symbol).toMatch(/\.T$/);
    }
  });

  it("重複するシンボルがない", () => {
    expect(new Set(DEFAULT_WATCHLIST_SYMBOLS).size).toBe(
      DEFAULT_WATCHLIST_SYMBOLS.length,
    );
  });

  it("10銘柄が含まれる", () => {
    expect(DEFAULT_WATCHLIST_SYMBOLS.length).toBe(10);
  });
});
