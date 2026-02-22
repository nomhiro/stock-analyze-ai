import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/finlight", () => ({
  searchArticles: vi.fn(),
}));

vi.mock("@/lib/gnews", () => ({
  searchArticles: vi.fn(),
  getTopHeadlines: vi.fn(),
}));

import { POST } from "./route";
import { searchArticles as searchFinlight } from "@/lib/finlight";
import { searchArticles as searchGNews } from "@/lib/gnews";

const mockFinlight = vi.mocked(searchFinlight);
const mockGNews = vi.mocked(searchGNews);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/news/articles", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/news/articles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("query なしで 400 を返す", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("query");
  });

  it("デフォルト provider=finlight で Finlight のみ呼ぶ", async () => {
    mockFinlight.mockResolvedValue([
      { title: "テスト", summary: "", source: "テスト", url: "", publishedAt: "", provider: "finlight" },
    ]);

    const res = await POST(createRequest({ query: "半導体" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(mockFinlight).toHaveBeenCalledWith({
      query: "半導体",
      language: undefined,
      limit: undefined,
      from: undefined,
    });
    expect(mockGNews).not.toHaveBeenCalled();
  });

  it("provider=gnews で GNews のみ呼ぶ", async () => {
    mockGNews.mockResolvedValue([
      { title: "GNews記事", summary: "", source: "GNews", url: "", publishedAt: "", provider: "gnews" },
    ]);

    const res = await POST(createRequest({ query: "AI", provider: "gnews" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("GNews記事");
    expect(mockFinlight).not.toHaveBeenCalled();
    expect(mockGNews).toHaveBeenCalled();
  });

  it("provider=all で両方呼んで結合する", async () => {
    mockFinlight.mockResolvedValue([
      { title: "Finlight記事", summary: "", source: "F", url: "", publishedAt: "2026-02-20T00:00:00Z", provider: "finlight" },
    ]);
    mockGNews.mockResolvedValue([
      { title: "GNews記事", summary: "", source: "G", url: "", publishedAt: "2026-02-21T00:00:00Z", provider: "gnews" },
    ]);

    const res = await POST(createRequest({ query: "市場", provider: "all" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(2);
    // 日付降順: GNews (2/21) → Finlight (2/20)
    expect(data[0].title).toBe("GNews記事");
    expect(data[1].title).toBe("Finlight記事");
  });

  it("provider=all で片方エラーでも他方の結果を返す", async () => {
    mockFinlight.mockRejectedValue(new Error("Finlight down"));
    mockGNews.mockResolvedValue([
      { title: "GNews記事", summary: "", source: "G", url: "", publishedAt: "2026-02-21T00:00:00Z", provider: "gnews" },
    ]);

    const res = await POST(createRequest({ query: "テスト", provider: "all" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("GNews記事");
  });

  it("provider=gnews で GNews エラーなら 500 を返す", async () => {
    mockGNews.mockRejectedValue(new Error("API error"));

    const res = await POST(createRequest({ query: "テスト", provider: "gnews" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("失敗");
  });

  it("language=ja のとき GNews に country=jp を渡す", async () => {
    mockGNews.mockResolvedValue([]);

    await POST(createRequest({ query: "test", provider: "gnews", language: "ja" }));

    expect(mockGNews).toHaveBeenCalledWith(
      expect.objectContaining({ country: "jp" }),
    );
  });
});
