import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface DiffData {
  added: { symbol: string; name: string }[];
  removed: { symbol: string; name: string }[];
  totalBefore: number;
  totalAfter: number;
  unchanged: number;
}

interface TseStockDiffProps {
  diff: DiffData;
}

export function TseStockDiff({ diff }: TseStockDiffProps) {
  const hasChanges = diff.added.length > 0 || diff.removed.length > 0;

  return (
    <Card title="差分プレビュー">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="positive">追加: {diff.added.length}件</Badge>
        <Badge variant="negative">削除: {diff.removed.length}件</Badge>
        <Badge>変更なし: {diff.unchanged}件</Badge>
        <Badge>
          合計: {diff.totalBefore} → {diff.totalAfter}件
        </Badge>
      </div>

      {!hasChanges && (
        <p className="text-sm text-muted">
          変更はありません。データは最新です。
        </p>
      )}

      {diff.added.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-positive">
            追加された銘柄
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-card-border">
            {diff.added.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between border-b border-card-border px-3 py-1.5 text-sm last:border-b-0"
              >
                <span className="font-mono text-positive">{s.symbol}</span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {diff.removed.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-negative">
            削除された銘柄
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-card-border">
            {diff.removed.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between border-b border-card-border px-3 py-1.5 text-sm last:border-b-0"
              >
                <span className="font-mono text-negative">{s.symbol}</span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
