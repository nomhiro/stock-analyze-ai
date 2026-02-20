import { describe, it, expect } from "vitest";
import { stockMaster, masterSymbols } from "./stock-master";

describe("stockMaster", () => {
  it("すべてのシンボルが .T サフィックスを持つ", () => {
    for (const entry of stockMaster) {
      expect(entry.symbol).toMatch(/\.T$/);
    }
  });

  it("重複するシンボルがない", () => {
    const symbols = stockMaster.map((e) => e.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("すべてのエントリーに name と sector がある", () => {
    for (const entry of stockMaster) {
      expect(entry.name).toBeTruthy();
      expect(entry.sector).toBeTruthy();
    }
  });

  it("masterSymbols が stockMaster と同じ長さ", () => {
    expect(masterSymbols.length).toBe(stockMaster.length);
  });

  it("エネルギー・建設・AI関連のセクターが含まれる", () => {
    const sectors = new Set(stockMaster.map((e) => e.sector));
    expect(sectors.has("エネルギー")).toBe(true);
    expect(sectors.has("建設")).toBe(true);
    expect(sectors.has("AI関連")).toBe(true);
  });
});
