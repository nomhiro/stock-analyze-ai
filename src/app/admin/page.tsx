import { Suspense } from "react";
import { AdminPageClient } from "./AdminPageClient";
import { Loading } from "@/components/ui/Loading";

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading text="読み込み中..." />}>
      <AdminPageClient />
    </Suspense>
  );
}
