# Plan: Create CLAUDE.md

## Context
This repository has no CLAUDE.md file. The project is a Japanese stock analysis web app (Next.js 16, Azure OpenAI). The user requires that test-writing instructions be included.

## Action
Create `CLAUDE.md` at the project root with the following content:

---

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # プロダクションビルド
npm run lint         # ESLint チェック
npm test             # テスト実行 (Vitest)
npm run test:coverage # カバレッジ付きテスト
```

## アーキテクチャ

Next.js 16 (App Router) のフルスタック TypeScript アプリケーション。日本株のデータ可視化と Azure OpenAI による AI 分析を提供する。

### ファクト / AI分析 の分離

本プロジェクトの中核設計。**ファクトゾーン**（`/`, `/stocks`, `/stocks/[symbol]`）は市場データのみを表示し、**AI分析ゾーン**（`/analysis`）は AI による推測を表示する。この境界を崩さないこと。

### 主要ディレクトリ

- `src/app/api/` — API Routes（株価取得、ニュース、AI分析ストリーミング）
- `src/lib/` — 外部サービス統合（`yahoo-finance.ts`, `finlight.ts`, `azure-openai.ts`）とプロンプト定義（`prompts/`）
- `src/components/` — React コンポーネント（`ui/` が共通部品、`charts/`, `stocks/`, `analysis/` が機能別）
- `src/hooks/` — カスタムフック（SWR ベースのデータ取得、ストリーミング分析、ウォッチリスト）
- `src/lib/types/` — 型定義（`stock.ts`, `analysis.ts`, `news.ts`）

### 外部サービス連携

| サービス | ライブラリ | 用途 |
|---|---|---|
| Yahoo Finance | `yahoo-finance2` | 株価・チャート・検索（`.T` サフィックスで東証銘柄） |
| Finlight | REST API | ニュース記事取得（Bearer トークン認証） |
| Azure OpenAI | `openai` SDK (AzureOpenAI) | GPT-5.1 ストリーミング分析（`streamAnalysis()` で ReadableStream 返却） |

### データフローパターン

- **データ取得**: SWR フック → API Route → 外部 API → NextResponse.json()
- **AI分析**: useAnalysis フック → POST → プロンプト構築 → `streamAnalysis()` → ReadableStream（text/plain チャンク）

### パスエイリアス

`@/*` → `./src/*`（tsconfig.json で設定済み）

## テスト規約（必須）

**すべての新規・変更コードにはテストを書くこと。**

### ルール
- テストフレームワーク: **Vitest**
- テストファイルは対象ファイルと**同じディレクトリ**に `*.test.ts` / `*.test.tsx` として配置
- `src/lib/` 配下のロジック（API クライアント、ユーティリティ）は必ずユニットテストを書く
- API Route（`src/app/api/`）の新規・変更時もテストを書く
- コンポーネント変更時は対応するテストの追加・更新を検討する

### モック規約
- `node:fs/promises` → `vi.mock('node:fs/promises')`
- Azure OpenAI クライアント → `vi.mock('../lib/azure-openai')` 等で `streamAnalysis` をモック
- Yahoo Finance → `vi.mock('yahoo-finance2')` でモック
- Finlight API → `vi.mock('../lib/finlight')` または fetch をモック

### テスト実行
```bash
npm test                        # 全テスト
npm test -- src/lib/utils/      # 特定ディレクトリ
npm test -- formatters.test.ts  # 単一ファイル
npm run test:coverage           # カバレッジレポート
```

## コーディング規約

- UI テキストは**日本語**で記述する
- 通貨フォーマットは `src/lib/utils/formatters.ts` の既存ヘルパーを使う
- 東証銘柄シンボルは `.T` サフィックス付き（例: `7203.T`）
- Azure OpenAI の GPT-5 系は `temperature` パラメータ非対応（設定しないこと）
- AI 分析の `max_tokens` は 4096
- API Route のレスポンスにはキャッシュ無効化ヘッダーが自動付与される（`next.config.ts`）

## デプロイ

Azure Static Web Apps (hybrid mode)。`main` ブランチへの push で GitHub Actions が自動デプロイ。出力は `standalone` モード。
```

---

## Verification
- `CLAUDE.md` がプロジェクトルートに存在すること
- テスト関連の指示が含まれていること
