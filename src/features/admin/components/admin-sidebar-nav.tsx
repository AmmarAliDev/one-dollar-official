"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { AdminNavigationItem } from "../navigation";

type AdminSidebarNavProps = {
  items: readonly AdminNavigationItem[];
};

export function AdminSidebarNav({ items }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="grid gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "border-primary/55 bg-primary/14 text-foreground shadow-(--shadow-soft)"
                : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <p className="font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
