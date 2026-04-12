import Link from "next/link";

import { routes } from "@/config/routes";

import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PageShell } from "./page-shell";

type StaticPagePlaceholderProps = {
  title: string;
  description: string;
  pageTag: string;
};

export function StaticPagePlaceholder({ title, description, pageTag }: StaticPagePlaceholderProps) {
  return (
    <PageShell className="gap-6">
      <div className="space-y-3">
        <Badge variant="secondary">{pageTag}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content placeholder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            This page is intentionally lightweight for Prompt 3.1 and will be expanded in future
            storefront and policy prompts.
          </p>
          <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back to home
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
}
