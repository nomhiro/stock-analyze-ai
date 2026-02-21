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
    return NextResponse.json(articles);
  } catch (error) {
    console.error("News fetch error:", error);
    const message =
      error instanceof Error && error.message.includes("FINLIGHT_API_KEY")
        ? "FINLIGHT_API_KEY が設定されていません"
        : "ニュースの取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
