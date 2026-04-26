-- CreateEnum
CREATE TYPE "blog_post_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "blog_post" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "cover_image_url" TEXT,
    "cover_image_alt" TEXT,
    "cover_image_width" INTEGER,
    "cover_image_height" INTEGER,
    "status" "blog_post_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_canonical_url" TEXT,
    "seo_og_title" TEXT,
    "seo_og_description" TEXT,
    "seo_image_url" TEXT,
    "seo_no_index" BOOLEAN NOT NULL DEFAULT false,
    "seo_schema_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_locale_slug_key" ON "blog_post"("locale", "slug");

-- CreateIndex
CREATE INDEX "blog_post_status_idx" ON "blog_post"("status");

-- CreateIndex
CREATE INDEX "blog_post_published_at_idx" ON "blog_post"("published_at");

-- CreateIndex
CREATE INDEX "blog_post_locale_status_idx" ON "blog_post"("locale", "status");

-- Seed existing blog content previously hardcoded in src/features/blog/content.ts
INSERT INTO "blog_post" (
  "id",
  "locale",
  "title",
  "slug",
  "excerpt",
  "content",
  "cover_image_url",
  "cover_image_alt",
  "cover_image_width",
  "cover_image_height",
  "status",
  "published_at",
  "seo_title",
  "seo_description",
  "seo_og_title",
  "seo_og_description",
  "seo_image_url",
  "seo_no_index",
  "seo_schema_notes"
)
VALUES
(
  'blog-en-budget-grocery-basket',
  'en',
  'Build a Weekly Budget Grocery Basket in Karachi',
  'weekly-budget-grocery-basket-karachi',
  'A practical seven-day basket planning framework that keeps essentials in stock while reducing waste and impulse spending.',
  $$[
    {"type":"paragraph","text":"Budget planning works best when each grocery run follows a repeatable checklist. Start by separating your basket into essentials, flexible add-ons, and optional treats."},
    {"type":"heading","level":2,"text":"Focus on staple-first planning"},
    {"type":"paragraph","text":"Prioritize flour, rice, lentils, cooking oil, and tea before adding snacks or seasonal items. This keeps the basket useful even when prices shift week to week."},
    {"type":"list","items":["Create a fixed staple list that repeats every week.","Assign a spending cap per category before checkout.","Track only three metrics: spend, waste, and refill frequency."]},
    {"type":"quote","text":"Small weekly adjustments beat one large monthly correction."}
  ]$$::jsonb,
  '/blog/budget-basket.svg',
  'Paper grocery bag with essential pantry items',
  1200,
  630,
  'PUBLISHED',
  '2026-04-16T09:30:00.000Z',
  'Weekly Budget Grocery Basket Guide | One Dollar Blog',
  'Learn a practical weekly grocery basket strategy for Karachi households, including staple planning, spend caps, and waste reduction tips.',
  'Weekly Budget Grocery Basket Guide',
  'Plan essentials first, reduce waste, and keep your grocery budget predictable.',
  '/blog/budget-basket.svg',
  false,
  'Add FAQ schema later when admin publishing supports FAQ pairs.'
),
(
  'blog-en-household-restock-routine',
  'en',
  'How to Build a Reliable Home Restock Routine',
  'home-restock-routine-checklist',
  'Set up a low-friction restock rhythm for home-care and personal-care essentials using inventory checkpoints and reorder triggers.',
  $$[
    {"type":"paragraph","text":"Most urgent shopping happens because reorder points are unknown. A simple weekly inspection routine helps keep your home stocked without overbuying."},
    {"type":"heading","level":2,"text":"Use visible thresholds"},
    {"type":"paragraph","text":"Define a threshold for each item category, such as one unopened pack for detergents or two spare soaps. Reorder when inventory reaches that line."},
    {"type":"list","items":["Check restock zones every Sunday evening.","Record low-stock items in one running note.","Bundle replacements by category to reduce delivery fees."]}
  ]$$::jsonb,
  '/blog/restock-routine.svg',
  'Household shelves with cleaning and personal care items',
  1200,
  630,
  'PUBLISHED',
  '2026-04-18T11:00:00.000Z',
  'Home Restock Routine Checklist | One Dollar Blog',
  'Create a dependable restock checklist for home and personal care essentials with practical thresholds and reorder triggers.',
  NULL,
  NULL,
  '/blog/restock-routine.svg',
  false,
  NULL
),
(
  'blog-en-ramadan-pantry-planning',
  'en',
  'Seasonal Pantry Planning for Ramadan',
  'seasonal-pantry-planning-ramadan',
  'A draft planning template for balancing staple pantry items and iftar-specific ingredients during high-demand weeks.',
  $$[
    {"type":"paragraph","text":"This draft post outlines a seasonal pantry approach that can be published after reviewing final product availability and regional pricing updates."}
  ]$$::jsonb,
  '/blog/seasonal-planning.svg',
  'Pantry shelves with labeled jars and weekly planning notes',
  1200,
  630,
  'DRAFT',
  NULL,
  'Seasonal Pantry Planning for Ramadan',
  'Draft guidance for planning pantry essentials and special-occasion ingredients during Ramadan.',
  NULL,
  NULL,
  NULL,
  true,
  'Keep noindex enabled until this draft is reviewed and published.'
);
