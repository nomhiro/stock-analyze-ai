"use client";

import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { formatPercent, formatMarketTime } from "@/lib/utils/formatters";
import { useMarketOverview } from "@/hooks/useMarketOverview";

export function MarketOverview() {
  const { overview, marketTime, isLoading, refresh } = useMarketOverview();

  return (
    <Card title="市場概況">
      {isLoading ? (
        <Loading text="市場データを取得中..." />
      ) : (
        <>
          {marketTime && (
            <p className="-mt-2 mb-3 text-xs text-muted">
              {formatMarketTime(marketTime)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {overview?.map((idx) => {
              const isPositive = idx.change >= 0;
              return (
                <div key={idx.symbol} className="rounded-lg bg-background p-3">
                  <div className="text-xs text-muted">{idx.name}</div>
                  <div className="mt-1 text-lg font-bold">
                    {idx.price.toLocaleString("ja-JP", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-sm font-medium ${isPositive ? "text-positive" : "text-negative"}`}
                  >
                    {formatPercent(idx.changePercent)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!isLoading && overview && (
        <button
          onClick={() => refresh()}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          データを更新
        </button>
      )}
    </Card>
  );
}
