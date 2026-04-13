import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionErrorState } from "@/components/ui/section-error-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description: string;
  eyebrow: string;
  actions?: ReactNode;
}) {
  return <SectionHeader title={title} description={description} eyebrow={eyebrow} actions={actions} />;
}

type PlaceholderState = "empty" | "loading" | "error";

type AdminTablePatternProps = {
  state: PlaceholderState;
  emptyTitle: string;
  emptyDescription: string;
  errorDescription: string;
};

export function AdminTablePattern({
  state,
  emptyTitle,
  emptyDescription,
  errorDescription,
}: AdminTablePatternProps) {
  if (state === "loading") {
    return (
      <LoadingState
        title="Loading table"
        description="Preparing your latest admin records."
      >
        <TableSkeleton rows={5} columns={4} className="border-none shadow-none" />
      </LoadingState>
    );
  }

  if (state === "error") {
    return <SectionErrorState description={errorDescription} />;
  }

  return <EmptyState title={emptyTitle} description={emptyDescription} />;
}

type AdminListPatternProps = {
  state: PlaceholderState;
  emptyTitle: string;
  emptyDescription: string;
  errorDescription: string;
};

export function AdminListPattern({
  state,
  emptyTitle,
  emptyDescription,
  errorDescription,
}: AdminListPatternProps) {
  if (state === "loading") {
    return (
      <LoadingState
        title="Loading list"
        description="Preparing your latest entries."
      />
    );
  }

  if (state === "error") {
    return <SectionErrorState description={errorDescription} />;
  }

  return <EmptyState title={emptyTitle} description={emptyDescription} />;
}
