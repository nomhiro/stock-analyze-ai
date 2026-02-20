import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NewsMappingTheme } from "@/lib/types/analysis";

interface TrendThemeCardProps {
  theme: NewsMappingTheme;
}

export function TrendThemeCard({ theme }: TrendThemeCardProps) {
  const sentimentVariant =
    theme.sentiment === "bullish"
      ? "positive"
      : theme.sentiment === "bearish"
        ? "negative"
        : "default";

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{theme.topic}</h3>
        <Badge variant={sentimentVariant}>{theme.sentiment}</Badge>
      </div>

      {theme.description && (
        <p className="text-sm text-muted">{theme.description}</p>
      )}

      <div className="flex flex-wrap gap-1">
        {theme.affectedIndustries.map((ind) => (
          <Badge key={ind}>{ind}</Badge>
        ))}
        {theme.affectedTechnologies.map((tech) => (
          <Badge key={tech} variant="warning">
            {tech}
          </Badge>
        ))}
      </div>

      {theme.recommendedStocks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-xs text-muted">
                <th className="pb-1 pr-3">銘柄</th>
                <th className="pb-1 pr-3">企業名</th>
                <th className="pb-1">推薦理由</th>
              </tr>
            </thead>
            <tbody>
              {theme.recommendedStocks.map((stock) => (
                <tr key={stock.symbol} className="border-b border-card-border/50">
                  <td className="py-1.5 pr-3">
                    <a
                      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {stock.symbol}
                    </a>
                  </td>
                  <td className="py-1.5 pr-3">{stock.name}</td>
                  <td className="py-1.5 text-muted">{stock.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
