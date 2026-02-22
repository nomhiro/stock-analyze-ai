"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { WatchlistToggleButton } from "@/components/stocks/WatchlistToggleButton";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { StockQuoteCard } from "@/components/stocks/StockQuoteCard";
import { StockFundamentals } from "@/components/stocks/StockFundamentals";
import { IndicatorToggle } from "@/components/stocks/IndicatorToggle";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { formatJPY, formatPercent } from "@/lib/utils/formatters";
import type { HistoryPeriod } from "@/lib/types/stock";

const periods: { value: HistoryPeriod; label: string }[] = [
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
];

interface StockDetailClientProps {
  symbol: string;
}

export function StockDetailClient({ symbol }: StockDetailClientProps) {
  const [period, setPeriod] = useState<HistoryPeriod>("1y");
  const [indicators, setIndicators] = useState({
    sma: true,
    bb: false,
  });

  const { quote, isLoading: quoteLoading, refresh: refreshQuote } = useStockQuote(symbol);
  const { history, isLoading: historyLoading, refresh: refreshHistory } = useStockHistory(symbol, period);

  const handleRefresh = () => {
    refreshQuote();
    refreshHistory();
  };

  const toggleIndicator = (id: string) => {
    setIndicators((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  if (quoteLoading || historyLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading text="データを取得中..." />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center text-muted">
        銘柄 {symbol} のデータが見つかりません
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {quote.name}
            <span className="ml-2 text-base font-normal text-muted">
              ({quote.symbol})
            </span>
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>{quote.exchange}</span>
            <span>{quote.currency}</span>
            <Badge>{quote.marketState}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <WatchlistToggleButton symbol={symbol} size="md" />
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            更新
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatJPY(quote.price)}</span>
        <span
          className={`text-lg font-medium ${isPositive ? "text-positive" : "text-negative"}`}
        >
          {isPositive ? "+" : ""}
          {quote.change.toFixed(0)} ({formatPercent(quote.changePercent)})
        </span>
      </div>

      {/* Period selector + Indicator toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-accent text-white"
                  : "bg-card-border/30 text-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <IndicatorToggle
          indicators={[
            { id: "sma", label: "SMA", active: indicators.sma },
            { id: "bb", label: "BB", active: indicators.bb },
          ]}
          onToggle={toggleIndicator}
        />
      </div>

      {/* Chart */}
      {history && history.length > 0 ? (
        <CandlestickChart
          data={history}
          height={420}
          showSMA={indicators.sma}
          showBB={indicators.bb}
        />
      ) : (
        <div className="flex h-[420px] items-center justify-center rounded-xl border border-card-border bg-card text-muted">
          チャートデータがありません
        </div>
      )}

      {/* Quote details */}
      <StockQuoteCard quote={quote} />

      {/* Fundamentals */}
      <StockFundamentals quote={quote} />

      {/* AI Analysis link */}
      <Link
        href={`/analysis?symbol=${encodeURIComponent(symbol)}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-accent transition-colors hover:bg-accent/10"
      >
        <BrainCircuit className="h-5 w-5" />
        <span className="font-medium">この銘柄をAI分析する</span>
      </Link>
    </div>
  );
}
