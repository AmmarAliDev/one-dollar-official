# Technical SEO Architecture

## Overview
The SEO architecture integrates standard Next.js metadata and app routing capabilities (`sitemap.ts`, `robots.ts`) with custom, modular builder functions for products, categories, and articles.

## Key Files
- `src/config/metadata.ts`: Exports `buildMetadata` and specific helper factories (e.g. `buildProductMetadata`) to generate Page/Layout metadata.
- `src/app/robots.ts`: Next.js robots.txt generation. Protects admin and internal paths.
- `src/app/sitemap.ts`: Generates sitemaps automatically. Intended to be expanded and fetched via ISR.
- `src/lib/seo/slug.ts`: Pure functions for strict slug normalization and canonical URL resolution ensuring exact matches.
- `src/lib/seo/structured-data.tsx`: Builder functions and a React component (`<StructuredData />`) for injecting JSON-LD (Organization, Breadcrumb, Product, Article tags).

## Implementation Details

### Metadata Validation
All paths should be resolved into canonical formats ensuring no duplicate paths via trailing slashes exist, preserving link equity via `resolveCanonicalUrl`.

### Structured Data Injection
Wherever required, import JSON-LD builders and insert the output directly to the DOM using the `<StructuredData data={...} />` component. For example:
```tsx
const productSchema = generateProductJsonLd({ ... });
return (
  <>
    <StructuredData data={productSchema} />
    ...
  </>
);
```

### Server Side Generation
Use metadata builders inside layout/page `generateMetadata` exports.
```typescript
import { buildArticleMetadata } from "@/config/metadata";
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  return buildArticleMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
  });
}
```
