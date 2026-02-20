import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo-finance";
import { masterSymbols } from "@/lib/data/stock-master";
import type { StockQuote } from "@/lib/types/stock";

export const dynamic = "force-dynamic";

let cachedData: { quotes: StockQuote[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");

  const symbols = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim())
    : masterSymbols;

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "symbols パラメータが必要です" },
      { status: 400 },
    );
  }

  if (symbols.length > 100) {
    return NextResponse.json(
      { error: "一度に取得できる銘柄数は100件までです" },
      { status: 400 },
    );
  }

  try {
    const isMasterRequest = !symbolsParam;
    if (
      isMasterRequest &&
      cachedData &&
      Date.now() - cachedData.timestamp < CACHE_TTL_MS
    ) {
      return NextResponse.json(cachedData.quotes);
    }

    const quotes = await getQuotes(symbols);

    if (isMasterRequest) {
      cachedData = { quotes, timestamp: Date.now() };
    }

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Batch quotes fetch error:", error);
    return NextResponse.json(
      { error: "銘柄データの一括取得に失敗しました" },
      { status: 500 },
    );
  }
}
