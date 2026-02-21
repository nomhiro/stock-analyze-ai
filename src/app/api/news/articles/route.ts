import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/finlight";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language, limit, from } = body;

    if (!query) {
      return NextResponse.json(
        { error: "query パラメータが必要です" },
        { status: 400 },
      );
    }

    const articles = await searchArticles({ query, language, limit, from });
    console.log(`News API: query="${query}" language="${language}" → ${articles.length} articles`);
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
