import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { searchArticles, getTopHeadlines } from "./gnews";

function mockGNewsResponse(articles: unknown[] = []) {
  return {
    ok: true,
    json: async () => ({ totalArticles: articles.length, articles }),
  };
}

const sampleGNewsArticle = {
  title: "半導体市場が好調",
  description: "AI需要が半導体市場を牽引している",
  content: "詳細な記事内容...",
  url: "https://example.com/article/1",
  image: "https://example.com/image.jpg",
  publishedAt: "2026-02-21T09:00:00Z",
  source: {
    name: "日経新聞",
    url: "https://nikkei.com",
  },
};

describe("gnews searchArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GNEWS_API_KEY", "test-api-key");
  });

  it("GNEWS_API_KEY 未設定でエラーを投げる", async () => {
    vi.stubEnv("GNEWS_API_KEY", "");
    await expect(searchArticles({ query: "test" })).rejects.toThrow(
      "GNEWS_API_KEY is not configured",
    );
  });

  it("検索パラメータを正しく URL に組み立てる", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([]));

    await searchArticles({
      query: "半導体",
      language: "ja",
      country: "jp",
      max: 10,
      from: "2026-02-01",
      sortby: "publishedAt",
    });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe("/api/v4/search");
    expect(calledUrl.searchParams.get("q")).toBe("半導体");
    expect(calledUrl.searchParams.get("apikey")).toBe("test-api-key");
    expect(calledUrl.searchParams.get("lang")).toBe("ja");
    expect(calledUrl.searchParams.get("country")).toBe("jp");
    expect(calledUrl.searchParams.get("max")).toBe("10");
    expect(calledUrl.searchParams.get("from")).toBe("2026-02-01");
    expect(calledUrl.searchParams.get("sortby")).toBe("publishedAt");
  });

  it("GNews レスポンスを NewsArticle に変換する", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([sampleGNewsArticle]));

    const articles = await searchArticles({ query: "半導体" });

    expect(articles).toHaveLength(1);
    expect(articles[0]).toEqual({
      title: "半導体市場が好調",
      summary: "AI需要が半導体市場を牽引している",
      source: "日経新聞",
      url: "https://example.com/article/1",
      publishedAt: "2026-02-21T09:00:00Z",
      provider: "gnews",
    });
  });

  it("API エラーで例外を投げる", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: async () => "Rate limit exceeded",
    });

    await expect(searchArticles({ query: "test" })).rejects.toThrow(
      "GNews API error: 403 Forbidden - Rate limit exceeded",
    );
  });

  it("空のレスポンスで空配列を返す", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([]));

    const articles = await searchArticles({ query: "test" });
    expect(articles).toEqual([]);
  });

  it("オプションパラメータなしでも動作する", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([]));

    await searchArticles({ query: "test" });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("q")).toBe("test");
    expect(calledUrl.searchParams.get("lang")).toBeNull();
    expect(calledUrl.searchParams.get("country")).toBeNull();
  });
});

describe("gnews getTopHeadlines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GNEWS_API_KEY", "test-api-key");
  });

  it("カテゴリとパラメータを正しく URL に組み立てる", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([]));

    await getTopHeadlines({
      category: "business",
      language: "ja",
      country: "jp",
      max: 10,
    });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe("/api/v4/top-headlines");
    expect(calledUrl.searchParams.get("category")).toBe("business");
    expect(calledUrl.searchParams.get("lang")).toBe("ja");
    expect(calledUrl.searchParams.get("country")).toBe("jp");
    expect(calledUrl.searchParams.get("max")).toBe("10");
  });

  it("パラメータなしでも動作する", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([]));

    await getTopHeadlines();

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe("/api/v4/top-headlines");
    expect(calledUrl.searchParams.get("apikey")).toBe("test-api-key");
  });

  it("GNews レスポンスを NewsArticle に変換する", async () => {
    mockFetch.mockResolvedValue(mockGNewsResponse([sampleGNewsArticle]));

    const articles = await getTopHeadlines({ category: "business" });

    expect(articles).toHaveLength(1);
    expect(articles[0].provider).toBe("gnews");
    expect(articles[0].title).toBe("半導体市場が好調");
  });

  it("GNEWS_API_KEY 未設定でエラーを投げる", async () => {
    vi.stubEnv("GNEWS_API_KEY", "");
    await expect(getTopHeadlines()).rejects.toThrow(
      "GNEWS_API_KEY is not configured",
    );
  });
});
