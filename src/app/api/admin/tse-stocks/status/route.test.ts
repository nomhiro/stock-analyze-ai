import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/data/tse-stocks", () => ({
  TSE_STOCKS: [
    { symbol: "1301.T", name: "極洋" },
    { symbol: "7203.T", name: "トヨタ自動車" },
  ],
  TSE_STOCKS_METADATA: { generatedDate: "2026-02-20", total: 2 },
}));

import { GET } from "./route";
import { NextRequest } from "next/server";

function createRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }
  return new NextRequest(
    new URL("/api/admin/tse-stocks/status", "http://localhost:3000"),
    { headers },
  );
}

describe("GET /api/admin/tse-stocks/status", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("認証なしで 401 を返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "test-key");

    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it("ADMIN_API_KEY 未設定で 503 を返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "");

    const res = await GET(createRequest("Bearer test-key"));
    expect(res.status).toBe(503);
  });

  it("正しいキーでステータスを返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "test-key");

    const res = await GET(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.totalStocks).toBe(2);
    expect(data.generatedDate).toBe("2026-02-20");
    expect(data.sampleStocks).toHaveLength(2);
  });
});
