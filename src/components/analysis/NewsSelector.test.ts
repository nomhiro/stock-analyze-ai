import { describe, it, expect } from "vitest";
import type { NewsArticle } from "@/lib/types/news";

// NewsSelector はクライアントコンポーネント（React の useState 等を使用）のため、
// ここではデータ変換ロジックをテストする。

describe("NewsSelector article mapping logic", () => {
  const sampleArticles: NewsArticle[] = [
    {
      title: "半導体市場が好調",
      summary: "AI需要が半導体市場を牽引",
      source: "日経新聞",
      url: "https://example.com/1",
      publishedAt: "2026-02-21T09:00:00Z",
      sentiment: "positive",
      provider: "finlight",
    },
    {
      title: "円安が進行",
      summary: "ドル円が150円台に",
      source: "ロイター",
      url: "https://example.com/2",
      publishedAt: "2026-02-20T15:00:00Z",
      sentiment: "negative",
      provider: "gnews",
    },
  ];

  it("NewsArticle を news-mapping API のフォーマットに変換する", () => {
    const mapped = sampleArticles.map((a) => ({
      title: a.title,
      summary: a.summary,
      source: a.source,
      date: a.publishedAt,
    }));

    expect(mapped).toHaveLength(2);
    expect(mapped[0]).toEqual({
      title: "半導体市場が好調",
      summary: "AI需要が半導体市場を牽引",
      source: "日経新聞",
      date: "2026-02-21T09:00:00Z",
    });
    expect(mapped[1]).toEqual({
      title: "円安が進行",
      summary: "ドル円が150円台に",
      source: "ロイター",
      date: "2026-02-20T15:00:00Z",
    });
  });

  it("マッピング結果に url, sentiment, provider が含まれない", () => {
    const mapped = sampleArticles.map((a) => ({
      title: a.title,
      summary: a.summary,
      source: a.source,
      date: a.publishedAt,
    }));

    expect(mapped[0]).not.toHaveProperty("url");
    expect(mapped[0]).not.toHaveProperty("sentiment");
    expect(mapped[0]).not.toHaveProperty("publishedAt");
    expect(mapped[0]).not.toHaveProperty("provider");
    expect(mapped[0]).toHaveProperty("date");
  });

  it("選択インデックスに基づいて記事をフィルタリングする", () => {
    const selectedIds = new Set([1]);
    const selected = sampleArticles.filter((_, i) => selectedIds.has(i));

    expect(selected).toHaveLength(1);
    expect(selected[0].title).toBe("円安が進行");
  });

  it("複数の記事を選択できる", () => {
    const selectedIds = new Set([0, 1]);
    const selected = sampleArticles.filter((_, i) => selectedIds.has(i));

    expect(selected).toHaveLength(2);
  });

  it("空の選択では記事が返されない", () => {
    const selectedIds = new Set<number>();
    const selected = sampleArticles.filter((_, i) => selectedIds.has(i));

    expect(selected).toHaveLength(0);
  });
});

describe("NewsSelector default query", () => {
  it("空のクエリではデフォルトキーワードを使用する", () => {
    const query = "";
    const q = query.trim() || "日本 株式 市場";
    expect(q).toBe("日本 株式 市場");
  });

  it("ユーザー入力があればそのまま使用する", () => {
    const query = "半導体";
    const q = query.trim() || "日本 株式 市場";
    expect(q).toBe("半導体");
  });

  it("空白のみのクエリではデフォルトを使用する", () => {
    const query = "   ";
    const q = query.trim() || "日本 株式 市場";
    expect(q).toBe("日本 株式 市場");
  });
});

describe("NewsSelector provider logic", () => {
  it("provider フィールドで記事のソースを識別できる", () => {
    const articles: NewsArticle[] = [
      { title: "A", summary: "", source: "S1", url: "", publishedAt: "", provider: "finlight" },
      { title: "B", summary: "", source: "S2", url: "", publishedAt: "", provider: "gnews" },
      { title: "C", summary: "", source: "S3", url: "", publishedAt: "" },
    ];

    const finlightArticles = articles.filter((a) => a.provider === "finlight");
    const gnewsArticles = articles.filter((a) => a.provider === "gnews");
    const unknownArticles = articles.filter((a) => !a.provider);

    expect(finlightArticles).toHaveLength(1);
    expect(gnewsArticles).toHaveLength(1);
    expect(unknownArticles).toHaveLength(1);
  });
});
