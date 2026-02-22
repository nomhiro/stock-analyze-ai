import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/azure-openai", () => ({
  streamAnalysis: vi.fn(),
}));

import { POST } from "./route";
import { streamAnalysis } from "@/lib/azure-openai";

const mockStreamAnalysis = vi.mocked(streamAnalysis);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/analysis/news-mapping", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/analysis/news-mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("articles なしで 400 を返す", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("articles");
  });

  it("空配列の articles で 400 を返す", async () => {
    const res = await POST(createRequest({ articles: [] }));
    expect(res.status).toBe(400);
  });

  it("articles が配列でない場合 400 を返す", async () => {
    const res = await POST(createRequest({ articles: "not-array" }));
    expect(res.status).toBe(400);
  });

  it("正常な articles でストリームを返す", async () => {
    const mockStream = new ReadableStream();
    mockStreamAnalysis.mockResolvedValue(mockStream);

    const res = await POST(
      createRequest({
        articles: [
          {
            title: "半導体市場が好調",
            summary: "AI需要が牽引",
            source: "日経新聞",
            date: "2026-02-21",
          },
        ],
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(mockStreamAnalysis).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("半導体市場が好調"),
    );
  });

  it("複数記事を含むプロンプトを構築する", async () => {
    const mockStream = new ReadableStream();
    mockStreamAnalysis.mockResolvedValue(mockStream);

    await POST(
      createRequest({
        articles: [
          {
            title: "記事1",
            summary: "概要1",
            source: "ソース1",
            date: "2026-02-20",
          },
          {
            title: "記事2",
            summary: "概要2",
            source: "ソース2",
            date: "2026-02-21",
          },
        ],
      }),
    );

    const userPrompt = mockStreamAnalysis.mock.calls[0][1];
    expect(userPrompt).toContain("記事1");
    expect(userPrompt).toContain("記事2");
    expect(userPrompt).toContain("概要1");
    expect(userPrompt).toContain("概要2");
  });

  it("プロンプトに newsSummary フィールドが含まれる", async () => {
    const mockStream = new ReadableStream();
    mockStreamAnalysis.mockResolvedValue(mockStream);

    await POST(
      createRequest({
        articles: [
          {
            title: "テスト記事",
            summary: "テスト概要",
            source: "テストソース",
            date: "2026-02-21",
          },
        ],
      }),
    );

    const userPrompt = mockStreamAnalysis.mock.calls[0][1];
    expect(userPrompt).toContain("newsSummary");
    expect(userPrompt).toContain("要約");
  });

  it("streamAnalysis のエラーで 500 を返す", async () => {
    mockStreamAnalysis.mockRejectedValue(new Error("API error"));

    const res = await POST(
      createRequest({
        articles: [
          {
            title: "テスト",
            summary: "テスト",
            source: "テスト",
            date: "2026-02-21",
          },
        ],
      }),
    );

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("失敗");
  });
});
