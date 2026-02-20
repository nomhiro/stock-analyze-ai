# Azure Static Web Apps デプロイ「Web app warm up timed out」修正プラン

## Context

Azure Static Web Apps へのデプロイ時に「Web app warm up timed out」エラーが発生し、ビルド・アップロードは成功するがアプリが約10分間ヘルスチェックに応答せずタイムアウトする。

根本原因は GitHub Actions ワークフローの設定ミス:
1. **`output_location: ".next/standalone"` が不正** — 公式ドキュメントでは Hybrid Next.js の output_location は空（`""`）
2. **`skip_app_build: true` が問題** — SWA はビルド時に `public/.swa/health.html` を注入してヘルスチェックに使用するが、ビルドをスキップするとこの注入が行われない可能性がある
3. **環境変数がビルド時のみ設定** — SWA の公式パターンでは deploy ステップの `env:` ブロックに設定する

## 変更内容

### 1. GitHub Actions ワークフロー修正（主要修正）

**ファイル**: [azure-static-web-apps.yml](.github/workflows/azure-static-web-apps.yml)

公式ドキュメント（[Deploy hybrid Next.js on SWA](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-hybrid)）のパターンに従い、SWA にビルドを任せる構成に変更:

```yaml
jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_SAND_0ACC94400 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ""
        env:
          AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
          AZURE_OPENAI_API_VERSION: ${{ secrets.AZURE_OPENAI_API_VERSION }}
          AZURE_OPENAI_DEPLOYMENT_NAME: ${{ secrets.AZURE_OPENAI_DEPLOYMENT_NAME }}
          FINLIGHT_API_KEY: ${{ secrets.FINLIGHT_API_KEY }}
          NEXT_PUBLIC_APP_URL: "https://mango-sand-0acc94400.4.azurestaticapps.net"
```

変更点:
- `Setup Node.js`、`Install dependencies`、`Build` ステップを削除（SWA/Oryx がビルドを実行）
- `skip_app_build: true` を削除
- `output_location` を `".next/standalone"` → `""` に変更
- `api_location: ""` を追加
- 環境変数を deploy ステップの `env:` ブロックに移動

### 2. YahooFinance クライアントの遅延初期化

**ファイル**: [yahoo-finance.ts](src/lib/yahoo-finance.ts)

モジュールロード時の `new YahooFinance()` をオンデマンド初期化に変更し、サーバー起動時間を短縮:

```typescript
import YahooFinance from "yahoo-finance2";

let yahooFinanceInstance: InstanceType<typeof YahooFinance> | null = null;

function getYahooFinance(): InstanceType<typeof YahooFinance> {
  if (!yahooFinanceInstance) {
    yahooFinanceInstance = new YahooFinance();
  }
  return yahooFinanceInstance;
}
```

各関数内の `yahooFinance.xxx()` を `getYahooFinance().xxx()` に変更。
（`azure-openai.ts` の `getAzureOpenAIClient()` と同じパターン）

### 3. テスト追加

**ファイル**: `src/lib/yahoo-finance.test.ts`（新規作成）

遅延初期化の変更に対するユニットテストを追加。

## 手動対応（Azure ポータル）

SWA リソースの「設定 > 構成 > アプリケーション設定」に以下のランタイム環境変数を追加（ビルド時だけでなくリクエスト時にも必要）:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_DEPLOYMENT_NAME`
- `FINLIGHT_API_KEY`

## フォールバック（上記で解決しない場合）

SWA/Oryx が Next.js 16 のビルドを正しく処理できない場合:
1. `skip_app_build: true` を戻し、`output_location` のみ `""` に修正
2. ビルドステップを復活させる（`npm ci && npm run build`）
3. それでも解決しない場合、Next.js のバージョンを 14.x に下げることを検討

## 検証方法

1. ワークフロー修正後、`main` ブランチに push して GitHub Actions のデプロイを確認
2. ビルドログで「Web app warm up」がタイムアウトしないことを確認
3. デプロイ成功後、`https://mango-sand-0acc94400.4.azurestaticapps.net` にアクセスして動作確認
4. `npm test` でローカルテストが通ることを確認（YahooFinance 遅延初期化の変更）
