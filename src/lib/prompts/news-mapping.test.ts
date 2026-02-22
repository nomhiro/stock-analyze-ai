import { describe, it, expect } from "vitest";
import {
  NEWS_MAPPING_SYSTEM_PROMPT,
  buildNewsMappingUserPrompt,
} from "./news-mapping";

describe("NEWS_MAPPING_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(NEWS_MAPPING_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it("mentions JSON format requirement", () => {
    expect(NEWS_MAPPING_SYSTEM_PROMPT).toContain("JSON");
  });

  it("mentions .T suffix requirement", () => {
    expect(NEWS_MAPPING_SYSTEM_PROMPT).toContain(".T");
  });
});

describe("buildNewsMappingUserPrompt", () => {
  const sampleArticles = [
    {
      title: "半導体市場が好調",
      summary: "AI需要が牽引し半導体市場が拡大",
      source: "日経新聞",
      date: "2026-02-21",
    },
  ];

  it("includes article content in prompt", () => {
    const prompt = buildNewsMappingUserPrompt({ articles: sampleArticles });
    expect(prompt).toContain("半導体市場が好調");
    expect(prompt).toContain("AI需要が牽引し半導体市場が拡大");
    expect(prompt).toContain("日経新聞");
    expect(prompt).toContain("2026-02-21");
  });

  it("includes JSON structure with themes", () => {
    const prompt = buildNewsMappingUserPrompt({ articles: sampleArticles });
    expect(prompt).toContain("themes");
    expect(prompt).toContain("recommendedStocks");
    expect(prompt).toContain("銘柄コード.T");
  });

  it("includes newsSummary field in JSON template", () => {
    const prompt = buildNewsMappingUserPrompt({ articles: sampleArticles });
    expect(prompt).toContain("newsSummary");
  });

  it("includes summary generation instruction", () => {
    const prompt = buildNewsMappingUserPrompt({ articles: sampleArticles });
    expect(prompt).toContain("要約");
  });

  it("includes multiple articles when provided", () => {
    const articles = [
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
    ];
    const prompt = buildNewsMappingUserPrompt({ articles });
    expect(prompt).toContain("記事1");
    expect(prompt).toContain("記事2");
    expect(prompt).toContain("概要1");
    expect(prompt).toContain("概要2");
  });

  it("includes .T suffix requirement", () => {
    const prompt = buildNewsMappingUserPrompt({ articles: sampleArticles });
    expect(prompt).toContain(".T");
  });
});
