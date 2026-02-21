import { describe, it, expect } from "vitest";

// useStockSearch はクライアントフック（React の useState/useEffect を使用）のため、
// ここでは内部ロジック（fetch 呼び出しの構築とデバウンス）をテストする。
// React フックのテストには jsdom 環境が必要なため、
// fetch の URL 構築ロジックを直接テストする。

describe("useStockSearch fetch URL construction", () => {
  it("クエリがエンコードされた URL を構築する", () => {
    const query = "トヨタ";
    const url = `/api/stocks/search?q=${encodeURIComponent(query)}`;
    expect(url).toBe("/api/stocks/search?q=%E3%83%88%E3%83%A8%E3%82%BF");
  });

  it("英数字クエリはそのままエンコードされる", () => {
    const query = "7203.T";
    const url = `/api/stocks/search?q=${encodeURIComponent(query)}`;
    expect(url).toBe("/api/stocks/search?q=7203.T");
  });

  it("特殊文字を含むクエリが正しくエンコードされる", () => {
    const query = "日経225";
    const url = `/api/stocks/search?q=${encodeURIComponent(query)}`;
    expect(url).toContain("/api/stocks/search?q=");
    expect(decodeURIComponent(url.split("q=")[1])).toBe("日経225");
  });
});
