import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <h2 className="mb-2 text-lg font-bold">ページが見つかりません</h2>
        <p className="mb-4 text-sm text-muted">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          ダッシュボードへ戻る
        </Link>
      </Card>
    </div>
  );
}
