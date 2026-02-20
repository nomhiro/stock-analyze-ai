import useSWR from "swr";
import type { StockQuote } from "@/lib/types/stock";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface MarketRanking {
  gainers: StockQuote[];
  losers: StockQuote[];
}

function computeRanking(quotes: StockQuote[], count: number): MarketRanking {
  const valid = quotes.filter((q) => q.price > 0);
  const sorted = [...valid].sort((a, b) => b.changePercent - a.changePercent);

  return {
    gainers: sorted.slice(0, count),
    losers: sorted.slice(-count).reverse(),
  };
}

export function useMarketRanking(symbols: string[], count: number = 5) {
  const key =
    symbols.length > 0
      ? `/api/stocks/quotes?symbols=${symbols.join(",")}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<StockQuote[]>(
    key,
    fetcher,
    { dedupingInterval: 60_000 },
  );

  const ranking: MarketRanking | undefined = data
    ? computeRanking(data, count)
    : undefined;

  const isEmpty = symbols.length === 0;

  return { ranking, error, isLoading, refresh: mutate, isEmpty };
}
