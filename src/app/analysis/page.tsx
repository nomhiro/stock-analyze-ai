import { Suspense } from "react";
import { AnalysisPageClient } from "./AnalysisPageClient";
import { Loading } from "@/components/ui/Loading";

export default function AnalysisPage() {
  return (
    <Suspense fallback={<Loading text="読み込み中..." />}>
      <AnalysisPageClient />
    </Suspense>
  );
}
