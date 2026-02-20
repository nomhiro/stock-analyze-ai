"use client";

interface IndicatorToggleProps {
  indicators: { id: string; label: string; active: boolean }[];
  onToggle: (id: string) => void;
}

export function IndicatorToggle({
  indicators,
  onToggle,
}: IndicatorToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-muted">指標:</span>
      {indicators.map((ind) => (
        <button
          key={ind.id}
          onClick={() => onToggle(ind.id)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            ind.active
              ? "bg-accent/15 text-accent"
              : "bg-card-border/30 text-muted hover:text-foreground"
          }`}
        >
          {ind.label}
        </button>
      ))}
    </div>
  );
}
