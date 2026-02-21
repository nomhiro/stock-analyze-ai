import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import {
  parseJpxExcel,
  computeDiff,
  generateTypeScriptContent,
  downloadJpxExcel,
  type TseStock,
} from "./tse-stock-fetcher";

function createTestExcel(
  rows: (string | number | undefined)[][],
): Buffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xls" });
  return Buffer.from(buf);
}

describe("parseJpxExcel", () => {
  it("ヘッダー行から銘柄を抽出する", () => {
    const buffer = createTestExcel([
      ["日付", "コード", "銘柄名", "市場"],
      ["2026-01-01", "7203", "トヨタ自動車", "プライム"],
      ["2026-01-01", "6758", "ソニーグループ", "プライム"],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ symbol: "6758.T", name: "ソニーグループ" });
    expect(result[1]).toEqual({ symbol: "7203.T", name: "トヨタ自動車" });
  });

  it("4桁以外のコードをスキップする", () => {
    const buffer = createTestExcel([
      ["日付", "コード", "銘柄名"],
      ["2026-01-01", "12345", "無効なコード", ""],
      ["2026-01-01", "ABC", "英字コード", ""],
      ["2026-01-01", "7203", "トヨタ自動車", ""],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe("7203.T");
  });

  it("重複シンボルを除外する", () => {
    const buffer = createTestExcel([
      ["日付", "コード", "銘柄名"],
      ["2026-01-01", "7203", "トヨタ自動車", ""],
      ["2026-01-01", "7203", "トヨタ自動車（重複）", ""],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result).toHaveLength(1);
  });

  it("名前が空の行をスキップする", () => {
    const buffer = createTestExcel([
      ["日付", "コード", "銘柄名"],
      ["2026-01-01", "7203", "", ""],
      ["2026-01-01", "6758", "ソニーグループ", ""],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe("6758.T");
  });

  it("結果をシンボル順にソートする", () => {
    const buffer = createTestExcel([
      ["日付", "コード", "銘柄名"],
      ["2026-01-01", "9984", "ソフトバンクG", ""],
      ["2026-01-01", "1301", "極洋", ""],
      ["2026-01-01", "7203", "トヨタ自動車", ""],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result.map((s) => s.symbol)).toEqual([
      "1301.T",
      "7203.T",
      "9984.T",
    ]);
  });

  it("ヘッダーが見つからない場合にフォールバックする", () => {
    // フォールバック時: headerRowIndex=0, codeColIndex=1, nameColIndex=2
    // row[0] がヘッダー扱いになるので row[1]以降がデータ
    const buffer = createTestExcel([
      ["2026-01-01", "ヘッダ", "ヘッダ名", "区分"],
      ["2026-01-01", "7203", "トヨタ自動車", "プライム"],
      ["2026-01-01", "6758", "ソニーグループ", "プライム"],
    ]);

    const result = parseJpxExcel(buffer);
    expect(result).toHaveLength(2);
  });
});

describe("computeDiff", () => {
  const stockA: TseStock = { symbol: "1301.T", name: "極洋" };
  const stockB: TseStock = { symbol: "7203.T", name: "トヨタ自動車" };
  const stockC: TseStock = { symbol: "9999.T", name: "新銘柄" };

  it("追加された銘柄を検出する", () => {
    const diff = computeDiff([stockA, stockB], [stockA, stockB, stockC]);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].symbol).toBe("9999.T");
    expect(diff.removed).toHaveLength(0);
    expect(diff.totalBefore).toBe(2);
    expect(diff.totalAfter).toBe(3);
    expect(diff.unchanged).toBe(2);
  });

  it("削除された銘柄を検出する", () => {
    const diff = computeDiff([stockA, stockB], [stockA]);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].symbol).toBe("7203.T");
    expect(diff.unchanged).toBe(1);
  });

  it("変更なしの場合に空の差分を返す", () => {
    const diff = computeDiff([stockA, stockB], [stockA, stockB]);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.unchanged).toBe(2);
  });

  it("空の配列同士を比較できる", () => {
    const diff = computeDiff([], []);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.totalBefore).toBe(0);
    expect(diff.totalAfter).toBe(0);
  });
});

describe("generateTypeScriptContent", () => {
  it("正しいフォーマットのTypeScriptを生成する", () => {
    const stocks: TseStock[] = [
      { symbol: "1301.T", name: "極洋" },
      { symbol: "7203.T", name: "トヨタ自動車" },
    ];
    const content = generateTypeScriptContent(stocks);

    expect(content).toContain("export const TSE_STOCKS_METADATA");
    expect(content).toContain("total: 2");
    expect(content).toContain("export const TSE_STOCKS");
    expect(content).toContain('"1301.T"');
    expect(content).toContain("極洋");
    expect(content).toContain('"7203.T"');
    expect(content).toContain("トヨタ自動車");
    expect(content).toContain("// This file is auto-generated");
  });

  it("メタデータに生成日を含む", () => {
    const content = generateTypeScriptContent([]);
    const today = new Date().toISOString().split("T")[0];
    expect(content).toContain(`generatedDate: "${today}"`);
    expect(content).toContain("total: 0");
  });
});

describe("downloadJpxExcel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ダウンロード失敗時にエラーをスローする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(downloadJpxExcel()).rejects.toThrow(
      "JPXファイルのダウンロードに失敗",
    );

    vi.unstubAllGlobals();
  });
});
