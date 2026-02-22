import { describe, it, expect } from "vitest";
import { formatMarketTime } from "./formatters";

describe("formatMarketTime", () => {
  it("今日のデータは「今日 HH:MM 時点」と表示する", () => {
    const now = new Date("2026-02-22T18:00:00+09:00");
    const marketTime = "2026-02-22T06:00:00.000Z"; // 15:00 JST

    const result = formatMarketTime(marketTime, now);

    expect(result).toBe("今日 15:00 時点");
  });

  it("昨日のデータは「昨日 HH:MM 時点」と表示する", () => {
    const now = new Date("2026-02-22T10:00:00+09:00");
    const marketTime = "2026-02-21T06:00:00.000Z"; // 昨日 15:00 JST

    const result = formatMarketTime(marketTime, now);

    expect(result).toBe("昨日 15:00 時点");
  });

  it("2日以上前のデータは「M/D HH:MM 時点」と表示する", () => {
    const now = new Date("2026-02-25T10:00:00+09:00");
    const marketTime = "2026-02-20T06:00:00.000Z"; // 2/20 15:00 JST

    const result = formatMarketTime(marketTime, now);

    expect(result).toMatch(/2\/20\s+15:00\s+時点/);
  });

  it("無効な日付文字列では空文字を返す", () => {
    const result = formatMarketTime("invalid-date");
    expect(result).toBe("");
  });

  it("now を省略するとデフォルトで現在時刻を使う", () => {
    const marketTime = new Date().toISOString();
    const result = formatMarketTime(marketTime);

    expect(result).toContain("今日");
    expect(result).toContain("時点");
  });
});
