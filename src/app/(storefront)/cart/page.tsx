import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Cart",
  path: "/cart",
  description: "Cart placeholder for the storefront.",
});

export default function CartPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Cart"
      title="Cart"
      description="A placeholder for cart line items and totals planned for Prompt 4.1."
    />
  );
}
