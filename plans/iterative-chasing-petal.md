# 分析ページ: 短期/長期トグルと分析実行ボタンの色を区別する

## Context

AI分析ページ(`/analysis`)で、短期/長期の切り替えボタン（選択時）と分析実行ボタンが両方とも `bg-accent text-white`（青 `#3b82f6`）を使用しており、視覚的に区別がつきにくい。トグルボタンはアクションボタンではなく「現在の選択状態」を示すものなので、分析実行ボタンとは異なるスタイルにする。

## 変更内容

### 対象ファイル
- [AnalysisPageClient.tsx](src/app/analysis/AnalysisPageClient.tsx) (124-128行目)

### 修正方針

短期/長期トグルボタンの選択時スタイルを変更する。分析実行ボタン（`bg-accent text-white`）はそのまま維持。

**選択時のトグルボタン:**
- 変更前: `bg-accent text-white`（青塗りつぶし — 分析実行ボタンと同じ）
- 変更後: `bg-accent/15 text-accent border border-accent`（青の薄い背景 + 青テキスト + 青ボーダー）

**未選択時のトグルボタン:**
- 変更前: `bg-card-border/30 text-muted hover:text-foreground`
- 変更後: `bg-card-border/30 text-muted hover:text-foreground border border-transparent`（ボーダーを揃えてレイアウトずれを防止）

これにより:
- 分析実行ボタン = **塗りつぶし青**（アクション用）
- 短期/長期トグル = **青アウトライン**（選択状態の表示用）

と視覚的な役割の違いが明確になる。

## 検証

1. `npm run dev` でローカルサーバー起動
2. `/analysis` ページで短期/長期の切り替えと分析実行ボタンの色が区別できることを確認
3. `npm run build` でビルドが通ることを確認
