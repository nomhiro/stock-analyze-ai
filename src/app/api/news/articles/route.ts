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
    return NextResponse.json(
      { error: "ニュースの取得に失敗しました" },
      { status: 500 },
    );
  }
}
