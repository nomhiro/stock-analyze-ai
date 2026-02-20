import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol パラメータが必要です" },
      { status: 400 },
    );
  }

  try {
    const quote = await getQuote(symbol);
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Quote fetch error:", error);
    return NextResponse.json(
      { error: `銘柄 ${symbol} のデータ取得に失敗しました` },
      { status: 500 },
    );
  }
}
