"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { useMarketRanking } from "@/hooks/useMarketRanking";
import { formatPercent } from "@/lib/utils/formatters";
import type { StockQuote } from "@/lib/types/stock";

function RankingList({
  stocks,
  type,
}: {
  stocks: StockQuote[];
  type: "gainer" | "loser";
}) {
  const Icon = type === "gainer" ? TrendingUp : TrendingDown;
  const colorClass = type === "gainer" ? "text-positive" : "text-negative";

  return (
    <div className="space-y-1">
      {stocks.map((stock, index) => (
        <Link
          key={stock.symbol}
          href={`/stocks/${encodeURIComponent(stock.symbol)}`}
          className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-card-border/20"
        >
          <div className="flex items-center gap-2">
            <span className="w-5 text-center text-xs font-bold text-muted">
              {index + 1}
            </span>
            <div>
              <div className="text-sm font-medium">{stock.name}</div>
              <div className="text-xs text-muted">{stock.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              {stock.price.toLocaleString("ja-JP", {
                maximumFractionDigits: 1,
              })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-xs font-medium ${colorClass}`}
            >
              <Icon className="h-3 w-3" />
              {formatPercent(stock.changePercent)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface MarketRankingProps {
  symbols: string[];
}

export function MarketRanking({ symbols }: MarketRankingProps) {
  const { ranking, isLoading, refresh, isEmpty } = useMarketRanking(
    symbols,
    5,
  );

  if (isEmpty) {
    return (
      <Card title="ウォッチリスト ランキング">
        <p className="text-sm text-muted">
          ウォッチリストに銘柄を追加すると、値上がり・値下がりランキングが表示されます。
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="上昇率ランキング">
        {isLoading ? (
          <Loading text="データを取得中..." />
        ) : ranking ? (
          <RankingList stocks={ranking.gainers} type="gainer" />
        ) : (
          <p className="text-sm text-muted">データの取得に失敗しました</p>
        )}
      </Card>
      <Card title="下落率ランキング">
        {isLoading ? (
          <Loading text="データを取得中..." />
        ) : ranking ? (
          <RankingList stocks={ranking.losers} type="loser" />
        ) : (
          <p className="text-sm text-muted">データの取得に失敗しました</p>
        )}
      </Card>
      {!isLoading && ranking && (
        <div className="col-span-full text-right">
          <button
            onClick={() => refresh()}
            className="text-xs text-muted hover:text-foreground"
          >
            データを更新
          </button>
        </div>
      )}
    </div>
  );
}
