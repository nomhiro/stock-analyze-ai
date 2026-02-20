"use client";

import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";

interface AnalysisPanelProps {
  result: string;
  isLoading: boolean;
  error: string | null;
}

export function AnalysisPanel({ result, isLoading, error }: AnalysisPanelProps) {
  if (error) {
    return (
      <Card className="border-negative/30 bg-negative/5">
        <p className="text-sm text-negative">{error}</p>
      </Card>
    );
  }

  if (isLoading && !result) {
    return (
      <Card>
        <Loading text="AI分析を実行中..." />
      </Card>
    );
  }

  if (!result) return null;

  // Try to parse as JSON for structured display
  let parsed: Record<string, unknown> | null = null;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // not valid JSON yet (streaming), show raw
  }

  if (parsed) {
    return <StructuredResult data={parsed} isLoading={isLoading} />;
  }

  return (
    <Card>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
        {result}
        {isLoading && <span className="animate-pulse">|</span>}
      </pre>
    </Card>
  );
}

function StructuredResult({
  data,
  isLoading,
}: {
  data: Record<string, unknown>;
  isLoading: boolean;
}) {
  const summary = data.summary as string | undefined;
  const tradingSignal = data.tradingSignal as Record<string, unknown> | undefined;
  const investmentDecision = data.investmentDecision as Record<string, unknown> | undefined;
  const risks = data.risks as string[] | undefined;

  const signal = tradingSignal || investmentDecision;
  const action =
    (signal?.action as string) || (signal?.recommendation as string);
  const confidence = signal?.confidence as string;

  const actionColors: Record<string, string> = {
    buy: "text-positive",
    strong_buy: "text-positive",
    sell: "text-negative",
    strong_sell: "text-negative",
    hold: "text-yellow-500",
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Signal */}
        {action && (
          <div className="flex items-center gap-3 rounded-lg bg-background p-3">
            <span
              className={`text-lg font-bold uppercase ${actionColors[action] || "text-foreground"}`}
            >
              {action.replace("_", " ")}
            </span>
            {confidence && (
              <span className="text-sm text-muted">
                信頼度: {confidence}
              </span>
            )}
            {!!(signal?.targetPrice12M || signal?.targetPrice) && (
              <span className="text-sm">
                目標: ¥
                {(
                  (signal.targetPrice12M as number) ||
                  (signal.targetPrice as number)
                )?.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <h4 className="mb-1 text-xs font-semibold text-muted">要約</h4>
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Risks */}
        {risks && risks.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-semibold text-muted">
              リスク要因
            </h4>
            <ul className="list-inside list-disc space-y-0.5 text-sm text-muted">
              {risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && <Loading text="分析を継続中..." />}
      </div>
    </Card>
  );
}
