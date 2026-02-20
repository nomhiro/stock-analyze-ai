"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { StockSearchResult } from "@/lib/types/stock";

export function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <div className="flex items-center rounded-lg border border-card-border bg-card px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="銘柄コードまたは企業名を検索..."
          className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-accent" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-card-border bg-card shadow-lg">
          {results.slice(0, 10).map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-card-border/30"
            >
              <div>
                <span className="font-medium">{r.symbol}</span>
                <span className="ml-2 text-muted">{r.name}</span>
              </div>
              <span className="text-xs text-muted">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
