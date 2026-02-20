"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useWatchlist } from "@/hooks/useWatchlist";
import { StockSearchBar } from "./StockSearchBar";

export function StockWatchlist() {
  const { symbols, remove } = useWatchlist();

  return (
    <Card title="ウォッチリスト">
      {symbols.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            ウォッチリストに銘柄がありません。銘柄を検索して追加してください。
          </p>
          <StockSearchBar />
        </div>
      ) : (
        <div className="space-y-1">
          {symbols.map((symbol) => (
            <div
              key={symbol}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-card-border/20"
            >
              <Link
                href={`/stocks/${encodeURIComponent(symbol)}`}
                className="text-sm font-medium hover:text-accent"
              >
                {symbol}
              </Link>
              <button
                onClick={() => remove(symbol)}
                className="text-muted hover:text-negative"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
