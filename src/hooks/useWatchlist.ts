"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_WATCHLIST_SYMBOLS } from "@/lib/data/default-watchlist";

const STORAGE_KEY = "stock-analyzer-watchlist";

let listeners: Array<() => void> = [];
let cachedSymbols: string[] | null = null;
let cachedRaw: string | null | undefined = undefined;

function emitChange() {
  cachedSymbols = null;
  cachedRaw = undefined;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRaw && cachedSymbols !== null) {
    return cachedSymbols;
  }

  let result: string[];
  if (raw === null) {
    // 初回訪問: デフォルト銘柄で初期化
    result = [...DEFAULT_WATCHLIST_SYMBOLS];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    cachedRaw = localStorage.getItem(STORAGE_KEY);
  } else {
    cachedRaw = raw;
    try {
      result = JSON.parse(raw);
    } catch {
      result = [];
    }
  }

  cachedSymbols = result;
  return result;
}

const serverSnapshot: string[] = [];
function getServerSnapshot(): string[] {
  return serverSnapshot;
}

function saveToStorage(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedSymbols = null;
  cachedRaw = undefined;
  emitChange();
}

export function useWatchlist() {
  const symbols = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const add = useCallback(
    (symbol: string) => {
      if (!symbols.includes(symbol)) {
        saveToStorage([...symbols, symbol]);
      }
    },
    [symbols],
  );

  const remove = useCallback(
    (symbol: string) => {
      saveToStorage(symbols.filter((s) => s !== symbol));
    },
    [symbols],
  );

  const has = useCallback(
    (symbol: string) => symbols.includes(symbol),
    [symbols],
  );

  return { symbols, add, remove, has };
}
