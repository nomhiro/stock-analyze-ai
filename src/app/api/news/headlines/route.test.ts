import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/gnews", () => ({
  getTopHeadlines: vi.fn(),
}));

import { GET } from "./route";
import { getTopHeadlines } from "@/lib/gnews";

const mockGetTopHeadlines = vi.mocked(getTopHeadlines);

function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost:3000/api/news/headlines");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /api/news/headlines", () => {
  beforeEach(() => vi.clearAllMocks());

  it("デフォルトパラメータで GNews top-headlines を呼ぶ", async () => {
    mockGetTopHeadlines.mockResolvedValue([]);

    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    expect(mockGetTopHeadlines).toHaveBeenCalledWith({
      category: "business",
      language: "ja",
      country: "jp",
      max: 10,
    });
  });

  it("カスタムパラメータを渡す", async () => {
    mockGetTopHeadlines.mockResolvedValue([]);

    await GET(createRequest({
      category: "technology",
      language: "en",
      country: "us",
      max: "5",
    }));

    expect(mockGetTopHeadlines).toHaveBeenCalledWith({
      category: "technology",
      language: "en",
      country: "us",
      max: 5,
    });
  });

  it("記事を JSON で返す", async () => {
    mockGetTopHeadlines.mockResolvedValue([
      { title: "テスト記事", summary: "", source: "テスト", url: "", publishedAt: "", provider: "gnews" },
    ]);

    const res = await GET(createRequest());
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("テスト記事");
  });

  it("API エラーで 500 を返す", async () => {
    mockGetTopHeadlines.mockRejectedValue(new Error("GNews API error"));

    const res = await GET(createRequest());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("ヘッドライン");
  });
});
