import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface TseStockStatusProps {
  totalStocks: number;
  generatedDate: string;
}

export function TseStockStatus({
  totalStocks,
  generatedDate,
}: TseStockStatusProps) {
  return (
    <Card title="TSE銘柄データ ステータス">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">登録銘柄数</span>
          <Badge>{totalStocks.toLocaleString()} 件</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">最終更新日</span>
          <span className="text-sm font-mono">{generatedDate}</span>
        </div>
      </div>
    </Card>
  );
}
