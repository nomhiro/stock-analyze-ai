# Azure Static Web Apps デプロイ設定の修正

## Context

Azure Static Web Apps (SWA) を作成し、GitHub リポジトリからのデプロイと環境変数を設定済み。
しかし、ワークフローファイルが重複しており、また一部設定が Next.js 16 ハイブリッドモードと非互換。

公式ドキュメント: https://learn.microsoft.com/azure/static-web-apps/deploy-nextjs-hybrid

---

## 修正内容

### 1. 自動生成ワークフローの削除
**ファイル**: `.github/workflows/azure-static-web-apps-mango-sand-0acc94400.yml` → **削除**

理由:
- Azure ポータルが自動生成したデフォルトのテンプレート
- `output_location: "build"` が Next.js の出力先と不一致
- ビルド時環境変数の設定がない
- 手動作成版 `azure-static-web-apps.yml` と同時実行されてしまう

### 2. 手動作成ワークフローの微修正
**ファイル**: `.github/workflows/azure-static-web-apps.yml`

この手動作成版は既にかなり良い設定になっている。以下を追加・修正:

- API Token のシークレット名を統一
  - 現在: `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - Azure ポータルが作成したシークレット: `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_SAND_0ACC94400`
  - → ワークフロー内のシークレット名を `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_SAND_0ACC94400` に合わせるか、GitHub リポジトリ Settings > Secrets に `AZURE_STATIC_WEB_APPS_API_TOKEN` を追加

- `NEXT_PUBLIC_APP_URL` をビルド時 env に追加:
  ```yaml
  env:
    NEXT_PUBLIC_APP_URL: "https://mango-sand-0acc94400.4.azurestaticapps.net"
  ```

### 3. `staticwebapp.config.json` の修正
**ファイル**: `staticwebapp.config.json`

`navigationFallback` を削除。ハイブリッド Next.js では非サポート（公式ドキュメント明記）。

```json
{
  "platform": {
    "apiRuntime": "node:20"
  }
}
```

### 4. `package.json` の build スクリプト修正
**ファイル**: `package.json`

standalone モード用の静的ファイルコピーを追加（公式ドキュメント記載の手順）:

```json
"build": "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"
```

### 5. `package.json` に Node.js バージョン指定を追加
**ファイル**: `package.json`

```json
"engines": {
  "node": ">=20.0.0"
}
```

---

## GitHub リポジトリ側の設定（手動作業が必要）

GitHub リポジトリの **Settings > Secrets and variables > Actions** に以下の Secrets を追加する:

| Secret 名 | 状態 | 内容 |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_SAND_0ACC94400` | 設定済み（Azure自動） | SWA デプロイトークン |
| `AZURE_OPENAI_ENDPOINT` | **要追加** | Azure OpenAI エンドポイント URL |
| `AZURE_OPENAI_API_KEY` | **要追加** | Azure OpenAI API キー |
| `AZURE_OPENAI_API_VERSION` | **要追加** | API バージョン（例: `2025-04-01-preview`） |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | **要追加** | デプロイメント名（例: `gpt-5.1-chat`） |
| `FINLIGHT_API_KEY` | **要追加** | Finlight API キー |

※ これらはワークフローのビルドステップで `npm run build` 実行時に使われる。
Azure ポータルの SWA 環境変数はランタイム用、GitHub Secrets はビルド時用で、**両方必要**。

---

## 検証方法

1. 修正をコミットして `main` ブランチに push
2. GitHub Actions で **1つだけ** ワークフローが実行されることを確認
3. ビルドが成功すること確認
4. `https://mango-sand-0acc94400.4.azurestaticapps.net` にアクセスし以下を確認:
   - トップページが表示される
   - `/stocks/7203.T` 等の個別銘柄ページが SSR で表示される
   - `/api/stocks/search?q=トヨタ` 等の API Route が動作する
   - `/analysis` ページで AI 分析のストリーミングが動作する
