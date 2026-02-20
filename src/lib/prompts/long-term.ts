import type { StockHistoryEntry } from "@/lib/types/stock";

export const LONG_TERM_SYSTEM_PROMPT = `あなたはプロの長期投資アナリストです。日本株市場を専門とし、ファンダメンタルズ分析、業界分析、マクロ経済分析に基づいて長期投資判断を提供します。分析結果は必ず指定されたJSON形式で出力してください。`;

export function buildLongTermUserPrompt(params: {
  symbol: string;
  name: string;
  currentPrice: number;
  yearlyHistory: StockHistoryEntry[];
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  eps?: number;
  newsHeadlines: string[];
}): string {
  const historyStr = params.yearlyHistory
    .map((d) => `${d.date}: 終値=${d.close} 出来高=${d.volume}`)
    .join("\n");

  const newsStr =
    params.newsHeadlines.length > 0
      ? params.newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n")
      : "関連ニュースなし";

  const fundamentals = [
    params.marketCap != null ? `時価総額: ¥${params.marketCap}` : null,
    params.peRatio != null ? `PER: ${params.peRatio}x` : null,
    params.pbRatio != null ? `PBR: ${params.pbRatio}x` : null,
    params.dividendYield != null
      ? `配当利回り: ${(params.dividendYield * 100).toFixed(2)}%`
      : null,
    params.eps != null ? `EPS: ¥${params.eps}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `## 対象銘柄: ${params.symbol} (${params.name})
## 現在価格: ¥${params.currentPrice}

## 財務指標:
${fundamentals || "データなし"}

## 価格履歴 (月次):
${historyStr}

## 関連ニュース・コンテキスト:
${newsStr}

## 分析要件:
6ヶ月〜数年の長期投資視点で分析してください。
以下のJSON構造で回答してください:

{
  "fundamentalAnalysis": {
    "valuation": "undervalued" | "fairly_valued" | "overvalued",
    "valuationRationale": "説明文",
    "growthProspects": "high" | "moderate" | "low",
    "growthDrivers": ["成長要因1", "成長要因2"],
    "competitivePosition": "説明文",
    "financialHealth": "説明文"
  },
  "industryAnalysis": {
    "sectorOutlook": "positive" | "neutral" | "negative",
    "industryTrends": ["トレンド1", "トレンド2"],
    "competitiveThreats": ["脅威1", "脅威2"],
    "regulatoryFactors": "説明文"
  },
  "macroFactors": {
    "bojPolicyImpact": "日銀政策の影響",
    "currencyExposure": "為替リスクの説明",
    "geopoliticalRisks": ["リスク1", "リスク2"],
    "economicCyclePosition": "景気循環での位置づけ"
  },
  "investmentDecision": {
    "recommendation": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
    "confidence": "high" | "medium" | "low",
    "targetPrice12M": 数値 or null,
    "expectedReturn": "期待リターンの説明",
    "rationale": "根拠の説明"
  },
  "risks": ["リスク1", "リスク2"],
  "summary": "日本語での要約 (2-3文)"
}

重要: ファンダメンタルズ、業界動向、マクロ要因を総合的に判断してください。短期的なノイズではなく、構造的な価値に焦点を当ててください。`;
}
