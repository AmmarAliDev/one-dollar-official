import { routes } from "@/config/routes";

type CategoryMenuInput = {
  name: string;
  href: string;
};

export type StorefrontCategoryMenuItem = {
  title: string;
  href: string;
  kind: "one-dollar" | "category" | "all-categories";
};

const ONE_DOLLAR_LABEL = "One Dollar";

function normalizeLabel(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function buildStorefrontCategoryMenu(
  categories: readonly CategoryMenuInput[],
): StorefrontCategoryMenuItem[] {
  const oneDollarCategory = categories.find(
    (category) => normalizeLabel(category.name) === normalizeLabel(ONE_DOLLAR_LABEL),
  );

  const otherCategories = categories
    .filter((category) => normalizeLabel(category.name) !== normalizeLabel(ONE_DOLLAR_LABEL))
    .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));

  return [
    {
      title: ONE_DOLLAR_LABEL,
      href: oneDollarCategory?.href ?? routes.storefront.home,
      kind: "one-dollar",
    },
    ...otherCategories.map((category) => ({
      title: category.name,
      href: category.href,
      kind: "category" as const,
    })),
    {
      title: "All Categories",
      href: routes.storefront.categories,
      kind: "all-categories",
    },
  ];
}
