"use client";

import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { StockWatchlist } from "@/components/stocks/StockWatchlist";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function StocksPage() {
  const { symbols, add, remove } = useWatchlist();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">銘柄検索</h1>
      <StockSearchBar />

      <div className="mt-8">
        <StockWatchlist symbols={symbols} onRemove={remove} onAdd={add} />
      </div>
    </div>
  );
}
