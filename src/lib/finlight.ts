import type { NewsArticle } from "@/lib/types/news";

const FINLIGHT_API_URL = "https://api.finlight.me/v2/articles";

interface FinlightSearchParams {
  query: string;
  language?: string;
  limit?: number;
  from?: string;
}

export async function searchArticles(
  params: FinlightSearchParams,
): Promise<NewsArticle[]> {
  const apiKey = process.env.FINLIGHT_API_KEY;
  if (!apiKey) {
    throw new Error("FINLIGHT_API_KEY is not configured");
  }

  const res = await fetch(FINLIGHT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      query: params.query,
      ...(params.language && { language: params.language }),
      pageSize: params.limit || 20,
      ...(params.from && { from: params.from }),
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Finlight API error: ${res.status} ${res.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  console.log(
    "Finlight API response keys:",
    typeof data === "object" && data !== null ? Object.keys(data) : typeof data,
  );

  // v2 API: レスポンスは { articles: [...] } 形式
  const raw = data.articles ?? (Array.isArray(data) ? data : []);

  console.log("Finlight articles count:", raw.length);
  if (raw.length > 0) {
    console.log("Finlight first article keys:", Object.keys(raw[0]));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return raw.map((a: any) => ({
    title: a.title || "",
    summary: a.summary || a.description || "",
    source: a.source || "",
    url: a.link || a.url || a.sourceUrl || "",
    publishedAt: a.publishDate || a.publishedAt || a.published_at || "",
    sentiment: a.sentiment || undefined,
  }));
}
