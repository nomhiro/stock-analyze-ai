import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/azure-openai", () => ({
  streamAnalysis: vi.fn(),
}));

import { POST } from "./route";
import { streamAnalysis } from "@/lib/azure-openai";

const mockStreamAnalysis = vi.mocked(streamAnalysis);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/analysis/trend-mapping", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/analysis/trend-mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("content なしで 400 を返す", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("content");
  });

  it("空文字列 content で 400 を返す", async () => {
    const res = await POST(createRequest({ content: "   " }));
    expect(res.status).toBe(400);
  });

  it("正常な content でストリームを返す", async () => {
    const mockStream = new ReadableStream();
    mockStreamAnalysis.mockResolvedValue(mockStream);

    const res = await POST(
      createRequest({ content: "半導体市場のニュース" }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(mockStreamAnalysis).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("半導体市場のニュース"),
    );
  });

  it("sourceUrl を含めてプロンプトを構築する", async () => {
    const mockStream = new ReadableStream();
    mockStreamAnalysis.mockResolvedValue(mockStream);

    await POST(
      createRequest({
        content: "テスト内容",
        sourceUrl: "https://example.com",
      }),
    );

    expect(mockStreamAnalysis).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("https://example.com"),
    );
  });

  it("streamAnalysis のエラーで 500 を返す", async () => {
    mockStreamAnalysis.mockRejectedValue(new Error("API error"));

    const res = await POST(createRequest({ content: "テスト" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("失敗");
  });
});
