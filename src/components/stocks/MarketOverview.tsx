"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { formatPercent } from "@/lib/utils/formatters";

interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const indices = [
  { symbol: "^N225", name: "日経225" },
  { symbol: "^TOPX", name: "TOPIX" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "USDJPY=X", name: "USD/JPY" },
];

export function MarketOverview() {
  const [data, setData] = useState<IndexData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        indices.map(async (idx) => {
          const res = await fetch(
            `/api/stocks/quote?symbol=${encodeURIComponent(idx.symbol)}`,
          );
          if (!res.ok) return null;
          const q = await res.json();
          return {
            symbol: idx.symbol,
            name: idx.name,
            price: q.price ?? 0,
            change: q.change ?? 0,
            changePercent: q.changePercent ?? 0,
          } as IndexData;
        }),
      );
      setData(results.filter((r): r is IndexData => r !== null));
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card title="市場概況">
      {isLoading ? (
        <Loading text="市場データを取得中..." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.map((idx) => {
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
      )}
      {!isLoading && data.length > 0 && (
        <button
          onClick={fetchData}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          データを更新
        </button>
      )}
    </Card>
  );
}
