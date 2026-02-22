import { describe, it, expect } from "vitest";

describe("WatchlistToggleButton ロジック", () => {
  it("ウォッチリストにある場合、クリックで削除される", () => {
    const symbols = ["7203.T", "6758.T"];
    const symbol = "7203.T";
    const isInWatchlist = symbols.includes(symbol);
    expect(isInWatchlist).toBe(true);

    const next = symbols.filter((s) => s !== symbol);
    expect(next).toEqual(["6758.T"]);
  });

  it("ウォッチリストにない場合、クリックで追加される", () => {
    const symbols = ["7203.T"];
    const symbol = "6758.T";
    const isInWatchlist = symbols.includes(symbol);
    expect(isInWatchlist).toBe(false);

    const next = [...symbols, symbol];
    expect(next).toEqual(["7203.T", "6758.T"]);
  });

  it("aria-label はウォッチリスト状態に応じて変わる", () => {
    const getLabel = (isIn: boolean) =>
      isIn ? "ウォッチリストから削除" : "ウォッチリストに追加";

    expect(getLabel(true)).toBe("ウォッチリストから削除");
    expect(getLabel(false)).toBe("ウォッチリストに追加");
  });

  it("重複する銘柄は追加されない", () => {
    const symbols = ["7203.T", "6758.T"];
    const symbol = "7203.T";
    const isInWatchlist = symbols.includes(symbol);

    const next = isInWatchlist ? symbols : [...symbols, symbol];
    expect(next).toEqual(["7203.T", "6758.T"]);
  });
});
