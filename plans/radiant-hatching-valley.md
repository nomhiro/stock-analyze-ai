# 株銘柄分析AIプロダクト - 実装計画

## Context

日本市場の株式を分析するWebアプリケーションを新規構築する。日本の経済・技術動向のニュースからAIが関連業界・銘柄をピックアップし、短期・長期の2つの視点で分析を提供する。現在リポジトリは空の状態。将来的にアメリカ市場にも対応予定。

## 技術スタック

| 項目 | 選定技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) - フロント＆API両方 |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| 株価データ | yahoo-finance2 (日本株: `7203.T` 形式) |
| ニュースAPI | finlight.me (無料枠: 10,000 req/月) |
| AI分析 | Azure OpenAI GPT-5.1 (temperatureパラメータなし) |
| 株価チャート | lightweight-charts (TradingView) |
| ダッシュボードチャート | recharts |
| データ取得 | SWR |
| バリデーション | zod |
| デプロイ先 | Azure Static Web Apps (hybrid mode) |

## 設計思想: 事実とAI分析の分離

> **ファクト（事実）ページ** と **AI分析（推測）ページ** を明確に分離する。
> 株価・チャート・財務指標は客観的データとして提示し、AIによる分析・推薦は別ページで行う。
> ユーザーが「事実」と「推測」を混同しない設計にする。

## アーキテクチャ

```
ブラウザ (React)
  │
  ├─── 【ファクト（事実）ゾーン】
  │    ├── ダッシュボード (/)          … 日本市場概況、ウォッチリスト
  │    ├── 銘柄検索 (/stocks)         … 日本株の銘柄検索・一覧
  │    └── 銘柄詳細 (/stocks/[symbol]) … チャート、テクニカル指標、財務指標
  │
  └─── 【AI分析（推測）ゾーン】
       └── AI分析 (/analysis)          … 短期/長期AI分析、ニュース→銘柄マッピング
        │
        ▼
Next.js API Routes (サーバーレス)
  ├── /api/stocks/quote     … yahoo-finance2 で現在値取得
  ├── /api/stocks/history   … yahoo-finance2 でOHLCV取得
  ├── /api/stocks/search    … 銘柄検索
  ├── /api/news/articles    … finlight.me からニュース取得
  ├── /api/analysis/short-term  … 短期AI分析 (ストリーミング)
  ├── /api/analysis/long-term   … 長期AI分析 (ストリーミング)
  └── /api/analysis/news-mapping … ニュース→銘柄マッピング (ストリーミング)
        │
        ▼
外部サービス
  ├── yahoo-finance2 (日本株価: *.T)
  ├── finlight.me (日本・世界のニュース)
  └── Azure OpenAI GPT-5.1 (AI分析)
```

## ページ構成と画面設計

### 📊 銘柄詳細ページ (`/stocks/[symbol]`) — ファクトページ

テクニカル指標は**中級レベル**: ローソク足 + 出来高 + SMA + ボリンジャーバンド、RSI・MACDはサブチャートでトグル切替。

```
┌─────────────────────────────────────────────────────┐
│  トヨタ自動車 (7203.T)      ¥2,850  +45 (+1.6%)    │
│  東証プライム │ 自動車                               │
├─────────────────────────────────────────────────────┤
│ 期間: [1M] [3M] [6M] [1Y] [5Y]                     │
│ 指標: [SMA ✓] [BB ✓] [VWAP]                        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │     ローソク足チャート (メイン)           │        │
│  │     ---- SMA(5/25/75)                   │        │
│  │     ···· ボリンジャーバンド(±2σ)         │        │
│  │                                         │        │
│  │     ▁▂▃▅▃▂▁▂▃ 出来高バー               │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─── RSI (14) ──────────────┐  ← トグルで表示/非表示│
│  │  ~~~~  70ライン / 30ライン │                      │
│  └───────────────────────────┘                      │
│  ┌─── MACD ──────────────────┐  ← トグルで表示/非表示│
│  │  MACD線 / シグナル線       │                      │
│  │  ▁▂▃▅▃▂ ヒストグラム      │                      │
│  └───────────────────────────┘                      │
├─────────────────────────────────────────────────────┤
│ 株価情報                                             │
│ ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ 始値     │ 高値     │ 安値     │ 終値     │       │
│ │ ¥2,820   │ ¥2,870   │ ¥2,810   │ ¥2,850   │       │
│ └──────────┴──────────┴──────────┴──────────┘       │
│ 出来高: 5,230,000  │  52週高値: ¥3,100              │
│ 売買代金: ¥14.9億  │  52週安値: ¥2,200              │
├─────────────────────────────────────────────────────┤
│ 財務指標                                             │
│ ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ 時価総額  │ PER     │ PBR     │ 配当利回り │       │
│ │ ¥35.2兆  │ 12.5x   │ 1.1x    │ 2.8%     │       │
│ ├──────────┼──────────┼──────────┼──────────┤       │
│ │ ROE      │ 自己資本 │ 営業利益 │ EPS      │       │
│ │ 10.2%    │ 45.3%   │ 8.5%    │ ¥228     │       │
│ └──────────┴──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────────────┤
│ [🤖 この銘柄をAI分析する →]  (→ /analysis へ遷移)    │
└─────────────────────────────────────────────────────┘
```

### 🤖 AI分析ページ (`/analysis`) — 推測ページ

AI分析は独立したページ。銘柄詳細から遷移 or 直接アクセス。

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ AI分析は参考情報です。投資判断はご自身の責任で。   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [銘柄分析] タブ  │  [トレンド分析] タブ              │
│                                                     │
│ ─── 銘柄分析タブ ───────────────────────────────── │
│ 対象銘柄: [7203.T トヨタ ▼]                         │
│ 分析タイプ: [短期(1-5日)] [長期(6ヶ月〜)]           │
│ [▶ 分析実行]                                        │
│                                                     │
│ ┌─ 分析結果 (ストリーミング表示) ────────────┐      │
│ │ テクニカル分析:                             │      │
│ │   トレンド: 上昇 │ 支持線: ¥2,800          │      │
│ │   抵抗線: ¥2,900 │ SMA(25): ¥2,830        │      │
│ │                                             │      │
│ │ センチメント: やや強気                       │      │
│ │   主要ドライバー: EV販売好調、円安恩恵      │      │
│ │                                             │      │
│ │ シグナル: 買い (信頼度: 中)                  │      │
│ │   エントリー: ¥2,840  SL: ¥2,780           │      │
│ │   ターゲット: ¥2,950                        │      │
│ │                                             │      │
│ │ リスク: 米国関税リスク、半導体不足           │      │
│ └─────────────────────────────────────────────┘      │
│                                                     │
│ ─── トレンド分析タブ ──────────────────────────── │
│ [▶ 最新ニュースからトレンド分析]                     │
│                                                     │
│ テーマ1: AI半導体需要の急拡大                        │
│   影響業界: 半導体, クラウド                          │
│   関連技術: GPU, HBM                                 │
│   推薦銘柄:                                          │
│   ┌────────┬────────────┬────────────────────┐      │
│   │ 6857.T │ アドバンテスト │ 半導体検査装置大手 │      │
│   │ 8035.T │ 東京エレクトロン │ 製造装置で直接恩恵│     │
│   └────────┴────────────┴────────────────────┘      │
│                                                     │
│ テーマ2: ...                                         │
└─────────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx                    # ルートレイアウト (ナビ: ファクト/AI分析の切替)
│   ├── page.tsx                      # ダッシュボード (/)
│   ├── globals.css
│   ├── stocks/
│   │   ├── page.tsx                  # 銘柄検索 (/stocks)
│   │   └── [symbol]/
│   │       └── page.tsx              # 銘柄詳細 (/stocks/7203.T) — ファクトのみ
│   ├── analysis/
│   │   └── page.tsx                  # AI分析 (/analysis) — 銘柄分析 + トレンド分析
│   └── api/
│       ├── stocks/
│       │   ├── quote/route.ts
│       │   ├── history/route.ts
│       │   └── search/route.ts
│       ├── news/
│       │   └── articles/route.ts
│       └── analysis/
│           ├── short-term/route.ts
│           ├── long-term/route.ts
│           └── news-mapping/route.ts
├── components/
│   ├── layout/                       # Header, Sidebar
│   ├── charts/
│   │   ├── CandlestickChart.tsx      # メインチャート (ローソク足+出来高+SMA+BB)
│   │   ├── RsiChart.tsx              # RSIサブチャート
│   │   ├── MacdChart.tsx             # MACDサブチャート
│   │   └── MiniChart.tsx             # ダッシュボード用スパークライン
│   ├── stocks/
│   │   ├── StockSearchBar.tsx
│   │   ├── StockQuoteCard.tsx        # 株価情報カード (OHLCV, 52週高値/安値)
│   │   ├── StockFundamentals.tsx     # 財務指標カード (PER/PBR/ROE等)
│   │   ├── StockWatchlist.tsx
│   │   ├── MarketOverview.tsx
│   │   └── IndicatorToggle.tsx       # テクニカル指標ON/OFFトグル
│   ├── analysis/
│   │   ├── AnalysisPanel.tsx         # AI分析結果表示 (ストリーミング)
│   │   ├── AnalysisToggle.tsx        # 短期↔長期切替
│   │   ├── SymbolSelector.tsx        # 分析対象銘柄選択
│   │   ├── NewsFeed.tsx              # ニュース一覧
│   │   ├── NewsArticleCard.tsx
│   │   ├── TrendThemeCard.tsx        # トレンドテーマ表示カード
│   │   └── StockRecommendations.tsx  # 推薦銘柄テーブル
│   └── ui/                           # Button, Card, Loading, Badge, Tabs, Disclaimer
├── lib/
│   ├── yahoo-finance.ts              # yahoo-finance2 ラッパー (日本株用)
│   ├── finlight.ts                   # finlight.me APIクライアント
│   ├── azure-openai.ts              # Azure OpenAI クライアント＆ストリーミングヘルパー
│   ├── prompts/
│   │   ├── short-term.ts             # 短期分析プロンプト
│   │   ├── long-term.ts              # 長期分析プロンプト
│   │   └── news-mapping.ts           # ニュース→銘柄マッピングプロンプト
│   ├── types/
│   │   ├── stock.ts
│   │   ├── analysis.ts
│   │   └── news.ts
│   └── utils/
│       ├── formatters.ts             # 日本円フォーマット、大数表示(兆/億)
│       └── validators.ts
└── hooks/
    ├── useStockQuote.ts
    ├── useStockHistory.ts
    ├── useNewsArticles.ts
    ├── useAnalysis.ts                # ストリーミングレスポンス消費
    └── useWatchlist.ts               # localStorage ベース
```

## AI分析プロンプト設計

### 短期分析 (1-5日)
- 入力: 直近30日のOHLCVデータ、現在値、関連ニュース
- 分析観点: テクニカル指標(SMA, 支持線/抵抗線, 出来高)、ニュースセンチメント、モメンタム
- 出力JSON構造:
  - `technicalAnalysis`: トレンド判定、支持線/抵抗線、移動平均クロス、出来高分析
  - `sentimentAnalysis`: ニュースセンチメント、市場ムード、主要ドライバー
  - `tradingSignal`: 売買シグナル(buy/sell/hold)、エントリー価格、ストップロス、ターゲット価格
  - `risks`: リスク要因
  - `summary`: 日本語での要約

### 長期分析 (6ヶ月〜数年)
- 入力: 12ヶ月の月次データ、時価総額、PER、配当利回り、関連ニュース
- 分析観点: バリュエーション、成長性、競争優位性、業界トレンド、マクロ要因(日銀政策・為替・地政学)
- 出力JSON構造:
  - `fundamentalAnalysis`: バリュエーション判定、成長見通し、競争力、財務健全性
  - `industryAnalysis`: セクター見通し、業界トレンド、規制要因
  - `macroFactors`: 日銀金利政策、円相場、地政学リスク
  - `investmentDecision`: 投資判断(strong_buy〜strong_sell)、12ヶ月目標株価
  - `risks`: リスク要因
  - `summary`: 日本語での要約

### ニュース→銘柄マッピング
- 入力: 直近のニュース記事群
- 分析観点: トピック抽出→影響する業界/技術の特定→具体的な日本株銘柄の推薦
- 出力JSON構造:
  - `themes[]`: テーマごとに
    - `topic`: テーマ名
    - `affectedIndustries`: 影響する業界
    - `affectedTechnologies`: 影響する技術
    - `timeHorizon`: short_term / medium_term / long_term
    - `sentiment`: bullish / bearish / neutral
    - `recommendedStocks[]`: 銘柄コード(.T)、企業名、推薦理由、関連度(direct/indirect)
  - `overallMarketSentiment`: 全体的な市場見通し
  - `keyRisks`: 主要リスク

## Azure OpenAI 連携の要点

```typescript
// GPT-5.1: temperatureパラメータは使用不可
const stream = await client.chat.completions.create({
  model: '',  // deploymentはクライアント設定で指定
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: 4096,
  // temperature は設定しない (GPT-5系では非対応)
  stream: true,
});
```

- ストリーミングレスポンスで Azure Static Apps のタイムアウト(約30秒)を回避
- openai npm パッケージの `AzureOpenAI` クラスを使用

## データ永続化

**MVP**: データベース不要
- 株価・ニュースはすべてオンデマンド取得 (ボタンクリック)
- ウォッチリスト・設定はブラウザの localStorage
- SWR でクライアント側キャッシュ (dedupingInterval: 60秒)

## 実装フェーズ

### Phase 1: プロジェクト初期化
- Next.js プロジェクト作成 (TypeScript, Tailwind CSS, App Router)
- ディレクトリ構成のセットアップ
- `.env.example`, `next.config.js` (output: 'standalone'), `staticwebapp.config.json`
- ルートレイアウト、ナビゲーション、基本UIコンポーネント (Button, Card, Loading, Badge)
- `src/lib/types/` の型定義

### Phase 2: 株価データ機能
- `src/lib/yahoo-finance.ts` ラッパー実装 (日本株 `.T` サフィックス対応)
- 3つの株価API Routes 実装 (quote, history, search)
- SWR フック (useStockQuote, useStockHistory)
- CandlestickChart コンポーネント (lightweight-charts)
- 銘柄詳細ページ (`/stocks/[symbol]`) - チャート＋現在値表示
- 銘柄検索ページ (`/stocks`) - 日本株検索

### Phase 3: ダッシュボード
- MarketOverview (主要指数: 日経225 `^N225`, TOPIX `1306.T`)
- MiniChart スパークライン (recharts)
- ウォッチリスト (localStorage) + useWatchlist フック
- ダッシュボードページ (`/`) 組み立て

### Phase 4: ニュース連携
- `src/lib/finlight.ts` APIクライアント
- `/api/news/articles` API Route
- NewsFeed / NewsArticleCard コンポーネント
- 銘柄詳細ページにニュースパネル追加
- 分析ページ (`/analysis`) レイアウト

### Phase 5: AI分析機能
- `src/lib/azure-openai.ts` クライアント＆ストリーミングヘルパー
- 3つのプロンプトテンプレート実装 (短期/長期/ニュースマッピング)
- Zod スキーマ定義 (リクエスト/レスポンス)
- 3つの分析API Routes - すべてストリーミング
- useAnalysis フック (ストリーミング消費)
- AnalysisPanel / AnalysisToggle (短期↔長期切替) コンポーネント
- StockRecommendations テーブル
- 銘柄詳細ページにAI分析パネル統合
- 分析ページにニュース→銘柄マッピング統合

### Phase 6: 仕上げ＆デプロイ
- エラーハンドリング (ErrorBoundary, API エラー)
- ローディング状態 (スケルトンスクリーン)
- レスポンシブデザイン
- GitHub Actions ワークフロー (Azure Static Web Apps)
- Azure 環境変数設定
- デプロイ＆検証

### 将来: アメリカ市場対応
- US株式の検索・表示対応 (yahoo-finance2は米国株もサポート済)
- プロンプトにUS市場コンテキスト追加
- ニュース→銘柄マッピングを日米両方に拡張

## 環境変数

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2025-04-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-51

# Finlight News API
FINLIGHT_API_KEY=your-finlight-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 検証方法

1. **株価データ**: `/stocks/7203.T` (トヨタ), `/stocks/6758.T` (ソニー) でチャートが正しく表示されること
2. **銘柄検索**: `/stocks` で「トヨタ」「ソニー」等の検索が動作すること
3. **ダッシュボード**: `/` で日経225, TOPIX の概況が表示されること
4. **ニュース**: `/analysis` でニュース記事が取得・表示されること
5. **AI分析**: 銘柄詳細ページで短期/長期分析が実行でき、ストリーミングで結果が表示されること
6. **ニュース→銘柄マッピング**: 分析ページでトレンド分析→関連日本株が構造化表示されること
7. **デプロイ**: Azure Static Web Apps で全機能が動作すること
