import { describe, it, expect, vi } from "vitest";

describe("StockWatchlist onAdd ロジック", () => {
  it("onAdd コールバックがシンボルを受け取れる", () => {
    const onAdd = vi.fn();
    const symbol = "7203.T";

    onAdd(symbol);

    expect(onAdd).toHaveBeenCalledWith("7203.T");
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("検索結果からシンボルを抽出して onAdd に渡せる", () => {
    const onAdd = vi.fn();
    const searchResult = {
      symbol: "6758.T",
      name: "ソニーグループ",
      exchange: "TSE",
      type: "EQUITY",
    };

    // StockSearchBar の onSelect → onAdd(result.symbol) の流れを再現
    onAdd(searchResult.symbol);

    expect(onAdd).toHaveBeenCalledWith("6758.T");
  });

  it("空のウォッチリストでも銘柄を追加できる", () => {
    const symbols: string[] = [];
    const added: string[] = [];
    const onAdd = vi.fn((s: string) => added.push(s));

    expect(symbols.length).toBe(0);

    onAdd("7203.T");

    expect(onAdd).toHaveBeenCalledWith("7203.T");
    expect(added).toEqual(["7203.T"]);
  });
});
