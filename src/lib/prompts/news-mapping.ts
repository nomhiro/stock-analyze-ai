export const NEWS_MAPPING_SYSTEM_PROMPT = `あなたはニュースや経済動向から投資テーマを見出し、具体的な日本株銘柄にマッピングする専門家です。東証に上場している実在の銘柄のみを推薦してください。銘柄コードは必ず .T サフィックスを付けてください。分析結果は必ず指定されたJSON形式で出力してください。`;

export function buildNewsMappingUserPrompt(params: {
  articles: { title: string; summary: string; source: string; date: string }[];
}): string {
  const articlesStr = params.articles
    .map(
      (a, i) => `### 記事 ${i + 1}
- タイトル: ${a.title}
- 概要: ${a.summary}
- ソース: ${a.source}
- 日付: ${a.date}`,
    )
    .join("\n\n");

  return `## 最近のニュース記事:
${articlesStr}

## 分析要件:
上記のニュースから上位3〜5の投資テーマを特定し、各テーマについて日本株の推薦銘柄を提示してください。

以下のJSON構造で回答してください:

{
  "themes": [
    {
      "topic": "テーマ名",
      "description": "テーマの説明",
      "affectedIndustries": ["業界1", "業界2"],
      "affectedTechnologies": ["技術1", "技術2"],
      "timeHorizon": "short_term" | "medium_term" | "long_term",
      "sentiment": "bullish" | "bearish" | "neutral",
      "recommendedStocks": [
        {
          "symbol": "銘柄コード.T",
          "name": "企業名",
          "reason": "推薦理由",
          "exposure": "direct" | "indirect"
        }
      ]
    }
  ],
  "overallMarketSentiment": "全体的な市場見通し",
  "keyRisks": ["リスク1", "リスク2"]
}

重要: 実在の東証上場銘柄のみを使用してください。銘柄コードは必ず .T サフィックスを付けてください。`;
}
