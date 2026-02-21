# 分析ページの銘柄入力にオートコンプリート（日本語名対応）を追加

## Context

AI分析ページ（`/analysis`）の「対象銘柄」入力欄は現在プレーンなテキスト入力で、シンボルを手入力する必要がある。
「トヨ」→「トヨタ自動車 (7203.T)」のように**日本語の部分一致**でフィルタリング・選択できるようにしたい。

**課題**: Yahoo Finance API は日本語クエリに `BadRequestError` を返すため、日本語検索にはローカルの銘柄データが必要。

## 方針

1. **東証全銘柄（約3,800社）の静的データファイル**を用意
2. **検索 API を拡張**: 日本語入力 → ローカルデータ検索、英数字入力 → Yahoo Finance API（従来通り）
3. **StockSearchBar コンポーネントを拡張**: `onSelect`/`onChange` props を追加し分析ページで再利用

## 変更対象ファイル

### 1. `src/lib/data/tse-stocks.ts` — 新規: 東証銘柄データ

```ts
// 約3,800件の東証上場銘柄
export const TSE_STOCKS: { symbol: string; name: string }[] = [
  { symbol: "7203.T", name: "トヨタ自動車" },
  { symbol: "6758.T", name: "ソニーグループ" },
  // ... 全銘柄
];
```

- JPX（日本取引所グループ）公開の上場銘柄一覧からデータ生成スクリプトで作成
- ファイルサイズ: 約200-300KB（サーバーサイドのみで使用、クライアントには送らない）

### 2. `scripts/generate-tse-stocks.ts` — 新規: データ生成スクリプト

- JPX の上場銘柄一覧（Excel/CSV）をパースして `tse-stocks.ts` を生成
- 初回とメンテナンス時に手動実行

### 3. `src/lib/stock-search.ts` — 新規: ローカル検索ロジック

```ts
export function searchLocalStocks(query: string): StockSearchResult[] {
  // 日本語の部分一致検索（name.includes(query)）
  // シンボルの前方一致検索（symbol.startsWith(query)）
  // 上位10件を返却
}
```

### 4. `src/app/api/stocks/search/route.ts` — 拡張: ハイブリッド検索

```
入力判定:
  - 非ASCII文字を含む（日本語）→ searchLocalStocks() でローカル検索
  - ASCII のみ（英数字）→ 従来の Yahoo Finance searchStocks() + ローカル検索を併用
```

### 5. `src/components/stocks/StockSearchBar.tsx` — props 追加

```tsx
interface StockSearchBarProps {
  onSelect?: (result: StockSearchResult) => void;  // 選択時コールバック
  onChange?: (value: string) => void;               // 入力変更時コールバック
  value?: string;                                   // 制御値
  placeholder?: string;                             // カスタムプレースホルダー
  className?: string;                               // 追加CSSクラス
}
```

- `onSelect` あり → コールバック呼び出し、`onSelect` なし → 従来の `router.push`
- `onChange` で親の state と同期
- 既存の3箇所の利用（`page.tsx`, `stocks/page.tsx`, `StockWatchlist.tsx`）は変更不要（後方互換）

### 6. `src/app/analysis/AnalysisPageClient.tsx` — StockSearchBar に置き換え

**Before** (L134-143): プレーン `<input>`
**After**:
```tsx
<StockSearchBar
  value={symbol}
  onSelect={(result) => setSymbol(result.symbol)}
  onChange={(value) => setSymbol(value)}
  placeholder="例: 7203.T（銘柄コードまたは企業名で検索）"
  className="max-w-xs"
/>
```

### 7. テストファイル（新規）

| ファイル | テスト内容 |
|---------|-----------|
| `src/lib/stock-search.test.ts` | 日本語部分一致、シンボル前方一致、結果上限、空クエリ |
| `src/hooks/useStockSearch.test.ts` | デバウンス、fetch 呼び出し、エラーハンドリング |

`StockSearchBar` のデバウンス検索ロジックは `useStockSearch` フックに抽出してテスト容易にする。

## 実装順序

| Step | 内容 |
|------|------|
| 1 | `scripts/generate-tse-stocks.ts` 作成 → `src/lib/data/tse-stocks.ts` 生成 |
| 2 | `src/lib/stock-search.ts` + テスト作成 |
| 3 | `src/app/api/stocks/search/route.ts` 拡張（ハイブリッド検索） |
| 4 | `src/hooks/useStockSearch.ts` 作成（デバウンス検索ロジック抽出）+ テスト |
| 5 | `src/components/stocks/StockSearchBar.tsx` リファクタリング（フック使用 + props追加） |
| 6 | `src/app/analysis/AnalysisPageClient.tsx` 修正 |
| 7 | `npm test` + `npm run lint` で全体確認 |

## 検証方法

1. `npm test` — 全テスト通過
2. `npm run lint` — lint エラーなし
3. 手動確認:
   - `/analysis` で「トヨ」入力 → 「トヨタ自動車 (7203.T)」等が表示される
   - `/analysis` で「7203」入力 → シンボル前方一致で候補表示
   - ドロップダウンから選択 → シンボルがセットされ quote 情報表示
   - 手入力で `7203.T` と直接入力 → 従来通り分析実行可能
   - ホーム/銘柄一覧の `StockSearchBar` が従来通り動作（回帰なし）
