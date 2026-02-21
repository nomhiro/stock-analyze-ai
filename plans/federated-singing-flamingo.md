# 管理者画面: 東証銘柄データ再取得機能

## Context

現在、東証銘柄データ（約4,097件）は `scripts/generate-tse-stocks.mjs` を手動実行して `src/lib/data/tse-stocks.ts` を再生成する運用。JPXが毎月第3営業日にデータを更新するため、定期的な再取得が必要だが、CLIでのスクリプト実行は手間がかかる。

管理者画面（`/admin`）を新設し、ブラウザからワンクリックでデータの差分確認・更新を可能にする。

## 方針

### 認証
- `ADMIN_API_KEY` 環境変数によるシンプルなAPIキー認証
- 管理者ページでキーを入力 → `sessionStorage` に保持 → APIリクエストの `Authorization: Bearer` ヘッダーで送信
- ナビゲーションには追加しない（`/admin` に直接アクセス）

### データ更新の制約
- `TSE_STOCKS` はビルド時に静的バンドルされるため、ファイル更新後はリビルド＆再デプロイが必要
- 開発環境では即座にファイル書き換え → `npm run dev` で反映
- 本番環境ではプレビュー（差分確認）のみ実用的

## 実装ステップ

### Step 1: `xlsx` を dependencies に移動
- **変更**: [package.json](package.json) — `xlsx` を `devDependencies` → `dependencies` へ移動
- standalone ビルドで API Route から利用するために必要

### Step 2: 共通ロジック `tse-stock-fetcher.ts` を作成
- **新規**: `src/lib/tse-stock-fetcher.ts`
- [generate-tse-stocks.mjs](scripts/generate-tse-stocks.mjs) の `downloadFile` / `parseExcel` / `generateTypeScript` ロジックを TypeScript モジュールとして抽出
- 差分計算関数 `computeDiff()` を追加
- メタデータ付き TypeScript 生成（`TSE_STOCKS_METADATA` 定数をエクスポートに追加）

```typescript
// 主要エクスポート
export interface TseStock { symbol: string; name: string }
export interface TseStockDiff { added: TseStock[]; removed: TseStock[]; totalBefore: number; totalAfter: number; unchanged: number }
export async function downloadJpxExcel(): Promise<Buffer>
export function parseJpxExcel(buffer: Buffer): TseStock[]
export function computeDiff(current: TseStock[], fetched: TseStock[]): TseStockDiff
export function generateTypeScriptContent(stocks: TseStock[]): string
```

- **新規**: `src/lib/tse-stock-fetcher.test.ts` — `parseJpxExcel`, `computeDiff`, `generateTypeScriptContent` のユニットテスト

### Step 3: 認証ユーティリティ
- **新規**: `src/lib/admin-auth.ts`

```typescript
export function validateAdminRequest(request: NextRequest): NextResponse | null
// null = 認証OK, NextResponse = エラーレスポンス（401 or 503）
```

- **新規**: `src/lib/admin-auth.test.ts`

### Step 4: API Routes（3本）

| ルート | メソッド | 機能 |
|--------|----------|------|
| `/api/admin/tse-stocks/status` | GET | 現在のデータ件数・最終更新日を返却 |
| `/api/admin/tse-stocks/preview` | POST | JPXからデータ取得 → 現在データとの差分を返却（ファイル書き換えなし） |
| `/api/admin/tse-stocks/update` | POST | JPXからデータ取得 → `tse-stocks.ts` を上書き → 差分を返却 |

全ルートで `validateAdminRequest` による認証チェック。各ルートにテストファイルを併設。

### Step 5: 管理者ページ UI

- **新規**: `src/app/admin/page.tsx` — Server Component ラッパー（Suspense）
- **新規**: `src/app/admin/AdminPageClient.tsx` — メインの Client Component

**画面フロー:**
1. **認証画面** — APIキー入力フォーム
2. **ステータス表示** — 現在の銘柄数・最終更新日 + 「プレビュー」「更新実行」ボタン
3. **プレビュー結果** — 追加/削除された銘柄の差分テーブル
4. **更新完了** — 成功メッセージ + 「リビルドが必要」の注意表示

- **新規**: `src/components/admin/TseStockStatus.tsx` — ステータスカード（[Card](src/components/ui/Card.tsx), [Badge](src/components/ui/Badge.tsx) を再利用）
- **新規**: `src/components/admin/TseStockDiff.tsx` — 差分表示コンポーネント（追加=positive、削除=negative の Badge で色分け）

### Step 6: メタデータ対応 & データ再生成
- `generateTypeScriptContent` で `TSE_STOCKS_METADATA` 定数を出力するようにする
- スクリプトを実行して `tse-stocks.ts` を再生成（メタデータ付き）

### Step 7: 環境変数の設定
- **変更**: [.env.example](.env.example) に `ADMIN_API_KEY` を追加

## 新規ファイル一覧

| ファイル | 種別 |
|----------|------|
| `src/lib/tse-stock-fetcher.ts` | 共通ロジック |
| `src/lib/tse-stock-fetcher.test.ts` | テスト |
| `src/lib/admin-auth.ts` | 認証ユーティリティ |
| `src/lib/admin-auth.test.ts` | テスト |
| `src/app/api/admin/tse-stocks/status/route.ts` | API Route |
| `src/app/api/admin/tse-stocks/status/route.test.ts` | テスト |
| `src/app/api/admin/tse-stocks/preview/route.ts` | API Route |
| `src/app/api/admin/tse-stocks/preview/route.test.ts` | テスト |
| `src/app/api/admin/tse-stocks/update/route.ts` | API Route |
| `src/app/api/admin/tse-stocks/update/route.test.ts` | テスト |
| `src/components/admin/TseStockStatus.tsx` | UIコンポーネント |
| `src/components/admin/TseStockDiff.tsx` | UIコンポーネント |
| `src/app/admin/page.tsx` | ページ（Server Component） |
| `src/app/admin/AdminPageClient.tsx` | ページ（Client Component） |

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | `xlsx` を dependencies へ移動 |
| `.env.example` | `ADMIN_API_KEY` 追加 |
| `src/lib/data/tse-stocks.ts` | メタデータ定数を追加（スクリプト再実行で再生成） |

## 検証方法

1. `.env` に `ADMIN_API_KEY=test-key` を設定
2. `npm run dev` で開発サーバー起動
3. `/admin` にアクセス → APIキー入力 → ステータス表示を確認
4. 「プレビュー」ボタン → JPXからデータ取得 → 差分表示を確認
5. 「更新実行」ボタン → `tse-stocks.ts` が更新されることを確認
6. `npm test` で全テストがパスすることを確認
