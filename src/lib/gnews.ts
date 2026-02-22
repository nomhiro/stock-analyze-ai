import type { NewsArticle } from "@/lib/types/news";

const GNEWS_API_URL = "https://gnews.io/api/v4";

interface GNewsSearchParams {
  query: string;
  language?: string;
  country?: string;
  max?: number;
  from?: string;
  to?: string;
  sortby?: "publishedAt" | "relevance";
}

interface GNewsTopHeadlinesParams {
  category?: "general" | "world" | "nation" | "business" | "technology" | "entertainment" | "sports" | "science" | "health";
  language?: string;
  country?: string;
  max?: number;
}

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

function getApiKey(): string {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not configured");
  }
  return apiKey;
}

function mapToNewsArticle(article: GNewsArticle): NewsArticle {
  return {
    title: article.title || "",
    summary: article.description || "",
    source: article.source?.name || "",
    url: article.url || "",
    publishedAt: article.publishedAt || "",
    provider: "gnews",
  };
}

export async function searchArticles(
  params: GNewsSearchParams,
): Promise<NewsArticle[]> {
  const apiKey = getApiKey();

  const url = new URL(`${GNEWS_API_URL}/search`);
  url.searchParams.set("q", params.query);
  url.searchParams.set("apikey", apiKey);
  if (params.language) url.searchParams.set("lang", params.language);
  if (params.country) url.searchParams.set("country", params.country);
  if (params.max) url.searchParams.set("max", String(params.max));
  if (params.from) url.searchParams.set("from", params.from);
  if (params.to) url.searchParams.set("to", params.to);
  if (params.sortby) url.searchParams.set("sortby", params.sortby);

  const res = await fetch(url.toString());

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `GNews API error: ${res.status} ${res.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  const data: GNewsResponse = await res.json();

  console.log("GNews search articles count:", data.articles?.length ?? 0);

  return (data.articles ?? []).map(mapToNewsArticle);
}

export async function getTopHeadlines(
  params: GNewsTopHeadlinesParams = {},
): Promise<NewsArticle[]> {
  const apiKey = getApiKey();

  const url = new URL(`${GNEWS_API_URL}/top-headlines`);
  url.searchParams.set("apikey", apiKey);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.language) url.searchParams.set("lang", params.language);
  if (params.country) url.searchParams.set("country", params.country);
  if (params.max) url.searchParams.set("max", String(params.max));

  const res = await fetch(url.toString());

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `GNews API error: ${res.status} ${res.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  const data: GNewsResponse = await res.json();

  console.log("GNews top headlines count:", data.articles?.length ?? 0);

  return (data.articles ?? []).map(mapToNewsArticle);
}
