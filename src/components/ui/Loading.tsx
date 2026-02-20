interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className = "", text }: LoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-accent" />
      {text && <span className="text-sm text-muted">{text}</span>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-card-border/50 ${className}`}
    />
  );
}
