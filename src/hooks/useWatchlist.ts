"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "stock-analyzer-watchlist";

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSymbols(JSON.parse(stored));
      } catch {
        setSymbols([]);
      }
    }
  }, []);

  const save = useCallback((next: string[]) => {
    setSymbols(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (symbol: string) => {
      if (!symbols.includes(symbol)) {
        save([...symbols, symbol]);
      }
    },
    [symbols, save],
  );

  const remove = useCallback(
    (symbol: string) => {
      save(symbols.filter((s) => s !== symbol));
    },
    [symbols, save],
  );

  const has = useCallback(
    (symbol: string) => symbols.includes(symbol),
    [symbols],
  );

  return { symbols, add, remove, has };
}
