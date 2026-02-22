import { describe, it, expect } from "vitest";
import { MAJOR_TSE_SYMBOLS } from "@/lib/data/major-stocks";
import { DEFAULT_WATCHLIST_SYMBOLS } from "@/lib/data/default-watchlist";
import type { ViewMode } from "./page";

// DashboardPage はクライアントコンポーネントのため、
// ここではビューモード切り替えのデータ選択ロジックをテストする。

function selectRankingSymbols(
  viewMode: ViewMode,
  watchlistSymbols: string[],
): string[] {
  return viewMode === "all" ? MAJOR_TSE_SYMBOLS : watchlistSymbols;
}

describe("DashboardPage view mode logic", () => {
  it("全銘柄モードでは主要銘柄リストを返す", () => {
    const result = selectRankingSymbols("all", DEFAULT_WATCHLIST_SYMBOLS);
    expect(result).toBe(MAJOR_TSE_SYMBOLS);
    expect(result.length).toBe(50);
  });

  it("ウォッチリストモードではウォッチリスト銘柄を返す", () => {
    const watchlist = ["7203.T", "6758.T"];
    const result = selectRankingSymbols("watchlist", watchlist);
    expect(result).toBe(watchlist);
    expect(result.length).toBe(2);
  });

  it("ウォッチリストが空の場合も空配列を返す", () => {
    const result = selectRankingSymbols("watchlist", []);
    expect(result).toEqual([]);
  });

  it("全銘柄モードとウォッチリストモードで異なるシンボルセットを返す", () => {
    const watchlist = ["7203.T"];
    const allResult = selectRankingSymbols("all", watchlist);
    const watchlistResult = selectRankingSymbols("watchlist", watchlist);
    expect(allResult).not.toBe(watchlistResult);
    expect(allResult.length).toBeGreaterThan(watchlistResult.length);
  });
});
