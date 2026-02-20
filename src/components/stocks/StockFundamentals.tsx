import { Card } from "@/components/ui/Card";
import { formatLargeNumber } from "@/lib/utils/formatters";
import type { StockQuote } from "@/lib/types/stock";

interface StockFundamentalsProps {
  quote: StockQuote;
}

export function StockFundamentals({ quote }: StockFundamentalsProps) {
  const items = [
    {
      label: "時価総額",
      value:
        quote.marketCap != null
          ? `¥${formatLargeNumber(quote.marketCap)}`
          : "-",
    },
    {
      label: "PER",
      value:
        quote.trailingPE != null ? `${quote.trailingPE.toFixed(1)}x` : "-",
    },
    {
      label: "PBR",
      value:
        quote.priceToBook != null ? `${quote.priceToBook.toFixed(2)}x` : "-",
    },
    {
      label: "配当利回り",
      value:
        quote.dividendYield != null
          ? `${(quote.dividendYield * 100).toFixed(2)}%`
          : "-",
    },
    {
      label: "EPS",
      value:
        quote.epsTrailingTwelveMonths != null
          ? `¥${quote.epsTrailingTwelveMonths.toFixed(0)}`
          : "-",
    },
  ];

  return (
    <Card title="財務指標">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-xs text-muted">{item.label}</div>
            <div className="text-sm font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
