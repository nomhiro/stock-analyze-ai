import useSWR from "swr";
import type { StockHistoryEntry, HistoryPeriod, HistoryInterval } from "@/lib/types/stock";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStockHistory(
  symbol: string | null,
  period: HistoryPeriod = "1y",
  interval: HistoryInterval = "1d",
) {
  const { data, error, isLoading, mutate } = useSWR<StockHistoryEntry[]>(
    symbol
      ? `/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`
      : null,
    fetcher,
    { dedupingInterval: 60_000 },
  );

  return { history: data, error, isLoading, refresh: mutate };
}
