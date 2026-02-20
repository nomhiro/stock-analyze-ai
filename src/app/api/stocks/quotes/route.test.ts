import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/yahoo-finance", () => ({
  getQuotes: vi.fn(),
}));

vi.mock("@/lib/data/stock-master", () => ({
  masterSymbols: ["7203.T", "6758.T"],
}));

import { GET } from "./route";
import { getQuotes } from "@/lib/yahoo-finance";
import { NextRequest } from "next/server";

const mockGetQuotes = vi.mocked(getQuotes);

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

const sampleQuotes = [
  {
    symbol: "7203.T",
    name: "トヨタ自動車",
    price: 2500,
    change: 50,
    changePercent: 2.04,
    currency: "JPY",
    marketState: "REGULAR",
    exchange: "Tokyo",
  },
  {
    symbol: "6758.T",
    name: "ソニーグループ",
    price: 3000,
    change: -45,
    changePercent: -1.5,
    currency: "JPY",
    marketState: "REGULAR",
    exchange: "Tokyo",
  },
];

describe("GET /api/stocks/quotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("パラメータなしでマスター全銘柄を返す", async () => {
    mockGetQuotes.mockResolvedValue(sampleQuotes);

    const res = await GET(createRequest("/api/stocks/quotes"));
    const data = await res.json();

    expect(mockGetQuotes).toHaveBeenCalledWith(["7203.T", "6758.T"]);
    expect(data).toHaveLength(2);
  });

  it("symbols パラメータで指定銘柄のみ返す", async () => {
    mockGetQuotes.mockResolvedValue([sampleQuotes[0]]);

    const res = await GET(
      createRequest("/api/stocks/quotes?symbols=7203.T"),
    );
    const data = await res.json();

    expect(mockGetQuotes).toHaveBeenCalledWith(["7203.T"]);
    expect(data).toHaveLength(1);
  });

  it("100件超の symbols で 400 を返す", async () => {
    const symbols = Array.from({ length: 101 }, (_, i) => `${i}.T`).join(",");
    const res = await GET(
      createRequest(`/api/stocks/quotes?symbols=${symbols}`),
    );

    expect(res.status).toBe(400);
  });
});
