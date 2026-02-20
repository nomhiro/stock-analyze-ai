"use client";

import { useState, useCallback } from "react";
import type { NewsArticle } from "@/lib/types/news";

export function useNewsArticles() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(
    async (query: string, language = "ja", limit = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/news/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, language, limit }),
        });

        if (!res.ok) throw new Error("ニュースの取得に失敗しました");

        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ニュースの取得に失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { articles, isLoading, error, fetchArticles };
}
