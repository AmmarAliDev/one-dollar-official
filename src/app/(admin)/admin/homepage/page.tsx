import Link from "next/link";
import { LayoutTemplate, Megaphone, SquareStack, Tags } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { listAdminBanners, listAdminDealCampaigns, listAdminHomepageSections } from "@/features/admin/homepage";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

export const metadata = buildMetadata({
  title: "Homepage Content",
  path: routes.admin.homepage,
  description: "Manage homepage sections, banners, and deal campaign visibility.",
});

const adminHomepageCards = [
  {
    title: "Homepage sections",
    description: "Edit section content, ordering, enablement, and scheduling.",
    href: routes.admin.homepageSections,
    icon: LayoutTemplate,
  },
  {
    title: "Banners",
    description: "Manage active promo banners that can surface as announcement strips.",
    href: routes.admin.homepageBanners,
    icon: Megaphone,
  },
  {
    title: "Deal campaigns",
    description: "Schedule campaign windows and keep storefront promotions current.",
    href: routes.admin.homepageCampaigns,
    icon: Tags,
  },
] as const;

export default async function AdminHomepagePage() {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.settingsManage],
    from: routes.admin.homepage,
  });

  const [sections, banners, campaigns] = await Promise.all([
    listAdminHomepageSections(),
    listAdminBanners(),
    listAdminDealCampaigns(),
  ]);

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Content"
        title="Homepage management"
        description="Keep storefront messaging flexible through admin-managed sections, banner promos, and campaign schedules. Announcement bar support is available through banner records and the announcement-bar section type."
        actions={
          <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline", size: "sm" })}>
            View storefront
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{sections.length}</CardTitle>
            <CardDescription>Managed homepage sections</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{banners.filter((item) => item.active).length}</CardTitle>
            <CardDescription>Active banners</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{campaigns.filter((item) => item.active).length}</CardTitle>
            <CardDescription>Active deal campaigns</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {adminHomepageCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.href}>
              <CardHeader>
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Icon className="size-4" />
                  <span className="text-sm font-medium">Homepage tools</span>
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={item.href} className={buttonVariants({ size: "sm" })}>
                  Open page
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <SquareStack className="mt-0.5 size-4" />
          <p>
            Storefront rendering stays contract-based. Admin updates are validated first, logged to the audit trail, and then revalidated on the homepage.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
