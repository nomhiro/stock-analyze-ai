"use client";

import Link from "next/link";
import useSWR from "swr";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StockSearchBar } from "./StockSearchBar";
import { formatPercent } from "@/lib/utils/formatters";
import type { StockQuote } from "@/lib/types/stock";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StockWatchlistProps {
  symbols: string[];
  onRemove: (symbol: string) => void;
}

export function StockWatchlist({ symbols, onRemove }: StockWatchlistProps) {
  const { data: quotes } = useSWR<StockQuote[]>(
    symbols.length > 0
      ? `/api/stocks/quotes?symbols=${symbols.join(",")}`
      : null,
    fetcher,
    { dedupingInterval: 60_000 },
  );

  const quoteMap = new Map(quotes?.map((q) => [q.symbol, q]) ?? []);

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
          {symbols.map((symbol) => {
            const quote = quoteMap.get(symbol);
            return (
              <div
                key={symbol}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-card-border/20"
              >
                <Link
                  href={`/stocks/${encodeURIComponent(symbol)}`}
                  className="flex-1 hover:text-accent"
                >
                  <div className="text-sm font-medium">
                    {quote?.name ?? symbol}
                  </div>
                  <div className="text-xs text-muted">{symbol}</div>
                </Link>
                {quote && (
                  <div className="mr-3 text-right">
                    <div className="text-sm">
                      {quote.price.toLocaleString("ja-JP", {
                        maximumFractionDigits: 1,
                      })}
                    </div>
                    <div
                      className={`text-xs font-medium ${quote.changePercent >= 0 ? "text-positive" : "text-negative"}`}
                    >
                      {formatPercent(quote.changePercent)}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => onRemove(symbol)}
                  className="text-muted hover:text-negative"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
