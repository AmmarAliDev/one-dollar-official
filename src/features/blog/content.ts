import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    id: "blog-en-budget-grocery-basket",
    locale: "en",
    title: "Build a Weekly Budget Grocery Basket in Karachi",
    slug: "weekly-budget-grocery-basket-karachi",
    excerpt:
      "A practical seven-day basket planning framework that keeps essentials in stock while reducing waste and impulse spending.",
    content: [
      {
        type: "paragraph",
        text: "Budget planning works best when each grocery run follows a repeatable checklist. Start by separating your basket into essentials, flexible add-ons, and optional treats.",
      },
      {
        type: "heading",
        level: 2,
        text: "Focus on staple-first planning",
      },
      {
        type: "paragraph",
        text: "Prioritize flour, rice, lentils, cooking oil, and tea before adding snacks or seasonal items. This keeps the basket useful even when prices shift week to week.",
      },
      {
        type: "list",
        items: [
          "Create a fixed staple list that repeats every week.",
          "Assign a spending cap per category before checkout.",
          "Track only three metrics: spend, waste, and refill frequency.",
        ],
      },
      {
        type: "quote",
        text: "Small weekly adjustments beat one large monthly correction.",
      },
    ],
    coverImage: {
      src: "/blog/budget-basket.svg",
      alt: "Paper grocery bag with essential pantry items",
      width: 1200,
      height: 630,
    },
    status: "published",
    publishedAt: "2026-04-16T09:30:00.000Z",
    seo: {
      metaTitle: "Weekly Budget Grocery Basket Guide | One Dollar Blog",
      metaDescription:
        "Learn a practical weekly grocery basket strategy for Karachi households, including staple planning, spend caps, and waste reduction tips.",
      ogTitle: "Weekly Budget Grocery Basket Guide",
      ogDescription:
        "Plan essentials first, reduce waste, and keep your grocery budget predictable.",
      ogImage: "/blog/budget-basket.svg",
      structuredDataNotes:
        "Add FAQ schema later when admin publishing supports FAQ pairs.",
    },
  },
  {
    id: "blog-en-household-restock-routine",
    locale: "en",
    title: "How to Build a Reliable Home Restock Routine",
    slug: "home-restock-routine-checklist",
    excerpt:
      "Set up a low-friction restock rhythm for home-care and personal-care essentials using inventory checkpoints and reorder triggers.",
    content: [
      {
        type: "paragraph",
        text: "Most urgent shopping happens because reorder points are unknown. A simple weekly inspection routine helps keep your home stocked without overbuying.",
      },
      {
        type: "heading",
        level: 2,
        text: "Use visible thresholds",
      },
      {
        type: "paragraph",
        text: "Define a threshold for each item category, such as one unopened pack for detergents or two spare soaps. Reorder when inventory reaches that line.",
      },
      {
        type: "list",
        items: [
          "Check restock zones every Sunday evening.",
          "Record low-stock items in one running note.",
          "Bundle replacements by category to reduce delivery fees.",
        ],
      },
    ],
    coverImage: {
      src: "/blog/restock-routine.svg",
      alt: "Household shelves with cleaning and personal care items",
      width: 1200,
      height: 630,
    },
    status: "published",
    publishedAt: "2026-04-18T11:00:00.000Z",
    seo: {
      metaTitle: "Home Restock Routine Checklist | One Dollar Blog",
      metaDescription:
        "Create a dependable restock checklist for home and personal care essentials with practical thresholds and reorder triggers.",
      ogImage: "/blog/restock-routine.svg",
    },
  },
  {
    id: "blog-en-ramadan-pantry-planning",
    locale: "en",
    title: "Seasonal Pantry Planning for Ramadan",
    slug: "seasonal-pantry-planning-ramadan",
    excerpt:
      "A draft planning template for balancing staple pantry items and iftar-specific ingredients during high-demand weeks.",
    content: [
      {
        type: "paragraph",
        text: "This draft post outlines a seasonal pantry approach that can be published after reviewing final product availability and regional pricing updates.",
      },
    ],
    coverImage: {
      src: "/blog/seasonal-planning.svg",
      alt: "Pantry shelves with labeled jars and weekly planning notes",
      width: 1200,
      height: 630,
    },
    status: "draft",
    publishedAt: "2026-04-25T07:15:00.000Z",
    seo: {
      metaTitle: "Seasonal Pantry Planning for Ramadan",
      metaDescription:
        "Draft guidance for planning pantry essentials and special-occasion ingredients during Ramadan.",
      noIndex: true,
      structuredDataNotes: "Keep noindex enabled until this draft is reviewed and published.",
    },
  },
];
