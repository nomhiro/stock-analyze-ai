"use client";

import { MarketOverview } from "@/components/stocks/MarketOverview";
import { MarketRanking } from "@/components/stocks/MarketRanking";
import { StockWatchlist } from "@/components/stocks/StockWatchlist";
import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function DashboardPage() {
  const { symbols, remove } = useWatchlist();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日本市場ダッシュボード</h1>
        <StockSearchBar />
      </div>
      <MarketOverview />
      <MarketRanking symbols={symbols} />
      <StockWatchlist symbols={symbols} onRemove={remove} />
    </div>
  );
}
