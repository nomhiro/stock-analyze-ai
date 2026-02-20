import useSWR from "swr";
import type { StockQuote } from "@/lib/types/stock";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStockQuote(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StockQuote>(
    symbol ? `/api/stocks/quote?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher,
    { dedupingInterval: 60_000 },
  );

  return { quote: data, error, isLoading, refresh: mutate };
}
