import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/azure-openai";
import {
  LONG_TERM_SYSTEM_PROMPT,
  buildLongTermUserPrompt,
} from "@/lib/prompts/long-term";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      name,
      currentPrice,
      yearlyHistory,
      marketCap,
      peRatio,
      pbRatio,
      dividendYield,
      eps,
      newsHeadlines,
    } = body;

    if (!symbol || !yearlyHistory) {
      return new Response(
        JSON.stringify({ error: "symbol と yearlyHistory が必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const userPrompt = buildLongTermUserPrompt({
      symbol,
      name: name || symbol,
      currentPrice: currentPrice || 0,
      yearlyHistory: yearlyHistory || [],
      marketCap,
      peRatio,
      pbRatio,
      dividendYield,
      eps,
      newsHeadlines: newsHeadlines || [],
    });

    const stream = await streamAnalysis(LONG_TERM_SYSTEM_PROMPT, userPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Long-term analysis error:", error);
    return new Response(
      JSON.stringify({ error: "長期分析の実行に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
