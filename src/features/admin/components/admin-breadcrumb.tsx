"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";

import type { AdminNavigationItem } from "../navigation";

type AdminBreadcrumbProps = {
  navItems: readonly AdminNavigationItem[];
};

function getLastSegmentLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment || pathname === routes.admin.dashboard) {
    return "Dashboard";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminBreadcrumb({ navItems }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  const current = navItems.find((item) => item.href === pathname);
  const currentLabel = current?.label ?? getLastSegmentLabel(pathname);

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <li>
          <Link href={routes.admin.dashboard} className="hover:text-foreground transition-colors">
            Admin
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-foreground" aria-current="page">
          {currentLabel}
        </li>
      </ol>
    </nav>
  );
}
