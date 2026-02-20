import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";

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
    const results = await searchStocks(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "銘柄検索に失敗しました" },
      { status: 500 },
    );
  }
}
