import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/azure-openai";
import {
  TREND_MAPPING_SYSTEM_PROMPT,
  buildTrendMappingUserPrompt,
} from "@/lib/prompts/trend-mapping";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, sourceUrl } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "content（分析対象テキスト）が必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const userPrompt = buildTrendMappingUserPrompt({ content, sourceUrl });
    const stream = await streamAnalysis(
      TREND_MAPPING_SYSTEM_PROMPT,
      userPrompt,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Trend mapping error:", error);
    return new Response(
      JSON.stringify({ error: "トレンド分析の実行に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
