import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { routes } from "@/config/routes";
import { requireAdminAccess } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { role, session } = await requireAdminAccess({ from: routes.admin.dashboard });

  return (
    <AdminShell role={role} user={session.user}>
      {children}
    </AdminShell>
  );
}
