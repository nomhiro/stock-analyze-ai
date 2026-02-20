# 銘柄マスターとウォッチリストの統一

## Context

現在、銘柄管理の概念が2つ並存している:
- **銘柄マスター**: ハードコードされた83銘柄（ランキング・一覧表示に使用）
- **ウォッチリスト**: ユーザーが自由に追加/削除する個人リスト（localStorage）

これを**ウォッチリストに一本化**し、マーケットランキングもウォッチリスト内の銘柄で算出するように変更する。

## 変更ファイル一覧

| 操作 | ファイル | 内容 |
|------|---------|------|
| 新規 | `src/lib/data/default-watchlist.ts` | 初回訪問時のデフォルト銘柄（10銘柄） |
| 新規 | `src/lib/data/default-watchlist.test.ts` | デフォルトデータのテスト |
| 新規 | `src/hooks/useWatchlist.test.ts` | ウォッチリストフックのテスト |
| 変更 | `src/hooks/useWatchlist.ts` | デフォルト投入 + `isInitialized` 追加 |
| 変更 | `src/hooks/useMarketRanking.ts` | `symbols` パラメータを受け取るように変更 |
| 変更 | `src/app/api/stocks/quotes/route.ts` | `symbols` パラメータ必須化、マスター依存とキャッシュ削除 |
| 変更 | `src/app/api/stocks/quotes/route.test.ts` | マスターモック削除、パラメータなし→400テスト |
| 変更 | `src/components/stocks/MarketRanking.tsx` | `symbols` props受取、空状態UI追加 |
| 変更 | `src/components/stocks/StockWatchlist.tsx` | props化、株価情報の表示追加 |
| 変更 | `src/app/page.tsx` | `useWatchlist`で状態管理、子コンポーネントにprops渡し |
| 変更 | `src/app/stocks/page.tsx` | マスターグリッド→検索+ウォッチリスト表示に変更 |
| 削除 | `src/lib/data/stock-master.ts` | 不要になった銘柄マスター |
| 削除 | `src/lib/data/stock-master.test.ts` | 不要になったテスト |

## 実装手順

### Step 1: デフォルトウォッチリスト作成

**新規**: `src/lib/data/default-watchlist.ts`

初回訪問者向けに10銘柄をプリセット（シンボルのみ、名前はAPI取得時に解決）:

```typescript
export const DEFAULT_WATCHLIST_SYMBOLS: string[] = [
  "7203.T",  // トヨタ自動車
  "6758.T",  // ソニーグループ
  "8306.T",  // 三菱UFJ
  "9984.T",  // ソフトバンクグループ
  "8058.T",  // 三菱商事
  "6861.T",  // キーエンス
  "8035.T",  // 東京エレクトロン
  "9983.T",  // ファーストリテイリング
  "4568.T",  // 第一三共
  "7974.T",  // 任天堂
];
```

**テスト**: `.T`サフィックス、重複なし、件数チェック

### Step 2: `useWatchlist` フック拡張

**変更**: `src/hooks/useWatchlist.ts`

- `localStorage` が `null`（初回訪問）→ デフォルト銘柄で初期化
- `localStorage` が `"[]"`（ユーザーが全削除）→ 空のまま尊重
- `isInitialized` フラグ追加（localStorage読み取り完了を示す）

```typescript
const stored = localStorage.getItem(STORAGE_KEY);
if (stored === null) {
  // 初回訪問: デフォルトで初期化
  save([...DEFAULT_WATCHLIST_SYMBOLS]);
} else {
  setSymbols(JSON.parse(stored));
}
setIsInitialized(true);
```

返り値: `{ symbols, add, remove, has, isInitialized }`

### Step 3: `useMarketRanking` フック変更

**変更**: `src/hooks/useMarketRanking.ts`

- シグネチャ: `useMarketRanking(symbols: string[], count?: number)`
- SWRキー: `symbols.length > 0 ? /api/stocks/quotes?symbols=... : null`
- `isEmpty` フラグを返り値に追加

### Step 4: API Route 変更

**変更**: `src/app/api/stocks/quotes/route.ts`

- `masterSymbols` インポート削除
- `symbols` パラメータなし → 400エラー
- サーバー側キャッシュ削除（クライアント側SWRのdeduping 60sで十分）

### Step 5: `MarketRanking` コンポーネント変更

**変更**: `src/components/stocks/MarketRanking.tsx`

- Props: `{ symbols: string[] }`
- `useMarketRanking(symbols, 5)` に変更
- 空ウォッチリスト時: 「ウォッチリストに銘柄を追加するとランキングが表示されます」

### Step 6: `StockWatchlist` コンポーネント拡張

**変更**: `src/components/stocks/StockWatchlist.tsx`

- Props化: `{ symbols: string[]; onRemove: (symbol: string) => void }`
- SWRで株価データ取得（`useMarketRanking`と同じキー → SWRが自動dedupe）
- シンボルだけでなく **銘柄名・株価・変動率** を表示

### Step 7: ダッシュボード（オーケストレーター化）

**変更**: `src/app/page.tsx`

- `useWatchlist()` を呼び出し、`symbols` を `MarketRanking` と `StockWatchlist` に渡す
- `isInitialized` で初期化完了まで子コンポーネントの描画を遅延

### Step 8: `/stocks` ページ変更

**変更**: `src/app/stocks/page.tsx`

- サーバーコンポーネント → クライアントコンポーネントに変更（`"use client"`）
- マスターグリッド削除 → 検索バー + ウォッチリスト表示

### Step 9: 銘柄マスター削除

- `src/lib/data/stock-master.ts` 削除
- `src/lib/data/stock-master.test.ts` 削除

### Step 10: テスト更新

- `route.test.ts`: マスターモック削除、パラメータなし→400テスト追加
- `useWatchlist.test.ts` (新規): localStorage モックで初回/既存/空のケーステスト
- `default-watchlist.test.ts` (新規): デフォルトデータの整合性テスト

## 空ウォッチリスト時の挙動

| シナリオ | localStorage | 動作 |
|---------|-------------|------|
| 初回訪問 | `null` | デフォルト10銘柄で自動初期化 |
| 全銘柄削除済み | `"[]"` | ランキング=空メッセージ、ウォッチリスト=検索バー表示 |
| 銘柄あり | `"[\"7203.T\",...]"` | 通常表示 |

## 検証方法

1. `npm run build` — ビルドエラーなし
2. `npm test` — 全テスト通過
3. ブラウザの localStorage を削除して初回訪問を再現 → デフォルト10銘柄が表示される
4. 全銘柄を削除 → ランキングに空メッセージ、ウォッチリストに検索バーが表示される
5. 検索から銘柄追加 → ウォッチリストとランキングにリアルタイム反映
6. ページリロード → localStorage から復元される
