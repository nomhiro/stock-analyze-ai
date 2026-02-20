"use client";

import { MarketOverview } from "@/components/stocks/MarketOverview";
import { MarketRanking } from "@/components/stocks/MarketRanking";
import { StockWatchlist } from "@/components/stocks/StockWatchlist";
import { StockSearchBar } from "@/components/stocks/StockSearchBar";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日本市場ダッシュボード</h1>
        <StockSearchBar />
      </div>
      <MarketOverview />
      <MarketRanking />
      <StockWatchlist />
    </div>
  );
}
