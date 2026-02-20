import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/azure-openai";
import {
  NEWS_MAPPING_SYSTEM_PROMPT,
  buildNewsMappingUserPrompt,
} from "@/lib/prompts/news-mapping";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: "articles 配列が必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const userPrompt = buildNewsMappingUserPrompt({ articles });
    const stream = await streamAnalysis(
      NEWS_MAPPING_SYSTEM_PROMPT,
      userPrompt,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("News mapping error:", error);
    return new Response(
      JSON.stringify({ error: "ニュース→銘柄マッピングの実行に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
