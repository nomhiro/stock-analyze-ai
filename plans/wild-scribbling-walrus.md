# 銘柄マスター & 上昇率/下落率ランキング表示

## Context
ホーム画面の初期状態では市場指数（日経225等）とウォッチリストのみ表示されている。銘柄情報をマスターファイルに保管し、上昇率が高い銘柄・下落率が高い銘柄をホーム画面に表示する。

## 修正・作成ファイル一覧

| ファイル | 操作 | 目的 |
|---|---|---|
| `src/lib/data/stock-master.ts` | **新規** | 主要日本株~50銘柄のマスターデータ |
| `src/lib/yahoo-finance.ts` | **修正** | `getQuotes()` バッチ取得関数を追加 |
| `src/app/api/stocks/quotes/route.ts` | **新規** | 複数銘柄一括取得API（60秒キャッシュ付き） |
| `src/hooks/useMarketRanking.ts` | **新規** | ランキングデータ取得SWRフック |
| `src/components/stocks/MarketRanking.tsx` | **新規** | 上昇率/下落率ランキングUI |
| `src/app/page.tsx` | **修正** | MarketRankingをホーム画面に追加 |
| `src/app/stocks/page.tsx` | **修正** | ハードコードの銘柄リストをマスターファイルに置換 |

## 実装詳細

### 1. 銘柄マスターファイル (`src/lib/data/stock-master.ts`)
- 既存の12銘柄（`src/app/stocks/page.tsx`）を含む約50銘柄
- 銀行、自動車、電機、医薬、商社、通信、**エネルギー**、**建設**、**AI関連**など主要セクターをカバー
- エネルギー例: INPEX(1605.T), ENEOS(5020.T), 東京ガス(9531.T), 関西電力(9503.T)
- 建設例: 大林組(1802.T), 鹿島建設(1812.T), 大成建設(1801.T), 清水建設(1803.T)
- AI関連例: PKSHA Technology(3993.T), HEROZ(4382.T), AI inside(4488.T), ブレインパッド(3655.T)
- `symbol`, `name` を持つ配列 + `masterSymbols`（シンボル配列）をエクスポート

### 2. バッチ取得関数 (`src/lib/yahoo-finance.ts`)
- `getQuotes(symbols: string[]): Promise<StockQuote[]>` を追加
- `yahooFinance.quote(symbols[])` で1回のHTTPリクエストで全銘柄取得（v3で動作確認済み）
- 既存の `getQuote()` と同じマッピングロジックを再利用

### 3. 一括取得API (`src/app/api/stocks/quotes/route.ts`)
- `GET /api/stocks/quotes` → パラメータなしでマスター全銘柄を返却
- `GET /api/stocks/quotes?symbols=7203.T,6758.T` → 指定銘柄のみ
- サーバー側60秒インメモリキャッシュでYahoo Finance APIへの負荷を軽減

### 4. ランキングフック (`src/hooks/useMarketRanking.ts`)
- `useMarketRanking(count = 5)` → `{ gainers, losers, isLoading, refresh }`
- SWR で `/api/stocks/quotes` を取得、クライアント側で `changePercent` ソート
- `useStockQuote` と同じ `dedupingInterval: 60_000` パターン

### 5. ランキングコンポーネント (`src/components/stocks/MarketRanking.tsx`)
- 2カラムGrid: 左「上昇率ランキング」/ 右「下落率ランキング」
- 各5銘柄表示: 順位、銘柄名、シンボル、株価、変動率（色分け）
- 既存の `Card`, `Loading`, `formatPercent`, `formatJPY` を再利用
- 各銘柄は `/stocks/[symbol]` へのリンク
- `MarketOverview` と同じUIパターン（ローディング、更新ボタン、レスポンシブ）

### 6. ホーム画面更新 (`src/app/page.tsx`)
- `MarketOverview` と `StockWatchlist` の間に `MarketRanking` を挿入

### 7. 銘柄一覧ページ更新 (`src/app/stocks/page.tsx`)
- ハードコードの `popularStocks` をマスターファイルからのインポートに置換

## テスト
- `src/lib/data/stock-master.test.ts` — マスターデータの整合性検証
- `src/lib/yahoo-finance.test.ts` — `getQuotes()` のユニットテスト（既存テストがあれば追加）
- `src/app/api/stocks/quotes/route.test.ts` — APIルートのテスト
- `src/hooks/useMarketRanking.test.ts` — ランキング計算ロジックのテスト

## 検証方法
1. `npm run dev` → `http://localhost:3000` でランキング表示を確認
2. 上昇率/下落率が正しくソートされていることを確認
3. 各銘柄クリックで `/stocks/[symbol]` へ遷移することを確認
4. `npx tsc --noEmit` で型チェック通過を確認
