import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/azure-openai";
import {
  SHORT_TERM_SYSTEM_PROMPT,
  buildShortTermUserPrompt,
} from "@/lib/prompts/short-term";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, currentPrice, recentHistory, newsHeadlines } = body;

    if (!symbol || !recentHistory) {
      return new Response(
        JSON.stringify({ error: "symbol と recentHistory が必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const userPrompt = buildShortTermUserPrompt({
      symbol,
      name: name || symbol,
      currentPrice: currentPrice || 0,
      recentHistory: recentHistory || [],
      newsHeadlines: newsHeadlines || [],
    });

    const stream = await streamAnalysis(SHORT_TERM_SYSTEM_PROMPT, userPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Short-term analysis error:", error);
    return new Response(
      JSON.stringify({ error: "短期分析の実行に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
