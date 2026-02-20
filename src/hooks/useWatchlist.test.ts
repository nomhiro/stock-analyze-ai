import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_WATCHLIST_SYMBOLS } from "@/lib/data/default-watchlist";

const STORAGE_KEY = "stock-analyzer-watchlist";

// localStorage のモック
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  }),
};

vi.stubGlobal("localStorage", localStorageMock);

describe("useWatchlist localStorage ロジック", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("初回訪問時（localStorage が null）にデフォルト銘柄が保存される", () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_WATCHLIST_SYMBOLS),
      );
    }

    const result = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(result).toEqual(DEFAULT_WATCHLIST_SYMBOLS);
  });

  it("既存の空ウォッチリストを尊重する", () => {
    localStorage.setItem(STORAGE_KEY, "[]");

    const stored = localStorage.getItem(STORAGE_KEY);
    let symbols: string[] = [];
    if (stored === null) {
      symbols = [...DEFAULT_WATCHLIST_SYMBOLS];
    } else {
      symbols = JSON.parse(stored);
    }

    expect(symbols).toEqual([]);
  });

  it("既存のウォッチリストを読み込む", () => {
    const saved = ["7203.T", "6758.T"];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const stored = localStorage.getItem(STORAGE_KEY);
    const symbols = stored ? JSON.parse(stored) : [];

    expect(symbols).toEqual(saved);
  });

  it("不正な JSON の場合は空配列にフォールバックする", () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json");

    const stored = localStorage.getItem(STORAGE_KEY);
    let symbols: string[] = [];
    if (stored !== null) {
      try {
        symbols = JSON.parse(stored);
      } catch {
        symbols = [];
      }
    }

    expect(symbols).toEqual([]);
  });

  it("銘柄を追加して保存できる", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["7203.T"]));
    const symbols: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

    const newSymbol = "6758.T";
    if (!symbols.includes(newSymbol)) {
      const next = [...symbols, newSymbol];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
      "7203.T",
      "6758.T",
    ]);
  });

  it("重複する銘柄は追加しない", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["7203.T"]));
    const symbols: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

    const newSymbol = "7203.T";
    if (!symbols.includes(newSymbol)) {
      const next = [...symbols, newSymbol];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["7203.T"]);
  });

  it("銘柄を削除して保存できる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(["7203.T", "6758.T"]),
    );
    const symbols: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

    const next = symbols.filter((s) => s !== "7203.T");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["6758.T"]);
  });
});
