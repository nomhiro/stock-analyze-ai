import * as cheerio from "cheerio";

export interface ExtractedContent {
  title: string;
  text: string;
  url: string;
}

export function extractTextFromHtml(
  html: string,
  url: string,
): ExtractedContent {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, nav, header, footer, aside, iframe, noscript, svg",
  ).remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || "";

  // Prefer article/main content area, fall back to body
  const mainContent = $(
    "article, main, [role='main'], .content, .post-content, .entry-content",
  );
  const contentElement = mainContent.length > 0 ? mainContent.first() : $("body");

  const text = contentElement
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return { title, text, url };
}

export async function fetchAndExtractContent(
  url: string,
): Promise<ExtractedContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; StockAnalyzeAI/1.0)",
      Accept: "text/html,application/xhtml+xml,text/plain",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`ページの取得に失敗しました (HTTP ${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("text/plain")
  ) {
    throw new Error("HTMLページのみ対応しています");
  }

  const html = await response.text();
  return extractTextFromHtml(html, url);
}

export function truncateContent(
  text: string,
  maxLength: number = 8000,
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\n\n[...以降省略]";
}
