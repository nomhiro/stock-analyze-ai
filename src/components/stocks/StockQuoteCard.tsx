import { Card } from "@/components/ui/Card";
import { formatJPY, formatVolume } from "@/lib/utils/formatters";
import type { StockQuote } from "@/lib/types/stock";

interface StockQuoteCardProps {
  quote: StockQuote;
}

export function StockQuoteCard({ quote }: StockQuoteCardProps) {
  const items = [
    { label: "始値", value: quote.open != null ? formatJPY(quote.open) : "-" },
    { label: "高値", value: quote.high != null ? formatJPY(quote.high) : "-" },
    { label: "安値", value: quote.low != null ? formatJPY(quote.low) : "-" },
    { label: "終値/現在値", value: formatJPY(quote.price) },
    {
      label: "出来高",
      value: quote.volume != null ? formatVolume(quote.volume) : "-",
    },
    {
      label: "前日終値",
      value:
        quote.previousClose != null ? formatJPY(quote.previousClose) : "-",
    },
    {
      label: "52週高値",
      value:
        quote.fiftyTwoWeekHigh != null
          ? formatJPY(quote.fiftyTwoWeekHigh)
          : "-",
    },
    {
      label: "52週安値",
      value:
        quote.fiftyTwoWeekLow != null
          ? formatJPY(quote.fiftyTwoWeekLow)
          : "-",
    },
  ];

  return (
    <Card title="株価情報">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
