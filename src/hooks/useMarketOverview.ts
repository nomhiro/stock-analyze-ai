import useSWR from "swr";
import type { StockQuote } from "@/lib/types/stock";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const MARKET_INDICES = [
  { symbol: "^N225", name: "日経225" },
  { symbol: "^TOPX", name: "TOPIX" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "USDJPY=X", name: "USD/JPY" },
] as const;

export interface MarketIndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const SYMBOLS_KEY = `/api/stocks/quotes?symbols=${MARKET_INDICES.map((i) => i.symbol).join(",")}`;

const nameMap = new Map(MARKET_INDICES.map((i) => [i.symbol, i.name]));

function toOverview(quotes: StockQuote[]): MarketIndexData[] {
  return MARKET_INDICES.map((idx) => {
    const q = quotes.find((quote) => quote.symbol === idx.symbol);
    return {
      symbol: idx.symbol,
      name: nameMap.get(idx.symbol) ?? idx.symbol,
      price: q?.price ?? 0,
      change: q?.change ?? 0,
      changePercent: q?.changePercent ?? 0,
    };
  });
}

export function useMarketOverview() {
  const { data, error, isLoading, mutate } = useSWR<StockQuote[]>(
    SYMBOLS_KEY,
    fetcher,
    { dedupingInterval: 60_000 },
  );

  const overview: MarketIndexData[] | undefined = data
    ? toOverview(data)
    : undefined;

  // 日本市場（日経225）のマーケット時刻を優先して取得
  const marketTime: string | undefined = data
    ? (data.find((q) => q.regularMarketTime && q.symbol === "^N225")
        ?.regularMarketTime ??
      data.find((q) => q.regularMarketTime)?.regularMarketTime)
    : undefined;

  return { overview, marketTime, error, isLoading, refresh: mutate };
}
