"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useStockSearch } from "@/hooks/useStockSearch";
import type { StockSearchResult } from "@/lib/types/stock";

interface StockSearchBarProps {
  /** 選択時のコールバック。提供時は router.push の代わりに呼ばれる。 */
  onSelect?: (result: StockSearchResult) => void;
  /** 入力変更時のコールバック。親の state と同期するために使用。 */
  onChange?: (value: string) => void;
  /** 入力の初期値。 */
  defaultValue?: string;
  /** カスタムプレースホルダー。 */
  placeholder?: string;
  /** 外側 div に追加する CSS クラス。 */
  className?: string;
}

export function StockSearchBar({
  onSelect,
  onChange,
  defaultValue = "",
  placeholder = "銘柄コードまたは企業名を検索...",
  className,
}: StockSearchBarProps = {}) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useStockSearch(query);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    onChange?.(newValue);
  };

  const handleSelect = (result: StockSearchResult) => {
    setIsOpen(false);
    if (onSelect) {
      setQuery(result.symbol);
      onChange?.(result.symbol);
      onSelect(result);
    } else {
      setQuery("");
      router.push(`/stocks/${encodeURIComponent(result.symbol)}`);
    }
  };

  return (
    <div ref={ref} className={`relative w-full max-w-lg ${className ?? ""}`}>
      <div className="flex items-center rounded-lg border border-card-border bg-card px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
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
              onClick={() => handleSelect(r)}
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
