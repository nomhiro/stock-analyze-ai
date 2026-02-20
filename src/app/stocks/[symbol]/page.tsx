import { StockDetailClient } from "./StockDetailClient";

interface StockDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockDetailPage({
  params,
}: StockDetailPageProps) {
  const { symbol } = await params;

  return <StockDetailClient symbol={decodeURIComponent(symbol)} />;
}
