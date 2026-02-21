import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/content-extractor", () => ({
  fetchAndExtractContent: vi.fn(),
  truncateContent: vi.fn((t: string) => t),
}));

import { POST } from "./route";
import { fetchAndExtractContent } from "@/lib/content-extractor";

const mockFetch = vi.mocked(fetchAndExtractContent);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/fetch-content", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/fetch-content", () => {
  beforeEach(() => vi.clearAllMocks());

  it("url なしで 400 を返す", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("url");
  });

  it("無効な URL 形式で 400 を返す", async () => {
    const res = await POST(createRequest({ url: "not-a-url" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("無効");
  });

  it("正常な URL でコンテンツを返す", async () => {
    mockFetch.mockResolvedValue({
      title: "テストページ",
      text: "抽出されたコンテンツ",
      url: "https://example.com",
    });

    const res = await POST(createRequest({ url: "https://example.com" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.title).toBe("テストページ");
    expect(data.content).toBe("抽出されたコンテンツ");
    expect(data.url).toBe("https://example.com");
  });

  it("fetchAndExtractContent のエラーで 500 を返す", async () => {
    mockFetch.mockRejectedValue(new Error("ページの取得に失敗しました"));

    const res = await POST(createRequest({ url: "https://example.com/fail" }));
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toContain("失敗");
  });
});
