import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { TSE_STOCKS } from "@/lib/data/tse-stocks";
import {
  downloadJpxExcel,
  parseJpxExcel,
  computeDiff,
} from "@/lib/tse-stock-fetcher";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = validateAdminRequest(request);
  if (authError) return authError;

  try {
    const buffer = await downloadJpxExcel();
    const fetchedStocks = parseJpxExcel(buffer);

    if (fetchedStocks.length < 100) {
      return NextResponse.json(
        {
          error: `取得された銘柄数が少なすぎます（${fetchedStocks.length}件）。JPXのデータ形式を確認してください。`,
        },
        { status: 500 },
      );
    }

    const diff = computeDiff(TSE_STOCKS, fetchedStocks);

    return NextResponse.json({
      diff,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TSE stocks preview error:", error);
    return NextResponse.json(
      { error: "JPXデータの取得に失敗しました" },
      { status: 500 },
    );
  }
}
