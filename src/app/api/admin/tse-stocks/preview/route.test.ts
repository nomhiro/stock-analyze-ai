import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/data/tse-stocks", () => ({
  TSE_STOCKS: [
    { symbol: "1301.T", name: "極洋" },
    { symbol: "7203.T", name: "トヨタ自動車" },
  ],
  TSE_STOCKS_METADATA: { generatedDate: "2026-02-20", total: 2 },
}));

vi.mock("@/lib/tse-stock-fetcher", () => ({
  downloadJpxExcel: vi.fn(),
  parseJpxExcel: vi.fn(),
  computeDiff: vi.fn(),
}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import { downloadJpxExcel, parseJpxExcel, computeDiff } from "@/lib/tse-stock-fetcher";

const mockDownload = vi.mocked(downloadJpxExcel);
const mockParse = vi.mocked(parseJpxExcel);
const mockDiff = vi.mocked(computeDiff);

function createRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }
  return new NextRequest(
    new URL("/api/admin/tse-stocks/preview", "http://localhost:3000"),
    { method: "POST", headers },
  );
}

describe("POST /api/admin/tse-stocks/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.stubEnv("ADMIN_API_KEY", "test-key");
  });

  it("認証なしで 401 を返す", async () => {
    const res = await POST(createRequest());
    expect(res.status).toBe(401);
  });

  it("正常にプレビュー差分を返す", async () => {
    const fakeBuffer = Buffer.from("fake");
    const fetchedStocks = [
      { symbol: "1301.T", name: "極洋" },
      { symbol: "7203.T", name: "トヨタ自動車" },
      { symbol: "9999.T", name: "新銘柄" },
    ];
    // 100件以上必要なので配列を拡張
    const manyStocks = Array.from({ length: 150 }, (_, i) => ({
      symbol: `${String(i + 1000).padStart(4, "0")}.T`,
      name: `銘柄${i}`,
    }));

    mockDownload.mockResolvedValue(fakeBuffer);
    mockParse.mockReturnValue(manyStocks);
    mockDiff.mockReturnValue({
      added: [{ symbol: "9999.T", name: "新銘柄" }],
      removed: [],
      totalBefore: 2,
      totalAfter: 150,
      unchanged: 2,
    });

    const res = await POST(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.diff.added).toHaveLength(1);
    expect(data.fetchedAt).toBeDefined();
  });

  it("取得銘柄数が少ない場合に 500 を返す", async () => {
    mockDownload.mockResolvedValue(Buffer.from("fake"));
    mockParse.mockReturnValue([{ symbol: "1301.T", name: "極洋" }]);

    const res = await POST(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("少なすぎます");
  });

  it("JPXダウンロード失敗で 500 を返す", async () => {
    mockDownload.mockRejectedValue(new Error("Network error"));

    const res = await POST(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("取得に失敗");
  });
});
