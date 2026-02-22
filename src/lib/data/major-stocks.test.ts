import { describe, it, expect } from "vitest";
import { MAJOR_TSE_SYMBOLS } from "./major-stocks";

describe("MAJOR_TSE_SYMBOLS", () => {
  it("すべてのシンボルが .T サフィックスを持つ", () => {
    for (const symbol of MAJOR_TSE_SYMBOLS) {
      expect(symbol).toMatch(/\.T$/);
    }
  });

  it("重複するシンボルがない", () => {
    expect(new Set(MAJOR_TSE_SYMBOLS).size).toBe(MAJOR_TSE_SYMBOLS.length);
  });

  it("50銘柄が含まれる", () => {
    expect(MAJOR_TSE_SYMBOLS.length).toBe(50);
  });

  it("API上限の100件以下である", () => {
    expect(MAJOR_TSE_SYMBOLS.length).toBeLessThanOrEqual(100);
  });
});
