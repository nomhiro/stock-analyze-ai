"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Search, BrainCircuit } from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: BarChart3 },
  { href: "/stocks", label: "銘柄検索", icon: Search },
  { href: "/analysis", label: "AI分析", icon: BrainCircuit },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <BarChart3 className="h-6 w-6 text-accent" />
          <span>Stock Analyzer</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
