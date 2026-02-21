# トレンド分析: ユーザ入力ベースへの変更

## Context

現在のトレンド分析は、ボタン一つで Finlight API からニュース記事を自動取得し、AI に分析させる仕組み。これをユーザが自分で入力した情報（テキスト or URL）を基に分析するように変更する。ユーザが注目している情報を直接分析できるようにすることが目的。

## 設計方針

- **入力方式**: URL入力欄（1行テキスト）とテキスト入力欄（テキストエリア）を**分離**
- **分析条件**: どちらか一方でも入力されていれば分析実行可能。両方入力された場合は両方の内容を結合して分析に使う
- **URL取得**: サーバ側でページ内容を取得（cheerio でHTML解析）
- **既存フロー**: Finlight 自動取得フローは削除（`useNewsArticles` のインポートを外す）
- **出力形式**: 既存の `NewsMappingTheme` 型・`TrendThemeCard` をそのまま活用（JSON構造は同じ）

## 変更ファイル一覧

| ファイル | 操作 | 内容 |
|---------|------|------|
| `package.json` | 変更 | `cheerio` 追加 |
| [content-extractor.ts](src/lib/content-extractor.ts) | 新規 | HTML解析・URL判定・文字数制限ユーティリティ |
| [content-extractor.test.ts](src/lib/content-extractor.test.ts) | 新規 | テスト |
| [route.ts](src/app/api/fetch-content/route.ts) | 新規 | URL内容取得API (`POST /api/fetch-content`) |
| [route.test.ts](src/app/api/fetch-content/route.test.ts) | 新規 | テスト |
| [trend-mapping.ts](src/lib/prompts/trend-mapping.ts) | 新規 | フリーテキスト向けプロンプト |
| [trend-mapping.test.ts](src/lib/prompts/trend-mapping.test.ts) | 新規 | テスト |
| [route.ts](src/app/api/analysis/trend-mapping/route.ts) | 新規 | トレンド分析API (`POST /api/analysis/trend-mapping`) |
| [route.test.ts](src/app/api/analysis/trend-mapping/route.test.ts) | 新規 | テスト |
| [AnalysisPageClient.tsx](src/app/analysis/AnalysisPageClient.tsx) | 変更 | トレンド分析タブのUI刷新 |

## 実装ステップ

### Step 1: cheerio インストール

```bash
npm install cheerio
```

### Step 2: コンテンツ抽出ユーティリティ — `src/lib/content-extractor.ts`

- `extractTextFromHtml(html, url)` — cheerio でHTML解析、script/style/nav/footer除去、article/main要素を優先取得
- `fetchAndExtractContent(url)` — fetch + HTML解析（10秒タイムアウト、Content-Type検証）
- `truncateContent(text, maxLength=8000)` — AI入力用に文字数制限
- `isUrl(input)` — `https?://` で始まる改行なし単一行かどうか判定

テストファイル: `src/lib/content-extractor.test.ts`

### Step 3: URL内容取得API — `src/app/api/fetch-content/route.ts`

```
POST /api/fetch-content
Body: { url: string }
Response: { title: string, content: string, url: string }
Error: { error: string } (400 or 500)
```

- URL形式バリデーション（`new URL()` で検証）
- `fetchAndExtractContent()` → `truncateContent()` → レスポンス

テストファイル: `src/app/api/fetch-content/route.test.ts`

### Step 4: トレンドマッピングプロンプト — `src/lib/prompts/trend-mapping.ts`

既存 `news-mapping.ts` をベースに、フリーテキスト入力向けに調整:
- システムプロンプト: テキスト情報から投資テーマを見出す専門家
- ユーザプロンプト: `content`（テキスト本文）+ オプショナルな `sourceUrl`
- `content` にはURL取得テキストとユーザ入力テキストが結合されて渡される可能性あり
- JSON出力形式は `NewsMappingTheme` と同一（`TrendThemeCard` をそのまま使える）

テストファイル: `src/lib/prompts/trend-mapping.test.ts`

### Step 5: トレンド分析API — `src/app/api/analysis/trend-mapping/route.ts`

```
POST /api/analysis/trend-mapping
Body: { content: string, sourceUrl?: string }
Response: text/plain ストリーミング (既存パターン踏襲)
```

- 既存の `streamAnalysis()` をそのまま利用
- `buildTrendMappingUserPrompt()` でプロンプト構築

テストファイル: `src/app/api/analysis/trend-mapping/route.test.ts`

### Step 6: UI変更 — `src/app/analysis/AnalysisPageClient.tsx`

**削除するもの:**
- `useNewsArticles` のインポートと使用（L15, L31）
- `articles` を監視する `useEffect`（L75-87）
- 現在の `handleRunTrendAnalysis`（L70-72）

**追加するもの:**
- State: `trendUrl`（URL入力欄）、`trendText`（テキスト入力欄）、`fetchingContent`（URL取得中フラグ）
- **URL入力欄**: `<input type="text">` — placeholder: "https://example.com/news/article"
- **テキスト入力欄**: `<textarea>` — placeholder: "分析したいテキストを貼り付けてください"
- ボタン無効化条件: URL・テキストともに空の場合のみ無効
- 新しい `handleRunTrendAnalysis`:
  1. URLが入力されている → `/api/fetch-content` で内容取得 → `urlContent` に格納
  2. テキストが入力されている → そのまま `userText` に格納
  3. 両方を結合して `content` を構成（`urlContent + "\n\n" + userText`）
  4. `/api/analysis/trend-mapping` に `{ content, sourceUrl? }` を送信
- Loading表示: URL取得中 → "ページ内容を取得中..."、分析中 → "トレンドを分析中..."

**変更しないもの:**
- `trendThemes` のJSON解析ロジック（L90-101）
- `TrendThemeCard` の表示部分（L194-199）
- フォールバック `AnalysisPanel` 表示（L202-208）

## 変更しないファイル

- `src/lib/azure-openai.ts` — `streamAnalysis()` は汎用的でそのまま使える
- `src/hooks/useAnalysis.ts` — エンドポイント・ボディを受け取る汎用フック
- `src/components/analysis/TrendThemeCard.tsx` — 出力JSON形式が同じなので変更不要
- `src/lib/types/analysis.ts` — `NewsMappingTheme` 型をそのまま利用
- `src/lib/prompts/news-mapping.ts` — 既存コードとして残置
- `src/hooks/useNewsArticles.ts` — インポートを外すのみ、ファイル自体は残す

## 検証方法

1. `npm test` — 新規テスト含む全テスト通過確認
2. `npm run build` — ビルド成功確認
3. 手動検証:
   - テキスト入力 → "分析実行" → ストリーミングでテーマカードが表示される
   - URL入力 → "分析実行" → ページ内容取得後、ストリーミングでテーマカードが表示される
   - 無効URL → エラーメッセージ表示
   - 空入力 → ボタンが無効化されている
