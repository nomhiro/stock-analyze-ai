import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = "", title }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-card-border bg-card p-4 ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      )}
      {children}
    </div>
  );
}
