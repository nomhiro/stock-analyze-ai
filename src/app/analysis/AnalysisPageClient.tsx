"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Button } from "@/components/ui/Button";
import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { Tabs } from "@/components/ui/Tabs";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { TrendThemeCard } from "@/components/analysis/TrendThemeCard";
import { NewsSelector } from "@/components/analysis/NewsSelector";
import { Loading } from "@/components/ui/Loading";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { AnalysisType } from "@/lib/types/analysis";
import type { NewsMappingTheme, NewsMappingResult } from "@/lib/types/analysis";
import { Card } from "@/components/ui/Card";
import type { NewsArticle } from "@/lib/types/news";

export function AnalysisPageClient() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("short-term");

  const { quote } = useStockQuote(symbol || null);
  const { history } = useStockHistory(symbol || null, "1y");

  const stockAnalysis = useAnalysis();
  const trendAnalysis = useAnalysis();
  const newsAnalysis = useAnalysis();

  const [trendUrl, setTrendUrl] = useState("");
  const [trendText, setTrendText] = useState("");
  const [fetchingContent, setFetchingContent] = useState(false);

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
    const url = trendUrl.trim();
    const text = trendText.trim();
    if (!url && !text) return;

    let urlContent = "";
    let sourceUrl: string | undefined;

    if (url) {
      setFetchingContent(true);
      try {
        const res = await fetch("/api/fetch-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "ページの取得に失敗しました");
        }

        const data = await res.json();
        urlContent = data.content;
        sourceUrl = data.url;
      } catch (err) {
        setFetchingContent(false);
        trendAnalysis.reset();
        return;
      }
      setFetchingContent(false);
    }

    const parts = [urlContent, text].filter(Boolean);
    const content = parts.join("\n\n---\n\n");

    trendAnalysis.runAnalysis("/api/analysis/trend-mapping", {
      content,
      sourceUrl,
    });
  };

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

  const hasTrendInput = trendUrl.trim() || trendText.trim();

  const handleRunNewsAnalysis = (articles: NewsArticle[]) => {
    const mapped = articles.map((a) => ({
      title: a.title,
      summary: a.summary,
      source: a.source,
      date: a.publishedAt,
    }));
    newsAnalysis.runAnalysis("/api/analysis/news-mapping", { articles: mapped });
  };

  // Parse news analysis themes and summary from result
  let newsThemes: NewsMappingTheme[] = [];
  let newsSummary = "";
  if (newsAnalysis.result) {
    try {
      const jsonMatch = newsAnalysis.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: Partial<NewsMappingResult> = JSON.parse(jsonMatch[0]);
        newsThemes = parsed.themes || [];
        newsSummary = parsed.newsSummary || "";
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
          <StockSearchBar
            defaultValue={symbol}
            onSelect={(result) => setSymbol(result.symbol)}
            onChange={(v) => setSymbol(v)}
            placeholder="例: 7203.T（銘柄コードまたは企業名で検索）"
            className="max-w-xs"
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
                  ? "bg-accent/15 text-accent border border-accent"
                  : "bg-card-border/30 text-muted hover:text-foreground border border-transparent"
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
      {/* URL input */}
      <div>
        <label className="mb-1 block text-xs text-muted">
          URL（ページ内容を自動取得します）
        </label>
        <input
          type="text"
          value={trendUrl}
          onChange={(e) => setTrendUrl(e.target.value)}
          placeholder="https://example.com/news/article"
          className="w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {/* Text input */}
      <div>
        <label className="mb-1 block text-xs text-muted">
          テキスト（分析したい内容を貼り付け）
        </label>
        <textarea
          value={trendText}
          onChange={(e) => setTrendText(e.target.value)}
          placeholder="分析したいニュース記事やレポートのテキストを貼り付けてください"
          rows={6}
          className="w-full resize-y rounded-lg border border-card-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <Button
        onClick={handleRunTrendAnalysis}
        disabled={!hasTrendInput || fetchingContent || trendAnalysis.isLoading}
      >
        <Play className="h-4 w-4" />
        トレンド分析を実行
      </Button>

      {(fetchingContent || trendAnalysis.isLoading) &&
        !trendAnalysis.result && (
          <Loading
            text={
              fetchingContent
                ? "ページ内容を取得中..."
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

  const newsAnalysisTab = (
    <div className="space-y-4">
      <NewsSelector
        onAnalyze={handleRunNewsAnalysis}
        isAnalyzing={newsAnalysis.isLoading}
      />

      {newsAnalysis.isLoading && !newsAnalysis.result && (
        <Loading text="ニュースを分析中..." />
      )}

      {newsAnalysis.error && (
        <p className="text-sm text-negative">{newsAnalysis.error}</p>
      )}

      {newsSummary && (
        <Card title="ニュース要約">
          <p className="text-sm leading-relaxed">{newsSummary}</p>
        </Card>
      )}

      {newsThemes.length > 0 && (
        <div className="space-y-3">
          {newsThemes.map((theme, i) => (
            <TrendThemeCard key={i} theme={theme} />
          ))}
        </div>
      )}

      {newsAnalysis.result && newsThemes.length === 0 && !newsSummary && (
        <AnalysisPanel
          result={newsAnalysis.result}
          isLoading={newsAnalysis.isLoading}
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
          { id: "news", label: "ニュース分析", content: newsAnalysisTab },
        ]}
        defaultTab={symbol ? "stock" : undefined}
      />
    </div>
  );
}
