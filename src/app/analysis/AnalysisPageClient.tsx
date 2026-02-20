"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { TrendThemeCard } from "@/components/analysis/TrendThemeCard";
import { Loading } from "@/components/ui/Loading";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import type { AnalysisType } from "@/lib/types/analysis";
import type { NewsMappingTheme } from "@/lib/types/analysis";

export function AnalysisPageClient() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("short-term");

  const { quote } = useStockQuote(symbol || null);
  const { history } = useStockHistory(symbol || null, "1y");

  const stockAnalysis = useAnalysis();
  const trendAnalysis = useAnalysis();
  const { articles, isLoading: newsLoading, fetchArticles } = useNewsArticles();

  useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol);
  }, [initialSymbol]);

  const handleRunStockAnalysis = () => {
    if (!symbol || !history) return;

    const endpoint =
      analysisType === "short-term"
        ? "/api/analysis/short-term"
        : "/api/analysis/long-term";

    const body =
      analysisType === "short-term"
        ? {
            symbol,
            name: quote?.name || symbol,
            currentPrice: quote?.price || 0,
            recentHistory: history.slice(-30),
            newsHeadlines: [],
          }
        : {
            symbol,
            name: quote?.name || symbol,
            currentPrice: quote?.price || 0,
            yearlyHistory: history,
            marketCap: quote?.marketCap,
            peRatio: quote?.trailingPE,
            pbRatio: quote?.priceToBook,
            dividendYield: quote?.dividendYield,
            eps: quote?.epsTrailingTwelveMonths,
            newsHeadlines: [],
          };

    stockAnalysis.runAnalysis(endpoint, body);
  };

  const handleRunTrendAnalysis = async () => {
    await fetchArticles("日本 経済 株式 テクノロジー", "ja", 15);
  };

  // When articles are fetched, run the mapping
  useEffect(() => {
    if (articles.length > 0 && !trendAnalysis.isLoading) {
      trendAnalysis.runAnalysis("/api/analysis/news-mapping", {
        articles: articles.map((a) => ({
          title: a.title,
          summary: a.summary,
          source: a.source,
          date: a.publishedAt,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

  // Parse trend themes from result
  let trendThemes: NewsMappingTheme[] = [];
  if (trendAnalysis.result) {
    try {
      const jsonMatch = trendAnalysis.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        trendThemes = parsed.themes || [];
      }
    } catch {
      // not ready yet
    }
  }

  const stockAnalysisTab = (
    <div className="space-y-4">
      {/* Symbol input */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">対象銘柄</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="例: 7203.T"
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {/* Analysis type toggle */}
        <div className="flex gap-1">
          {(["short-term", "long-term"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                analysisType === type
                  ? "bg-accent text-white"
                  : "bg-card-border/30 text-muted hover:text-foreground"
              }`}
            >
              {type === "short-term" ? "短期 (1-5日)" : "長期 (6ヶ月〜)"}
            </button>
          ))}
        </div>

        <Button
          onClick={handleRunStockAnalysis}
          disabled={!symbol || stockAnalysis.isLoading}
        >
          <Play className="h-4 w-4" />
          分析実行
        </Button>
      </div>

      {/* Quote info */}
      {quote && (
        <div className="text-sm text-muted">
          {quote.name} | ¥{quote.price.toLocaleString()} |{" "}
          <span
            className={
              quote.change >= 0 ? "text-positive" : "text-negative"
            }
          >
            {quote.change >= 0 ? "+" : ""}
            {quote.change.toFixed(0)} (
            {quote.changePercent >= 0 ? "+" : ""}
            {quote.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Results */}
      <AnalysisPanel
        result={stockAnalysis.result}
        isLoading={stockAnalysis.isLoading}
        error={stockAnalysis.error}
      />
    </div>
  );

  const trendAnalysisTab = (
    <div className="space-y-4">
      <Button
        onClick={handleRunTrendAnalysis}
        disabled={newsLoading || trendAnalysis.isLoading}
      >
        <Play className="h-4 w-4" />
        最新ニュースからトレンド分析
      </Button>

      {(newsLoading || trendAnalysis.isLoading) && !trendAnalysis.result && (
        <Loading
          text={
            newsLoading
              ? "ニュースを取得中..."
              : "トレンドを分析中..."
          }
        />
      )}

      {trendAnalysis.error && (
        <p className="text-sm text-negative">{trendAnalysis.error}</p>
      )}

      {trendThemes.length > 0 && (
        <div className="space-y-3">
          {trendThemes.map((theme, i) => (
            <TrendThemeCard key={i} theme={theme} />
          ))}
        </div>
      )}

      {trendAnalysis.result && trendThemes.length === 0 && (
        <AnalysisPanel
          result={trendAnalysis.result}
          isLoading={trendAnalysis.isLoading}
          error={null}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI分析</h1>
      <Disclaimer />
      <Tabs
        tabs={[
          { id: "stock", label: "銘柄分析", content: stockAnalysisTab },
          { id: "trend", label: "トレンド分析", content: trendAnalysisTab },
        ]}
        defaultTab={symbol ? "stock" : undefined}
      />
    </div>
  );
}
