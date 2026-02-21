import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/data/tse-stocks", () => ({
  TSE_STOCKS: [
    { symbol: "1301.T", name: "極洋" },
    { symbol: "7203.T", name: "トヨタ自動車" },
  ],
  TSE_STOCKS_METADATA: { generatedDate: "2026-02-20", total: 2 },
}));

vi.mock("@/lib/tse-stock-fetcher", () => ({
  downloadJpxExcel: vi.fn(),
  parseJpxExcel: vi.fn(),
  computeDiff: vi.fn(),
  generateTypeScriptContent: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import {
  downloadJpxExcel,
  parseJpxExcel,
  computeDiff,
  generateTypeScriptContent,
} from "@/lib/tse-stock-fetcher";
import { writeFile } from "node:fs/promises";

const mockDownload = vi.mocked(downloadJpxExcel);
const mockParse = vi.mocked(parseJpxExcel);
const mockDiff = vi.mocked(computeDiff);
const mockGenerate = vi.mocked(generateTypeScriptContent);
const mockWriteFile = vi.mocked(writeFile);

function createRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }
  return new NextRequest(
    new URL("/api/admin/tse-stocks/update", "http://localhost:3000"),
    { method: "POST", headers },
  );
}

describe("POST /api/admin/tse-stocks/update", () => {
  const manyStocks = Array.from({ length: 150 }, (_, i) => ({
    symbol: `${String(i + 1000).padStart(4, "0")}.T`,
    name: `銘柄${i}`,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.stubEnv("ADMIN_API_KEY", "test-key");
  });

  it("認証なしで 401 を返す", async () => {
    const res = await POST(createRequest());
    expect(res.status).toBe(401);
  });

  it("正常にファイルを更新して差分を返す", async () => {
    mockDownload.mockResolvedValue(Buffer.from("fake"));
    mockParse.mockReturnValue(manyStocks);
    mockDiff.mockReturnValue({
      added: [{ symbol: "9999.T", name: "新銘柄" }],
      removed: [],
      totalBefore: 2,
      totalAfter: 150,
      unchanged: 2,
    });
    mockGenerate.mockReturnValue("// generated content");
    mockWriteFile.mockResolvedValue(undefined);

    const res = await POST(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.diff.added).toHaveLength(1);
    expect(data.message).toContain("リビルド");
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it("ファイル書き込み失敗で 500 を返す", async () => {
    mockDownload.mockResolvedValue(Buffer.from("fake"));
    mockParse.mockReturnValue(manyStocks);
    mockDiff.mockReturnValue({
      added: [],
      removed: [],
      totalBefore: 2,
      totalAfter: 150,
      unchanged: 2,
    });
    mockGenerate.mockReturnValue("// content");
    mockWriteFile.mockRejectedValue(new Error("Permission denied"));

    const res = await POST(createRequest("Bearer test-key"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("更新に失敗");
  });

  it("取得銘柄数が少ない場合に 500 を返す", async () => {
    mockDownload.mockResolvedValue(Buffer.from("fake"));
    mockParse.mockReturnValue([{ symbol: "1301.T", name: "極洋" }]);

    const res = await POST(createRequest("Bearer test-key"));
    expect(res.status).toBe(500);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
