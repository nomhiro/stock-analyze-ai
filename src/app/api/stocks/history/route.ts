import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/yahoo-finance";
import type { HistoryInterval } from "@/lib/types/stock";

export const dynamic = "force-dynamic";

function getPeriod1(period: string): string {
  const now = new Date();
  const offsets: Record<string, number> = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "5y": 1825,
  };
  const days = offsets[period] ?? 365;
  now.setDate(now.getDate() - days);
  return now.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const period = params.get("period") || "1y";
  const interval = (params.get("interval") || "1d") as HistoryInterval;

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol パラメータが必要です" },
      { status: 400 },
    );
  }

  try {
    const period1 = params.get("period1") || getPeriod1(period);
    const period2 = params.get("period2") || undefined;
    const history = await getHistory(symbol, period1, period2, interval);
    return NextResponse.json(history);
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: `銘柄 ${symbol} の履歴データ取得に失敗しました` },
      { status: 500 },
    );
  }
}
