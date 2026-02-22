import { describe, it, expect } from "vitest";
import type { StockQuote } from "@/lib/types/stock";
import { MARKET_INDICES } from "./useMarketOverview";

// useMarketOverview はクライアントフック（SWR を使用）のため、
// ここでは内部ロジック（データ変換と marketTime 優先取得）をテストする。

function makeQuote(overrides: Partial<StockQuote> & { symbol: string }): StockQuote {
  return {
    name: overrides.symbol,
    price: 0,
    change: 0,
    changePercent: 0,
    currency: "JPY",
    marketState: "REGULAR",
    exchange: "TSE",
    ...overrides,
  };
}

// toOverview と同等のロジックを再現してテスト
function toOverview(quotes: StockQuote[]) {
  const nameMap = new Map(MARKET_INDICES.map((i) => [i.symbol, i.name]));
  return MARKET_INDICES.map((idx) => {
    const q = quotes.find((quote) => quote.symbol === idx.symbol);
    return {
      symbol: idx.symbol,
      name: nameMap.get(idx.symbol) ?? idx.symbol,
      price: q?.price ?? 0,
      change: q?.change ?? 0,
      changePercent: q?.changePercent ?? 0,
    };
  });
}

function getMarketTime(quotes: StockQuote[]): string | undefined {
  return (
    quotes.find((q) => q.regularMarketTime && q.symbol === "^N225")
      ?.regularMarketTime ??
    quotes.find((q) => q.regularMarketTime)?.regularMarketTime
  );
}

describe("useMarketOverview ロジック", () => {
  const sampleQuotes: StockQuote[] = [
    makeQuote({ symbol: "^N225", price: 38000, change: 200, changePercent: 0.53, regularMarketTime: "2025-01-10T15:00:00Z" }),
    makeQuote({ symbol: "^TOPX", price: 2700, change: -10, changePercent: -0.37, regularMarketTime: "2025-01-10T15:00:00Z" }),
    makeQuote({ symbol: "^GSPC", price: 5900, change: 30, changePercent: 0.51, regularMarketTime: "2025-01-10T21:00:00Z" }),
    makeQuote({ symbol: "USDJPY=X", price: 157.5, change: 0.3, changePercent: 0.19, regularMarketTime: "2025-01-10T22:00:00Z" }),
  ];

  describe("toOverview", () => {
    it("4指標すべてが日本語名付きで返される", () => {
      const result = toOverview(sampleQuotes);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        symbol: "^N225",
        name: "日経225",
        price: 38000,
        change: 200,
        changePercent: 0.53,
      });
      expect(result[1].name).toBe("TOPIX");
      expect(result[2].name).toBe("S&P 500");
      expect(result[3].name).toBe("USD/JPY");
    });

    it("API から一部の銘柄が欠落した場合はデフォルト値で埋められる", () => {
      const partial = [sampleQuotes[0], sampleQuotes[2]];
      const result = toOverview(partial);
      expect(result).toHaveLength(4);
      expect(result[1]).toEqual({
        symbol: "^TOPX",
        name: "TOPIX",
        price: 0,
        change: 0,
        changePercent: 0,
      });
    });

    it("空の配列でも4指標がデフォルト値で返される", () => {
      const result = toOverview([]);
      expect(result).toHaveLength(4);
      result.forEach((item) => {
        expect(item.price).toBe(0);
        expect(item.change).toBe(0);
      });
    });
  });

  describe("marketTime 優先ロジック", () => {
    it("日経225 の時刻が優先される", () => {
      const time = getMarketTime(sampleQuotes);
      expect(time).toBe("2025-01-10T15:00:00Z");
    });

    it("日経225 に時刻がない場合は他の銘柄の時刻が返される", () => {
      const quotes = [
        makeQuote({ symbol: "^N225", price: 38000 }),
        makeQuote({ symbol: "^GSPC", price: 5900, regularMarketTime: "2025-01-10T21:00:00Z" }),
      ];
      const time = getMarketTime(quotes);
      expect(time).toBe("2025-01-10T21:00:00Z");
    });

    it("どの銘柄にも時刻がない場合は undefined", () => {
      const quotes = [
        makeQuote({ symbol: "^N225", price: 38000 }),
        makeQuote({ symbol: "^TOPX", price: 2700 }),
      ];
      const time = getMarketTime(quotes);
      expect(time).toBeUndefined();
    });
  });

  describe("MARKET_INDICES 定数", () => {
    it("4つの指標が定義されている", () => {
      expect(MARKET_INDICES).toHaveLength(4);
    });

    it("SWR キーに使う symbols パラメータが正しく構築される", () => {
      const key = `/api/stocks/quotes?symbols=${MARKET_INDICES.map((i) => i.symbol).join(",")}`;
      expect(key).toBe("/api/stocks/quotes?symbols=^N225,^TOPX,^GSPC,USDJPY=X");
    });
  });
});
