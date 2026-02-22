export type NewsProvider = "finlight" | "gnews";

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: "positive" | "negative" | "neutral";
  provider?: NewsProvider;
}
