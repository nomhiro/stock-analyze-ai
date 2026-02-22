"use client";

import { useState } from "react";
import { BarChart3, Star } from "lucide-react";
import { MarketOverview } from "@/components/stocks/MarketOverview";
import { MarketRanking } from "@/components/stocks/MarketRanking";
import { StockWatchlist } from "@/components/stocks/StockWatchlist";
import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { MAJOR_TSE_SYMBOLS } from "@/lib/data/major-stocks";

export type ViewMode = "all" | "watchlist";

export default function DashboardPage() {
  const { symbols, add, remove } = useWatchlist();
  const [viewMode, setViewMode] = useState<ViewMode>("watchlist");

  const rankingSymbols =
    viewMode === "all" ? MAJOR_TSE_SYMBOLS : symbols;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日本市場ダッシュボード</h1>
        <StockSearchBar />
      </div>
      <MarketOverview />
      <div className="flex items-center gap-1 rounded-lg border border-card-border bg-card p-1">
        <button
          onClick={() => setViewMode("all")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "all"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          全銘柄
        </button>
        <button
          onClick={() => setViewMode("watchlist")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "watchlist"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          ウォッチリスト
        </button>
      </div>
      <MarketRanking symbols={rankingSymbols} viewMode={viewMode} />
      {viewMode === "watchlist" && (
        <StockWatchlist symbols={symbols} onRemove={remove} onAdd={add} />
      )}
    </div>
  );
}
