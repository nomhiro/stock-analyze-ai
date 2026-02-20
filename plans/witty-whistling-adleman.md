# Hydration Mismatch 修正プラン

## Context

ダッシュボード(`/`)アクセス時に React の Hydration Mismatch エラーが発生している。原因は `useWatchlist` フックが `typeof window !== "undefined"` で `isInitialized` フラグを返し、ページ側で `{isInitialized && <Component />}` のように条件付きレンダリングしていること。サーバーでは `false`（何も描画しない）、クライアントでは `true`（描画する）となり、DOM ツリーが不一致になる。

フックは既に `useSyncExternalStore` を使っており、`getServerSnapshot()` が `[]` を返す設計になっている。これは React 公式のSSR対応パターンであり、`isInitialized` フラグは不要かつ有害。

## 修正内容

### 1. [src/hooks/useWatchlist.ts](src/hooks/useWatchlist.ts) — `isInitialized` を削除

- **行93**: `const isInitialized = typeof window !== "undefined";` を削除
- **行95**: return から `isInitialized` を除去

### 2. [src/app/page.tsx](src/app/page.tsx) — 条件付きレンダリングを除去

- デストラクチャリングから `isInitialized` を除去
- `{isInitialized && <MarketRanking />}` → `<MarketRanking />` に変更
- `{isInitialized && <StockWatchlist />}` → `<StockWatchlist />` に変更

### 3. [src/app/stocks/page.tsx](src/app/stocks/page.tsx) — 同上

- デストラクチャリングから `isInitialized` を除去
- `{isInitialized && <StockWatchlist />}` → `<StockWatchlist />` に変更

### 4. [src/components/stocks/StockWatchlist.tsx](src/components/stocks/StockWatchlist.tsx) — Map 初期化の防御的修正

- 行27: `new Map(quotes?.map(...))` → `new Map(quotes?.map(...) ?? [])` に変更

## 修正後のデータフロー

| フェーズ | `symbols` | 描画内容 |
|---------|-----------|---------|
| SSR | `[]` (getServerSnapshot) | 空状態UI |
| Hydration | `[]` (サーバーと一致 → エラーなし) | 空状態UI |
| Hydration後の再レンダリング | `["7203.T", ...]` (localStorage) | 実データ表示 |

## 検証

1. `npm run build` — TypeScript コンパイル成功（`isInitialized` の参照が残っていればエラー）
2. `npm test` — 既存テスト全パス
3. `npm run lint` — lint エラーなし
4. ブラウザ確認: コンソールに Hydration Mismatch 警告が出ないこと
