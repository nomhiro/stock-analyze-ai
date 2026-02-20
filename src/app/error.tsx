"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <h2 className="mb-2 text-lg font-bold text-negative">
          エラーが発生しました
        </h2>
        <p className="mb-4 text-sm text-muted">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <Button onClick={reset}>再試行</Button>
      </Card>
    </div>
  );
}
