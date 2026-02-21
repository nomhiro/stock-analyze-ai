"use client";

import { useState, useCallback } from "react";
import { Search, Newspaper, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import type { NewsArticle } from "@/lib/types/news";

interface NewsSelectorProps {
  onAnalyze: (articles: NewsArticle[]) => void;
  isAnalyzing: boolean;
}

export function NewsSelector({ onAnalyze, isAnalyzing }: NewsSelectorProps) {
  const { articles, isLoading, error, fetchArticles } = useNewsArticles();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetch = useCallback(async () => {
    const q = query.trim() || "日本 株式 市場";
    await fetchArticles(q, "ja", 20);
    setSelectedIds(new Set());
    setHasFetched(true);
  }, [query, fetchArticles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleFetch();
    },
    [handleFetch],
  );

  const toggleSelect = useCallback((index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((_, i) => i)));
    }
  }, [selectedIds.size, articles]);

  const handleAnalyze = useCallback(() => {
    const selected = articles.filter((_, i) => selectedIds.has(i));
    if (selected.length > 0) {
      onAnalyze(selected);
    }
  }, [articles, selectedIds, onAnalyze]);

  const sentimentVariant = (
    s?: "positive" | "negative" | "neutral",
  ): "positive" | "negative" | "default" => {
    if (s === "positive") return "positive";
    if (s === "negative") return "negative";
    return "default";
  };

  const allSelected = articles.length > 0 && selectedIds.size === articles.length;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="検索キーワード（例: 半導体, AI, 自動車）"
            className="w-full rounded-lg border border-card-border bg-card py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <Button onClick={handleFetch} disabled={isLoading} variant="secondary">
          <Newspaper className="h-4 w-4" />
          最新ニュース取得
        </Button>
      </div>

      {/* Loading */}
      {isLoading && <Loading text="ニュースを取得中..." />}

      {/* Error */}
      {error && <p className="text-sm text-negative">{error}</p>}

      {/* Empty state */}
      {hasFetched && !isLoading && articles.length === 0 && !error && (
        <p className="text-sm text-muted">
          ニュースが見つかりませんでした。別のキーワードで試してください。
        </p>
      )}

      {/* Article list */}
      {articles.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              {allSelected ? "すべて解除" : "すべて選択"}
            </button>
            <span className="text-xs text-muted">
              {selectedIds.size} / {articles.length} 件選択中
            </span>
          </div>

          {/* Articles */}
          <div className="max-h-96 space-y-1.5 overflow-y-auto">
            {articles.map((article, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-colors ${
                  selectedIds.has(i)
                    ? "border-accent bg-accent/5"
                    : "hover:border-card-border/80"
                }`}
              >
                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(i)}
                    onChange={() => toggleSelect(i)}
                    className="mt-1 h-4 w-4 shrink-0 accent-accent"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {article.title}
                    </p>
                    {article.summary && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {article.summary}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted">
                        {article.source}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(article.publishedAt).toLocaleDateString(
                          "ja-JP",
                        )}
                      </span>
                      {article.sentiment && (
                        <Badge variant={sentimentVariant(article.sentiment)}>
                          {article.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </label>
              </Card>
            ))}
          </div>

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={selectedIds.size === 0 || isAnalyzing}
          >
            <Newspaper className="h-4 w-4" />
            選択したニュースを分析（{selectedIds.size}件）
          </Button>
        </>
      )}
    </div>
  );
}
