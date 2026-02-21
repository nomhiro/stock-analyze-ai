# Fix: max_tokens → max_completion_tokens for GPT-5.1

## Context
GPT-5.1 モデルでは `max_tokens` パラメータが廃止され、`max_completion_tokens` に置き換わった。
AI分析実行時に 400 エラー (`unsupported_parameter`) が発生している。

## 修正内容

### 1. `src/lib/azure-openai.ts` (L31)
- `max_tokens: 4096` → `max_completion_tokens: 4096` に変更

### 2. `CLAUDE.md`
- コーディング規約セクションの「AI 分析の `max_tokens` は 4096」を「AI 分析の `max_completion_tokens` は 4096」に更新

### 3. テスト
- `src/lib/azure-openai.ts` に対応するテストがあれば `max_completion_tokens` に更新
- 既存テストの有無を確認し、必要に応じて追加

## 検証方法
- `npm test` で既存テストが通ることを確認
- 開発サーバーで AI分析 (`/analysis`) を実行し、ストリーミングが正常動作することを確認
