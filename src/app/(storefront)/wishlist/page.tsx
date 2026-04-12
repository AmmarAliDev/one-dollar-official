import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Wishlist",
  path: "/wishlist",
  description: "Wishlist placeholder for the storefront.",
});

export default function WishlistPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Customer"
      title="Wishlist"
      description="A placeholder for saved products and sign-in prompts planned in Prompt 3.6."
    />
  );
}
