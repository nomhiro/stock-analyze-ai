export type AnalysisType = "short-term" | "long-term";

export interface ShortTermAnalysis {
  technicalAnalysis: {
    trend: "bullish" | "bearish" | "neutral";
    supportLevels: number[];
    resistanceLevels: number[];
    movingAverages: {
      sma5: number;
      sma25: number;
      sma75: number;
      crossoverSignal: string;
    };
    volumeAnalysis: string;
    momentum: string;
  };
  sentimentAnalysis: {
    newsSentiment: "positive" | "negative" | "mixed";
    marketMood: string;
    keyDrivers: string[];
  };
  tradingSignal: {
    action: "buy" | "sell" | "hold";
    confidence: "high" | "medium" | "low";
    entryPrice: number | null;
    stopLoss: number | null;
    targetPrice: number | null;
    rationale: string;
  };
  risks: string[];
  summary: string;
}

export interface LongTermAnalysis {
  fundamentalAnalysis: {
    valuation: "undervalued" | "fairly_valued" | "overvalued";
    valuationRationale: string;
    growthProspects: "high" | "moderate" | "low";
    growthDrivers: string[];
    competitivePosition: string;
    financialHealth: string;
  };
  industryAnalysis: {
    sectorOutlook: "positive" | "neutral" | "negative";
    industryTrends: string[];
    competitiveThreats: string[];
    regulatoryFactors: string;
  };
  macroFactors: {
    bojPolicyImpact: string;
    currencyExposure: string;
    geopoliticalRisks: string[];
    economicCyclePosition: string;
  };
  investmentDecision: {
    recommendation:
      | "strong_buy"
      | "buy"
      | "hold"
      | "sell"
      | "strong_sell";
    confidence: "high" | "medium" | "low";
    targetPrice12M: number | null;
    expectedReturn: string;
    rationale: string;
  };
  risks: string[];
  summary: string;
}

export interface NewsMappingTheme {
  topic: string;
  description: string;
  affectedIndustries: string[];
  affectedTechnologies: string[];
  timeHorizon: "short_term" | "medium_term" | "long_term";
  sentiment: "bullish" | "bearish" | "neutral";
  recommendedStocks: {
    symbol: string;
    name: string;
    reason: string;
    exposure: "direct" | "indirect";
  }[];
}

export interface NewsMappingResult {
  newsSummary: string;
  themes: NewsMappingTheme[];
  overallMarketSentiment: string;
  keyRisks: string[];
}
