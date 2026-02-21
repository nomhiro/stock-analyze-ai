import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateAdminRequest } from "@/lib/admin-auth";
import { TSE_STOCKS } from "@/lib/data/tse-stocks";
import {
  downloadJpxExcel,
  parseJpxExcel,
  computeDiff,
  generateTypeScriptContent,
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
    const tsContent = generateTypeScriptContent(fetchedStocks);

    const outputPath = resolve(
      process.cwd(),
      "src/lib/data/tse-stocks.ts",
    );
    await writeFile(outputPath, tsContent, "utf-8");

    return NextResponse.json({
      success: true,
      diff,
      updatedAt: new Date().toISOString(),
      message:
        "ファイルを更新しました。変更を反映するにはリビルド・再デプロイが必要です。",
    });
  } catch (error) {
    console.error("TSE stocks update error:", error);
    const message =
      error instanceof Error && (error as NodeJS.ErrnoException).code === "EROFS"
        ? "本番環境ではファイルの書き込みができません。開発環境で実行してください。"
        : "TSE銘柄データの更新に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
