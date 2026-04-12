import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function AccountPage() {
  redirect(routes.storefront.accountProfile);
}
