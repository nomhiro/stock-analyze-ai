"use client";

import { Star } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";

interface WatchlistToggleButtonProps {
  symbol: string;
  size?: "sm" | "md";
  className?: string;
}

export function WatchlistToggleButton({
  symbol,
  size = "sm",
  className = "",
}: WatchlistToggleButtonProps) {
  const { add, remove, has } = useWatchlist();
  const isInWatchlist = has(symbol);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      remove(symbol);
    } else {
      add(symbol);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const padding = size === "sm" ? "p-1" : "p-1.5";

  return (
    <button
      onClick={handleClick}
      className={`rounded-md transition-colors ${padding} ${
        isInWatchlist
          ? "text-yellow-400 hover:text-yellow-500"
          : "text-muted hover:text-yellow-400"
      } ${className}`}
      title={isInWatchlist ? "ウォッチリストから削除" : "ウォッチリストに追加"}
      aria-label={
        isInWatchlist ? "ウォッチリストから削除" : "ウォッチリストに追加"
      }
    >
      <Star
        className={iconSize}
        fill={isInWatchlist ? "currentColor" : "none"}
      />
    </button>
  );
}
