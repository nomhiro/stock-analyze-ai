import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractTextFromHtml, truncateContent } from "./content-extractor";

describe("extractTextFromHtml", () => {
  it("extracts title and text from simple HTML", () => {
    const html =
      "<html><head><title>テストページ</title></head><body><p>本文テキスト</p></body></html>";
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.title).toBe("テストページ");
    expect(result.text).toContain("本文テキスト");
    expect(result.url).toBe("https://example.com");
  });

  it("removes script and style tags", () => {
    const html =
      "<body><script>alert('x')</script><p>コンテンツ</p><style>.x{color:red}</style></body>";
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.text).not.toContain("alert");
    expect(result.text).not.toContain("color");
    expect(result.text).toContain("コンテンツ");
  });

  it("removes nav, header, footer, aside elements", () => {
    const html =
      "<body><nav>ナビ</nav><main><p>メイン</p></main><footer>フッター</footer></body>";
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.text).toContain("メイン");
    expect(result.text).not.toContain("ナビ");
    expect(result.text).not.toContain("フッター");
  });

  it("prefers article/main content over full body", () => {
    const html =
      '<body><div>サイドバー</div><article><p>記事本文</p></article></body>';
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.text).toContain("記事本文");
    expect(result.text).not.toContain("サイドバー");
  });

  it("falls back to h1 for title when no title tag", () => {
    const html = "<body><h1>見出し</h1><p>本文</p></body>";
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.title).toBe("見出し");
  });

  it("collapses whitespace", () => {
    const html = "<body><p>複数の   スペース\n\n改行</p></body>";
    const result = extractTextFromHtml(html, "https://example.com");
    expect(result.text).toBe("複数の スペース 改行");
  });
});

describe("truncateContent", () => {
  it("does not truncate short content", () => {
    expect(truncateContent("短いテキスト", 100)).toBe("短いテキスト");
  });

  it("truncates long content with marker", () => {
    const long = "あ".repeat(200);
    const result = truncateContent(long, 100);
    expect(result.length).toBeLessThan(200);
    expect(result).toContain("[...以降省略]");
  });

  it("uses default max length of 8000", () => {
    const short = "x".repeat(7999);
    expect(truncateContent(short)).toBe(short);

    const long = "x".repeat(8001);
    expect(truncateContent(long)).toContain("[...以降省略]");
  });
});

describe("fetchAndExtractContent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and extracts content from URL", async () => {
    const { fetchAndExtractContent } = await import("./content-extractor");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
        text: () =>
          Promise.resolve(
            "<html><head><title>Test</title></head><body><p>Content</p></body></html>",
          ),
      }),
    );

    const result = await fetchAndExtractContent("https://example.com");
    expect(result.title).toBe("Test");
    expect(result.text).toContain("Content");

    vi.unstubAllGlobals();
  });

  it("throws on non-OK response", async () => {
    const { fetchAndExtractContent } = await import("./content-extractor");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
      }),
    );

    await expect(
      fetchAndExtractContent("https://example.com/not-found"),
    ).rejects.toThrow("HTTP 404");

    vi.unstubAllGlobals();
  });

  it("throws on non-HTML content type", async () => {
    const { fetchAndExtractContent } = await import("./content-extractor");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/pdf" }),
      }),
    );

    await expect(
      fetchAndExtractContent("https://example.com/file.pdf"),
    ).rejects.toThrow("HTMLページのみ対応しています");

    vi.unstubAllGlobals();
  });
});
