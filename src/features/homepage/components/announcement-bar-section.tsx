import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

import type { AnnouncementBarSection } from "../types";

type AnnouncementBarSectionProps = {
  section: AnnouncementBarSection;
};

export function AnnouncementBarSectionBlock({ section }: AnnouncementBarSectionProps) {
  return (
    <PageContainer as="section" className="pt-4">
      <div className="bg-primary text-primary-foreground rounded-[var(--radius-card)] px-4 py-3 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{section.message}</p>
          {section.href ? (
            <Link href={section.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              {section.label ?? "Learn more"}
            </Link>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
