# Stock Analyzer - 日本株分析AI

日本市場の株式データを可視化し、Azure OpenAI による短期・長期のAI分析を提供するWebアプリケーション。

## 設計思想

**ファクト（事実）** と **AI分析（推測）** を明確に分離しています。

| ゾーン | ページ | 内容 |
|---|---|---|
| ファクト | `/` | ダッシュボード（市場概況・ウォッチリスト） |
| ファクト | `/stocks` | 銘柄検索 |
| ファクト | `/stocks/[symbol]` | チャート・テクニカル指標・財務指標 |
| AI分析 | `/analysis` | 短期/長期AI分析・ニューストレンド分析 |

## 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| 株価データ | yahoo-finance2 (`.T` 形式) |
| ニュースAPI | finlight.me |
| AI分析 | Azure OpenAI GPT-5.1 (ストリーミング) |
| チャート | lightweight-charts (TradingView) |
| ダッシュボード | recharts |
| データ取得 | SWR |
| デプロイ | Azure Static Web Apps |

## セットアップ

### 前提条件

- Node.js 20+
- Azure OpenAI リソース（GPT-5.1 デプロイメント）
- finlight.me API キー

### APIキーの取得

**Azure OpenAI:**

1. [Azure Portal](https://portal.azure.com/) で Azure OpenAI リソースを作成
2. GPT-5.1 モデルをデプロイ
3. 「キーとエンドポイント」からエンドポイントURL と API キーを取得

**finlight.me:**

1. [finlight.me ダッシュボード](https://app.finlight.me/) にアクセス
2. 無料アカウントを作成（クレジットカード不要）
3. ダッシュボードから API キーをコピー

無料プラン（Launchpad）: 月5,000リクエスト、12時間遅延あり。本番環境では Pro プランへのアップグレードを推奨。

### インストール

```bash
npm install
```

### 環境変数

`.env.example` をコピーして `.env` を作成し、値を設定してください。

```bash
cp .env.example .env
```

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2025-04-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-51

# Finlight News API
FINLIGHT_API_KEY=your-finlight-api-key
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

### ビルド

```bash
npm run build
```

## 機能一覧

### ダッシュボード (`/`)

- 主要指数の概況（日経225、TOPIX、S&P500、USD/JPY）
- ウォッチリスト（localStorage で永続化）
- 銘柄クイック検索

### 銘柄詳細 (`/stocks/[symbol]`)

- ローソク足チャート（出来高付き）
- テクニカル指標: SMA(5/25/75)、ボリンジャーバンド(±2σ)
- サブチャート: RSI(14)、MACD（トグル切替）
- 期間切替: 1ヶ月 / 3ヶ月 / 6ヶ月 / 1年 / 5年
- 株価情報: OHLCV、52週高値/安値
- 財務指標: 時価総額、PER、PBR、配当利回り、EPS

### AI分析 (`/analysis`)

**銘柄分析タブ:**
- 短期分析（1-5日）: テクニカル指標ベースの売買シグナル
- 長期分析（6ヶ月〜）: ファンダメンタルズ＋マクロ要因の投資判断
- ストリーミングでリアルタイム表示

**トレンド分析タブ:**
- 最新ニュースから経済トレンドを抽出
- テーマごとに影響業界・技術を分析
- 関連する日本株銘柄を推薦

## プロジェクト構成

```
src/
├── app/                  # ページ & API Routes
│   ├── api/
│   │   ├── stocks/       # quote, history, search
│   │   ├── news/         # articles
│   │   └── analysis/     # short-term, long-term, news-mapping
│   ├── stocks/           # 銘柄検索・詳細ページ
│   └── analysis/         # AI分析ページ
├── components/
│   ├── layout/           # Header
│   ├── charts/           # CandlestickChart
│   ├── stocks/           # QuoteCard, Fundamentals, Watchlist, etc.
│   ├── analysis/         # AnalysisPanel, TrendThemeCard
│   └── ui/               # Button, Card, Loading, Badge, Tabs
├── hooks/                # useStockQuote, useAnalysis, etc.
└── lib/
    ├── prompts/          # AI分析プロンプト (短期/長期/ニュース)
    ├── types/            # TypeScript 型定義
    ├── utils/            # フォーマッター
    ├── yahoo-finance.ts  # 株価データ取得
    ├── finlight.ts       # ニュースAPI
    └── azure-openai.ts   # AI分析ストリーミング
```

## デプロイ

Azure Static Web Apps (hybrid mode) にデプロイされます。

GitHub に push すると `.github/workflows/azure-static-web-apps.yml` が自動実行されます。

**必要な GitHub Secrets:**
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_DEPLOYMENT_NAME`
- `FINLIGHT_API_KEY`

## ライセンス

Private
