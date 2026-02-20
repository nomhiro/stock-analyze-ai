import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
      <p className="text-xs text-yellow-500/80">
        AI分析は参考情報です。投資判断はご自身の責任で行ってください。
      </p>
    </div>
  );
}
