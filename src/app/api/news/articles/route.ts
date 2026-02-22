import { NextRequest, NextResponse } from "next/server";
import { searchArticles as searchFinlight } from "@/lib/finlight";
import { searchArticles as searchGNews } from "@/lib/gnews";
import type { NewsArticle, NewsProvider } from "@/lib/types/news";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language, limit, from, provider = "finlight" } = body as {
      query?: string;
      language?: string;
      limit?: number;
      from?: string;
      provider?: NewsProvider | "all";
    };

    if (!query) {
      return NextResponse.json(
        { error: "query パラメータが必要です" },
        { status: 400 },
      );
    }

    let articles: NewsArticle[] = [];

    if (provider === "finlight" || provider === "all") {
      try {
        const finlightArticles = await searchFinlight({ query, language, limit, from });
        articles = articles.concat(finlightArticles);
      } catch (err) {
        console.warn("Finlight fetch failed:", err instanceof Error ? err.message : err);
        if (provider === "finlight") throw err;
      }
    }

    if (provider === "gnews" || provider === "all") {
      try {
        const gnewsArticles = await searchGNews({
          query,
          language,
          country: language === "ja" ? "jp" : undefined,
          max: limit,
          from,
        });
        articles = articles.concat(gnewsArticles);
      } catch (err) {
        console.warn("GNews fetch failed:", err instanceof Error ? err.message : err);
        if (provider === "gnews") throw err;
      }
    }

    // provider=all の場合、日付降順でソート
    if (provider === "all") {
      articles.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    console.log(
      `News API: query="${query}" provider="${provider}" language="${language}" → ${articles.length} articles`,
    );
    return NextResponse.json(articles);
  } catch (error) {
    console.error("News fetch error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `ニュースの取得に失敗しました: ${detail}` },
      { status: 500 },
    );
  }
}
