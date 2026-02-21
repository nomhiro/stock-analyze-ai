"use client";

import { useState, useCallback } from "react";
import {
  Settings,
  RefreshCw,
  Eye,
  Download,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { TseStockStatus } from "@/components/admin/TseStockStatus";
import { TseStockDiff } from "@/components/admin/TseStockDiff";

interface StatusData {
  totalStocks: number;
  generatedDate: string;
}

interface DiffData {
  added: { symbol: string; name: string }[];
  removed: { symbol: string; name: string }[];
  totalBefore: number;
  totalAfter: number;
  unchanged: number;
}

export function AdminPageClient() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin-api-key") || "";
    }
    return "";
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    [apiKey],
  );

  const handleLogin = async () => {
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tse-stocks/status", {
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `認証に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setStatus(data);
      setAuthenticated(true);
      sessionStorage.setItem("admin-api-key", apiKey);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "認証に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoadingAction("preview");
    setError(null);
    setSuccessMessage(null);
    setDiff(null);

    try {
      const res = await fetch("/api/admin/tse-stocks/preview", {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "プレビューに失敗しました");
      }

      const data = await res.json();
      setDiff(data.diff);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "プレビューに失敗しました",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdate = async () => {
    setLoadingAction("update");
    setError(null);
    setSuccessMessage(null);
    setDiff(null);

    try {
      const res = await fetch("/api/admin/tse-stocks/update", {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新に失敗しました");
      }

      const data = await res.json();
      setDiff(data.diff);
      setSuccessMessage(data.message);

      // ステータスを再取得
      const statusRes = await fetch("/api/admin/tse-stocks/status", {
        headers: authHeaders(),
      });
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新に失敗しました",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  // 認証画面
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold">管理者ページ</h1>
        </div>

        <Card>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-muted">
                管理者APIキー
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="ADMIN_API_KEY を入力"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>

            {error && (
              <p className="text-sm text-negative">{error}</p>
            )}

            <Button
              onClick={handleLogin}
              disabled={loading || !apiKey.trim()}
              className="w-full"
            >
              {loading ? (
                <Loading text="認証中..." />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  ログイン
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // メイン画面
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-accent" />
        <h1 className="text-xl font-bold">管理者ページ</h1>
      </div>

      {/* 注意バナー */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
        <p className="text-sm text-yellow-500">
          データファイルの更新はリビルド後に反映されます。開発環境で更新し、コミット→デプロイの流れを推奨します。
        </p>
      </div>

      {/* ステータス表示 */}
      {status && (
        <TseStockStatus
          totalStocks={status.totalStocks}
          generatedDate={status.generatedDate}
        />
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handlePreview}
          disabled={loadingAction !== null}
        >
          {loadingAction === "preview" ? (
            <Loading text="取得中..." />
          ) : (
            <>
              <Eye className="h-4 w-4" />
              プレビュー
            </>
          )}
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={loadingAction !== null}
        >
          {loadingAction === "update" ? (
            <Loading text="更新中..." />
          ) : (
            <>
              <Download className="h-4 w-4" />
              更新実行
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setDiff(null);
            setError(null);
            setSuccessMessage(null);
          }}
          disabled={loadingAction !== null}
        >
          <RefreshCw className="h-4 w-4" />
          リセット
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <Card>
          <p className="text-sm text-negative">{error}</p>
        </Card>
      )}

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-positive/30 bg-positive/5 px-4 py-3">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
          <p className="text-sm text-positive">{successMessage}</p>
        </div>
      )}

      {/* 差分表示 */}
      {diff && <TseStockDiff diff={diff} />}
    </div>
  );
}
