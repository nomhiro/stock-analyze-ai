import YahooFinance from "yahoo-finance2";

let yahooFinanceInstance: InstanceType<typeof YahooFinance> | null = null;

function getYahooFinance(): InstanceType<typeof YahooFinance> {
  if (!yahooFinanceInstance) {
    yahooFinanceInstance = new YahooFinance();
  }
  return yahooFinanceInstance;
}
import type {
  StockQuote,
  StockHistoryEntry,
  StockSearchResult,
  HistoryInterval,
} from "@/lib/types/stock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeGet(obj: any, key: string): any {
  return obj?.[key];
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const quote = await getYahooFinance().quote(symbol);
  return mapQuote(quote, symbol);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuote(quote: any, fallbackSymbol?: string): StockQuote {
  return {
    symbol: (safeGet(quote, "symbol") as string) ?? fallbackSymbol ?? "",
    name:
      (safeGet(quote, "shortName") as string) ||
      (safeGet(quote, "longName") as string) ||
      (safeGet(quote, "symbol") as string) ||
      "",
    price: (safeGet(quote, "regularMarketPrice") as number) ?? 0,
    change: (safeGet(quote, "regularMarketChange") as number) ?? 0,
    changePercent:
      (safeGet(quote, "regularMarketChangePercent") as number) ?? 0,
    currency: (safeGet(quote, "currency") as string) ?? "JPY",
    marketState: (safeGet(quote, "marketState") as string) ?? "CLOSED",
    exchange: (safeGet(quote, "fullExchangeName") as string) ?? "",
    open: safeGet(quote, "regularMarketOpen") as number | undefined,
    high: safeGet(quote, "regularMarketDayHigh") as number | undefined,
    low: safeGet(quote, "regularMarketDayLow") as number | undefined,
    previousClose: safeGet(quote, "regularMarketPreviousClose") as
      | number
      | undefined,
    volume: safeGet(quote, "regularMarketVolume") as number | undefined,
    marketCap: safeGet(quote, "marketCap") as number | undefined,
    trailingPE: safeGet(quote, "trailingPE") as number | undefined,
    priceToBook: safeGet(quote, "priceToBook") as number | undefined,
    dividendYield: safeGet(quote, "dividendYield") as number | undefined,
    fiftyTwoWeekHigh: safeGet(quote, "fiftyTwoWeekHigh") as
      | number
      | undefined,
    fiftyTwoWeekLow: safeGet(quote, "fiftyTwoWeekLow") as
      | number
      | undefined,
    epsTrailingTwelveMonths: safeGet(
      quote,
      "epsTrailingTwelveMonths",
    ) as number | undefined,
  };
}

export async function getQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (symbols.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (await getYahooFinance().quote(symbols)) as any[];

  return results.map((quote) => mapQuote(quote));
}

export async function getHistory(
  symbol: string,
  period1: string,
  period2?: string,
  interval: HistoryInterval = "1d",
): Promise<StockHistoryEntry[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await getYahooFinance().chart(symbol, {
    period1,
    period2: period2 || new Date().toISOString().split("T")[0],
    interval,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.quotes || []).map((q: any) => ({
    date: new Date(q.date).toISOString().split("T")[0],
    open: q.open ?? 0,
    high: q.high ?? 0,
    low: q.low ?? 0,
    close: q.close ?? 0,
    volume: q.volume ?? 0,
  }));
}

export async function searchStocks(
  query: string,
): Promise<StockSearchResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    result = await getYahooFinance().search(query);
  } catch (error: unknown) {
    // Yahoo Finance API rejects non-ASCII (e.g. Japanese) queries with BadRequestError
    if (
      error instanceof Error &&
      error.name === "BadRequestError"
    ) {
      return [];
    }
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.quotes || [])
    .filter((q: any) => q.quoteType === "EQUITY")
    .map((q: any) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      exchange: q.exchange || "",
      type: q.quoteType || "EQUITY",
    }));
}
