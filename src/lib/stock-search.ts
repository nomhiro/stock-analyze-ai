import { TSE_STOCKS } from "@/lib/data/tse-stocks";
import type { StockSearchResult } from "@/lib/types/stock";

const MAX_RESULTS = 10;

/**
 * 非ASCII文字を含むかどうかを判定する。
 * 日本語入力の判定に使用。
 */
export function containsNonAscii(str: string): boolean {
  return /[^\x00-\x7F]/.test(str);
}

/**
 * 全角英数字を半角に正規化する。
 * JPX データは銘柄名に全角英数字を使用しているため、
 * 検索時に半角入力でもマッチするようにする。
 */
function normalizeFullWidth(str: string): string {
  return str.replace(/[\uff01-\uff5e]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}

/**
 * ローカルの東証銘柄データから部分一致検索を行う。
 * - 日本語入力: 銘柄名の部分一致
 * - 英数字入力: シンボル前方一致 + 銘柄名の部分一致
 */
export function searchLocalStocks(query: string): StockSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const lowerQuery = trimmed.toLowerCase();
  const normalizedQuery = normalizeFullWidth(lowerQuery);
  const isNonAscii = containsNonAscii(trimmed);

  const results: StockSearchResult[] = [];

  for (const stock of TSE_STOCKS) {
    if (results.length >= MAX_RESULTS) break;

    const normalizedName = normalizeFullWidth(stock.name.toLowerCase());

    if (isNonAscii) {
      // 日本語入力: 銘柄名の部分一致
      if (stock.name.includes(trimmed) || normalizedName.includes(normalizedQuery)) {
        results.push({
          symbol: stock.symbol,
          name: stock.name,
          exchange: "Tokyo",
          type: "EQUITY",
        });
      }
    } else {
      // 英数字入力: シンボル前方一致 or 銘柄名部分一致
      const symbolWithoutSuffix = stock.symbol.replace(".T", "");
      if (
        symbolWithoutSuffix.startsWith(trimmed) ||
        stock.symbol.toLowerCase().startsWith(lowerQuery) ||
        normalizedName.includes(normalizedQuery)
      ) {
        results.push({
          symbol: stock.symbol,
          name: stock.name,
          exchange: "Tokyo",
          type: "EQUITY",
        });
      }
    }
  }

  return results;
}
