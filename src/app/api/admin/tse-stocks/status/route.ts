import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { TSE_STOCKS, TSE_STOCKS_METADATA } from "@/lib/data/tse-stocks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = validateAdminRequest(request);
  if (authError) return authError;

  return NextResponse.json({
    totalStocks: TSE_STOCKS.length,
    generatedDate: TSE_STOCKS_METADATA.generatedDate,
    sampleStocks: TSE_STOCKS.slice(0, 5),
  });
}
