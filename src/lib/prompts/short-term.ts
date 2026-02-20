import type { StockHistoryEntry } from "@/lib/types/stock";

export const SHORT_TERM_SYSTEM_PROMPT = `あなたはプロの短期トレーディングアナリストです。日本株市場を専門とし、テクニカル分析とニュースセンチメント分析に基づいて短期的な売買判断を提供します。分析結果は必ず指定されたJSON形式で出力してください。`;

export function buildShortTermUserPrompt(params: {
  symbol: string;
  name: string;
  currentPrice: number;
  recentHistory: StockHistoryEntry[];
  newsHeadlines: string[];
}): string {
  const historyStr = params.recentHistory
    .slice(-30)
    .map(
      (d) =>
        `${d.date}: 始=${d.open} 高=${d.high} 安=${d.low} 終=${d.close} 出来高=${d.volume}`,
    )
    .join("\n");

  const newsStr =
    params.newsHeadlines.length > 0
      ? params.newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n")
      : "関連ニュースなし";

  return `## 対象銘柄: ${params.symbol} (${params.name})
## 現在価格: ¥${params.currentPrice}

## 直近の価格履歴 (最大30営業日):
${historyStr}

## 関連ニュース:
${newsStr}

## 分析要件:
1-5日の短期トレーディング視点で分析してください。
以下のJSON構造で回答してください:

{
  "technicalAnalysis": {
    "trend": "bullish" | "bearish" | "neutral",
    "supportLevels": [数値, 数値],
    "resistanceLevels": [数値, 数値],
    "movingAverages": {
      "sma5": 数値,
      "sma25": 数値,
      "sma75": 数値,
      "crossoverSignal": "説明文"
    },
    "volumeAnalysis": "説明文",
    "momentum": "説明文"
  },
  "sentimentAnalysis": {
    "newsSentiment": "positive" | "negative" | "mixed",
    "marketMood": "説明文",
    "keyDrivers": ["要因1", "要因2"]
  },
  "tradingSignal": {
    "action": "buy" | "sell" | "hold",
    "confidence": "high" | "medium" | "low",
    "entryPrice": 数値 or null,
    "stopLoss": 数値 or null,
    "targetPrice": 数値 or null,
    "rationale": "根拠の説明"
  },
  "risks": ["リスク1", "リスク2"],
  "summary": "日本語での要約 (2-3文)"
}

重要: 提供された価格データからテクニカル指標を計算してください。具体的な価格水準を示してください。`;
}
