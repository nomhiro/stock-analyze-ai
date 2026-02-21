import { describe, it, expect } from "vitest";
import { searchLocalStocks, containsNonAscii } from "./stock-search";

describe("containsNonAscii", () => {
  it("ASCII文字のみの場合 false を返す", () => {
    expect(containsNonAscii("7203")).toBe(false);
    expect(containsNonAscii("7203.T")).toBe(false);
    expect(containsNonAscii("toyota")).toBe(false);
  });

  it("日本語を含む場合 true を返す", () => {
    expect(containsNonAscii("トヨタ")).toBe(true);
    expect(containsNonAscii("自動車")).toBe(true);
  });
});

describe("searchLocalStocks", () => {
  it("空文字で空配列を返す", () => {
    expect(searchLocalStocks("")).toEqual([]);
    expect(searchLocalStocks("  ")).toEqual([]);
  });

  it("日本語の部分一致で銘柄を検索できる", () => {
    const results = searchLocalStocks("トヨタ");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.symbol === "7203.T")).toBe(true);
    expect(results.every((r) => r.name.includes("トヨタ"))).toBe(true);
  });

  it("シンボルの前方一致で検索できる", () => {
    const results = searchLocalStocks("7203");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].symbol).toBe("7203.T");
  });

  it("サフィックス付きシンボルでも検索できる", () => {
    const results = searchLocalStocks("7203.T");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].symbol).toBe("7203.T");
  });

  it("結果が最大10件に制限される", () => {
    // 広い検索で10件以上ヒットしうるクエリ
    const results = searchLocalStocks("1");
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("各結果が正しい形式を持つ", () => {
    const results = searchLocalStocks("トヨタ");
    for (const r of results) {
      expect(r).toHaveProperty("symbol");
      expect(r).toHaveProperty("name");
      expect(r.exchange).toBe("Tokyo");
      expect(r.type).toBe("EQUITY");
    }
  });

  it("存在しない銘柄で空配列を返す", () => {
    const results = searchLocalStocks("ZZZZZ存在しない");
    expect(results).toEqual([]);
  });
});
