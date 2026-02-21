import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";
import { searchLocalStocks, containsNonAscii } from "@/lib/stock-search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "q パラメータが必要です" },
      { status: 400 },
    );
  }

  try {
    if (containsNonAscii(query)) {
      // 日本語入力: ローカルデータのみで検索
      const results = searchLocalStocks(query);
      return NextResponse.json(results);
    }

    // 英数字入力: ローカル検索 + Yahoo Finance を併用
    const localResults = searchLocalStocks(query);
    const yahooResults = await searchStocks(query);

    // ローカル結果を優先し、Yahoo結果で補完（重複排除）
    const seen = new Set(localResults.map((r) => r.symbol));
    const merged = [...localResults];
    for (const r of yahooResults) {
      if (!seen.has(r.symbol) && merged.length < 10) {
        merged.push(r);
        seen.add(r.symbol);
      }
    }

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "銘柄検索に失敗しました" },
      { status: 500 },
    );
  }
}
