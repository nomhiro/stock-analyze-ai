import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { stockMaster } from "@/lib/data/stock-master";

export default function StocksPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">銘柄検索</h1>
      <StockSearchBar />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">主要銘柄</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stockMaster.map((stock) => (
            <a
              key={stock.symbol}
              href={`/stocks/${encodeURIComponent(stock.symbol)}`}
              className="flex items-center justify-between rounded-lg border border-card-border bg-card px-4 py-3 transition-colors hover:border-accent/30 hover:bg-card-border/20"
            >
              <div>
                <div className="font-medium">{stock.name}</div>
                <div className="text-sm text-muted">
                  {stock.symbol}
                  <span className="ml-2 text-xs">{stock.sector}</span>
                </div>
              </div>
              <span className="text-muted">&rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
