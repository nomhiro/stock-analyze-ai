import { NextRequest, NextResponse } from "next/server";
import { getTopHeadlines } from "@/lib/gnews";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "business") as
      | "general" | "world" | "nation" | "business" | "technology"
      | "entertainment" | "sports" | "science" | "health";
    const language = searchParams.get("language") || "ja";
    const country = searchParams.get("country") || "jp";
    const max = Number(searchParams.get("max")) || 10;

    const articles = await getTopHeadlines({ category, language, country, max });
    console.log(
      `Headlines API: category="${category}" language="${language}" → ${articles.length} articles`,
    );
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Headlines fetch error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `ヘッドラインの取得に失敗しました: ${detail}` },
      { status: 500 },
    );
  }
}
