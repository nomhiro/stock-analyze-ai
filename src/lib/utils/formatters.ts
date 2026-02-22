export function formatJPY(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(1)}兆`;
  }
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}億`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(1)}万`;
  }
  return value.toLocaleString("ja-JP");
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  return value.toLocaleString("ja-JP");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * マーケットデータの時刻を「○月○日 HH:MM 時点」形式でフォーマットする。
 * 今日のデータなら「今日 15:00 時点」、昨日なら「昨日 15:00 時点」、
 * それ以外は「2/20 15:00 時点」と表示する。
 */
const JST = "Asia/Tokyo";

export function formatMarketTime(
  isoString: string,
  now: Date = new Date(),
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const timeStr = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: JST,
  }).format(date);

  // JST での日付文字列を取得して比較する
  const jstDateStr = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: JST,
    }).format(d); // YYYY-MM-DD

  const todayStr = jstDateStr(now);
  const targetStr = jstDateStr(date);

  if (todayStr === targetStr) {
    return `今日 ${timeStr} 時点`;
  }

  // 昨日の判定: now から1日引いた JST 日付と比較
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (jstDateStr(yesterday) === targetStr) {
    return `昨日 ${timeStr} 時点`;
  }

  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    timeZone: JST,
  }).format(date);
  return `${dateLabel} ${timeStr} 時点`;
}
