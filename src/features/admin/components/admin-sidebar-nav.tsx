"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { AdminNavigationItem } from "../navigation";

type AdminSidebarNavProps = {
  items: readonly AdminNavigationItem[];
};

export function AdminSidebarNav({ items }: AdminSidebarNavProps) {
  const pathname = usePathname();

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-3 text-sm" role="status">
        No navigation items are available for this role yet.
      </div>
    );
  }

  return (
    <nav aria-label="Admin navigation" >
      <SidebarMenu className="grid gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <SidebarMenuItem key={item.href} >
              <SidebarMenuButton asChild className="h-full!">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-start border-2 rounded-xl px-3 text-sm transition-colors",
                    isActive
                      ? "border-primary/55 bg-primary/14 text-foreground shadow-(--shadow-soft)"
                      : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
