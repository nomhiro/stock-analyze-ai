import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQuote, mockChart, mockSearch } = vi.hoisted(() => ({
  mockQuote: vi.fn(),
  mockChart: vi.fn(),
  mockSearch: vi.fn(),
}));

vi.mock("yahoo-finance2", () => {
  return {
    default: class MockYahooFinance {
      quote = mockQuote;
      chart = mockChart;
      search = mockSearch;
    },
  };
});

import { getQuote, getQuotes } from "./yahoo-finance";

const sampleQuote = {
  symbol: "7203.T",
  shortName: "トヨタ自動車",
  regularMarketPrice: 2500,
  regularMarketChange: 50,
  regularMarketChangePercent: 2.04,
  currency: "JPY",
  marketState: "REGULAR",
  fullExchangeName: "Tokyo",
};

describe("getQuote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("単一銘柄のクォートを取得しマッピングする", async () => {
    mockQuote.mockResolvedValue(sampleQuote);

    const result = await getQuote("7203.T");

    expect(result.symbol).toBe("7203.T");
    expect(result.name).toBe("トヨタ自動車");
    expect(result.price).toBe(2500);
    expect(result.changePercent).toBe(2.04);
  });
});

describe("getQuotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空配列で呼ぶと空配列を返す", async () => {
    const result = await getQuotes([]);
    expect(result).toEqual([]);
  });

  it("複数銘柄のクォートを取得しマッピングする", async () => {
    mockQuote.mockResolvedValue([
      sampleQuote,
      {
        ...sampleQuote,
        symbol: "6758.T",
        shortName: "ソニーグループ",
        regularMarketPrice: 3000,
        regularMarketChangePercent: -1.5,
      },
    ]);

    const result = await getQuotes(["7203.T", "6758.T"]);

    expect(result).toHaveLength(2);
    expect(result[0].symbol).toBe("7203.T");
    expect(result[1].symbol).toBe("6758.T");
    expect(result[1].price).toBe(3000);
  });
});
