import { NextRequest, NextResponse } from "next/server";
import {
  fetchAndExtractContent,
  truncateContent,
} from "@/lib/content-extractor";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "url パラメータが必要です" },
        { status: 400 },
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "無効なURL形式です" },
        { status: 400 },
      );
    }

    const extracted = await fetchAndExtractContent(url);
    const content = truncateContent(extracted.text);

    return NextResponse.json({
      title: extracted.title,
      content,
      url: extracted.url,
    });
  } catch (error) {
    console.error("Content fetch error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "コンテンツの取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
