import { describe, it, expect } from "vitest";
import {
  TREND_MAPPING_SYSTEM_PROMPT,
  buildTrendMappingUserPrompt,
} from "./trend-mapping";

describe("TREND_MAPPING_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(TREND_MAPPING_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it("mentions JSON format requirement", () => {
    expect(TREND_MAPPING_SYSTEM_PROMPT).toContain("JSON");
  });

  it("mentions .T suffix requirement", () => {
    expect(TREND_MAPPING_SYSTEM_PROMPT).toContain(".T");
  });
});

describe("buildTrendMappingUserPrompt", () => {
  it("includes content in prompt", () => {
    const prompt = buildTrendMappingUserPrompt({
      content: "半導体市場が拡大している",
    });
    expect(prompt).toContain("半導体市場が拡大している");
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("themes");
  });

  it("includes source URL when provided", () => {
    const prompt = buildTrendMappingUserPrompt({
      content: "テスト内容",
      sourceUrl: "https://example.com/article",
    });
    expect(prompt).toContain("https://example.com/article");
    expect(prompt).toContain("情報ソース");
  });

  it("omits source line when no URL", () => {
    const prompt = buildTrendMappingUserPrompt({ content: "テスト" });
    expect(prompt).not.toContain("情報ソース");
  });

  it("includes stock recommendation format", () => {
    const prompt = buildTrendMappingUserPrompt({ content: "テスト" });
    expect(prompt).toContain("recommendedStocks");
    expect(prompt).toContain("銘柄コード.T");
  });
});
