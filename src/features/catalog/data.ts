import type { CatalogProductCard, ProductImage, ProductReview, ProductReviewSummary, ProductSpec, ProductVariantGroup } from "./types";

type CatalogCategorySeed = {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
};

type CatalogProductSeed = Omit<CatalogProductCard, "href"> & {
  featuredRank: number;
  newestRank: number;
};

export const catalogCategorySeeds: CatalogCategorySeed[] = [
  {
    id: "category-home-care",
    name: "Home Care",
    slug: "home-care",
    description: "Cleaning, laundry, and restock-friendly home essentials.",
    seoTitle: "Home Care Essentials",
    seoDescription: "Shop Karachi-ready home care products with simple filtering and clean category URLs.",
  },
  {
    id: "category-grocery",
    name: "Grocery",
    slug: "grocery",
    description: "Pantry staples, snacks, and quick household top-ups.",
    seoTitle: "Grocery Staples",
    seoDescription: "Browse pantry and grocery essentials with simple price, stock, and discount filters.",
  },
  {
    id: "category-personal-care",
    name: "Personal Care",
    slug: "personal-care",
    description: "Daily-use hygiene, skincare, and wellness basics.",
    seoTitle: "Personal Care Picks",
    seoDescription: "Explore personal care products through scalable category listing scaffolds.",
  },
];

export const catalogProductSeeds: CatalogProductSeed[] = [
  {
    id: "product-ultra-wash",
    slug: "ultra-wash-detergent-1kg",
    name: "Ultra Wash Detergent 1kg",
    description: "Strong stain removal for everyday laundry loads.",
    categorySlug: "home-care",
    price: 899,
    compareAt: 1099,
    inventoryQuantity: 18,
    averageRating: 4.7,
    reviewCount: 32,
    imageLabel: "Laundry care",
    imageTone: "sky",
    attributeSummary: ["Powder", "1kg"],
    featuredRank: 1,
    newestRank: 4,
  },
  {
    id: "product-floor-cleaner",
    slug: "citrus-floor-cleaner-900ml",
    name: "Citrus Floor Cleaner 900ml",
    description: "Fresh-scent floor cleaner for daily mopping.",
    categorySlug: "home-care",
    price: 499,
    compareAt: 649,
    inventoryQuantity: 4,
    averageRating: 4.2,
    reviewCount: 11,
    imageLabel: "Floor cleaner",
    imageTone: "emerald",
    attributeSummary: ["Citrus", "900ml"],
    featuredRank: 2,
    newestRank: 6,
  },
  {
    id: "product-trash-bags",
    slug: "drawstring-trash-bags-30-pack",
    name: "Drawstring Trash Bags 30 Pack",
    description: "Leak-resistant bags for kitchen and utility use.",
    categorySlug: "home-care",
    price: 349,
    inventoryQuantity: 0,
    averageRating: 3.9,
    reviewCount: 8,
    imageLabel: "Trash bags",
    imageTone: "slate",
    attributeSummary: ["30 bags", "Medium"],
    featuredRank: 3,
    newestRank: 8,
  },
  {
    id: "product-olive-blend",
    slug: "olive-blend-cooking-oil-1l",
    name: "Olive Blend Cooking Oil 1L",
    description: "Daily-use blend for frying, sauteing, and salad prep.",
    categorySlug: "grocery",
    price: 1299,
    compareAt: 1499,
    inventoryQuantity: 9,
    averageRating: 4.8,
    reviewCount: 45,
    imageLabel: "Cooking oil",
    imageTone: "amber",
    attributeSummary: ["1L", "Bottle"],
    featuredRank: 4,
    newestRank: 2,
  },
  {
    id: "product-basmati-rice",
    slug: "premium-basmati-rice-5kg",
    name: "Premium Basmati Rice 5kg",
    description: "Long-grain rice for family meals and weekend hosting.",
    categorySlug: "grocery",
    price: 2099,
    compareAt: 2499,
    inventoryQuantity: 12,
    averageRating: 4.6,
    reviewCount: 27,
    imageLabel: "Rice pack",
    imageTone: "rose",
    attributeSummary: ["5kg", "Family pack"],
    featuredRank: 5,
    newestRank: 1,
  },
  {
    id: "product-tea-bags",
    slug: "strong-brew-tea-bags-100-pack",
    name: "Strong Brew Tea Bags 100 Pack",
    description: "Daily chai essential with a strong, balanced flavor.",
    categorySlug: "grocery",
    price: 599,
    inventoryQuantity: 3,
    averageRating: 4.1,
    reviewCount: 14,
    imageLabel: "Tea bags",
    imageTone: "sky",
    attributeSummary: ["100 tea bags", "Black tea"],
    featuredRank: 6,
    newestRank: 5,
  },
  {
    id: "product-face-wash",
    slug: "hydra-care-face-wash",
    name: "Hydra Care Face Wash",
    description: "Gentle daily cleanser made for repeat use.",
    categorySlug: "personal-care",
    price: 699,
    inventoryQuantity: 22,
    averageRating: 4.5,
    reviewCount: 19,
    imageLabel: "Face wash",
    imageTone: "emerald",
    attributeSummary: ["100ml", "Daily care"],
    featuredRank: 7,
    newestRank: 3,
  },
  {
    id: "product-body-lotion",
    slug: "silk-soft-body-lotion-250ml",
    name: "Silk Soft Body Lotion 250ml",
    description: "Lightweight hydration for dry and normal skin.",
    categorySlug: "personal-care",
    price: 849,
    compareAt: 999,
    inventoryQuantity: 5,
    averageRating: 4.3,
    reviewCount: 16,
    imageLabel: "Body lotion",
    imageTone: "rose",
    attributeSummary: ["250ml", "Moisturizing"],
    featuredRank: 8,
    newestRank: 7,
  },
  {
    id: "product-toothpaste",
    slug: "fresh-mint-toothpaste-120g",
    name: "Fresh Mint Toothpaste 120g",
    description: "Everyday oral care with a clean mint finish.",
    categorySlug: "personal-care",
    price: 279,
    compareAt: 349,
    inventoryQuantity: 14,
    averageRating: 4.0,
    reviewCount: 9,
    imageLabel: "Toothpaste",
    imageTone: "slate",
    attributeSummary: ["120g", "Mint"],
    featuredRank: 9,
    newestRank: 9,
  },
];

// ---------------------------------------------------------------------------
// Product detail seed data (supplements the card seeds on PDP)
// ---------------------------------------------------------------------------

type ProductDetailExtra = {
  sku: string;
  shortDescription: string;
  longDescription: string;
  images: ProductImage[];
  specifications: ProductSpec[];
  variantGroups: ProductVariantGroup[];
  reviews: ProductReview[];
  reviewSummary: ProductReviewSummary;
};

export const catalogProductDetailSeeds: Record<string, ProductDetailExtra> = {
  "ultra-wash-detergent-1kg": {
    sku: "UWD-1KG-001",
    shortDescription: "Powerful enzyme-based powder formula for heavily soiled everyday laundry.",
    longDescription:
      "Ultra Wash Detergent uses a dual-enzyme system to break down grease, grass, and food stains in both top-load and front-load machines. The pleasant fresh-linen fragrance fades after drying so clothes smell clean without overpowering scent.",
    images: [
      { id: "img-uwd-1", label: "Front pack shot", tone: "sky", isPrimary: true },
      { id: "img-uwd-2", label: "Usage scene - machine", tone: "sky", isPrimary: false },
      { id: "img-uwd-3", label: "Ingredient list closeup", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Form", value: "Powder" },
      { label: "Net weight", value: "1,000 g" },
      { label: "Washes per pack", value: "Approx. 20" },
      { label: "Machine compatibility", value: "Top-load & front-load" },
      { label: "Fragrance", value: "Fresh linen" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [
      {
        id: "vg-size",
        name: "Size",
        options: [
          { id: "vo-1kg", label: "1 kg", sku: "UWD-1KG-001", price: 899, compareAt: 1099, inventoryQuantity: 18 },
          { id: "vo-2kg", label: "2 kg", sku: "UWD-2KG-001", price: 1599, compareAt: 1999, inventoryQuantity: 7 },
          { id: "vo-500g", label: "500 g", sku: "UWD-500G-001", price: 499, inventoryQuantity: 0 },
        ],
      },
    ],
    reviews: [
      {
        id: "rev-uwd-1",
        author: "Samina K.",
        rating: 5,
        comment: "Best detergent I've used. Removes stubborn chai stains without fading colours.",
        date: "2026-03-20",
        verified: true,
      },
      {
        id: "rev-uwd-2",
        author: "Tariq M.",
        rating: 4,
        comment: "Good value for the price. Wish the 2kg bag had a handle.",
        date: "2026-03-05",
        verified: true,
      },
      {
        id: "rev-uwd-3",
        author: "Nadia R.",
        rating: 5,
        comment: "Works perfectly in my front-loader and smells lovely.",
        date: "2026-02-18",
        verified: false,
      },
    ],
    reviewSummary: { averageRating: 4.7, totalCount: 32, distribution: { 5: 22, 4: 7, 3: 2, 2: 1, 1: 0 } },
  },
  "citrus-floor-cleaner-900ml": {
    sku: "CFC-900ML-001",
    shortDescription: "Antibacterial citrus formula with long-lasting freshness for tiled and marble floors.",
    longDescription:
      "Citrus Floor Cleaner combines a mild antibacterial agent with orange-peel extract to leave floors sparkling and scented without leaving a sticky residue. Dilute one cap in a bucket of water for daily mopping.",
    images: [
      { id: "img-cfc-1", label: "Bottle front", tone: "emerald", isPrimary: true },
      { id: "img-cfc-2", label: "Dilution guide", tone: "emerald", isPrimary: false },
      { id: "img-cfc-3", label: "Mopped floor result", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Form", value: "Liquid" },
      { label: "Volume", value: "900 ml" },
      { label: "Fragrance", value: "Citrus / Orange" },
      { label: "Surface", value: "Marble, tiles, vinyl" },
      { label: "Antibacterial", value: "Yes" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-cfc-1",
        author: "Hira A.",
        rating: 4,
        comment: "Long-lasting scent. Floors look clean after each mop.",
        date: "2026-03-10",
        verified: true,
      },
      {
        id: "rev-cfc-2",
        author: "Usman B.",
        rating: 4,
        comment: "Good antibacterial product, dilutes well.",
        date: "2026-02-25",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.2, totalCount: 11, distribution: { 5: 4, 4: 5, 3: 1, 2: 1, 1: 0 } },
  },
  "drawstring-trash-bags-30-pack": {
    sku: "DTB-30PK-001",
    shortDescription: "Leak-resistant drawstring bags sized for kitchen and utility bins.",
    longDescription:
      "These medium-duty trash bags feature reinforced side seams and a secure drawstring closure that prevents tipping and spills. Each pack contains 30 bags suitable for standard 10-15 litre kitchen bins.",
    images: [
      { id: "img-dtb-1", label: "Pack front", tone: "slate", isPrimary: true },
      { id: "img-dtb-2", label: "Open bag detail", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Quantity", value: "30 bags" },
      { label: "Capacity", value: "10-15 litres" },
      { label: "Closure", value: "Drawstring" },
      { label: "Material", value: "LDPE" },
      { label: "Colour", value: "Black" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-dtb-1",
        author: "Amna S.",
        rating: 4,
        comment: "Fits my kitchen bin perfectly. No leaks so far.",
        date: "2026-03-01",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 3.9, totalCount: 8, distribution: { 5: 2, 4: 3, 3: 2, 2: 1, 1: 0 } },
  },
  "olive-blend-cooking-oil-1l": {
    sku: "OBO-1L-001",
    shortDescription: "Light olive-canola blend ideal for everyday Pakistani cooking methods.",
    longDescription:
      "Olive Blend Cooking Oil is a 30/70 extra-light olive and canola blend with a high smoke point suitable for frying, sauteing, and baking. The neutral taste preserves the natural flavours of your dishes while providing heart-healthy unsaturated fats.",
    images: [
      { id: "img-obo-1", label: "Bottle front", tone: "amber", isPrimary: true },
      { id: "img-obo-2", label: "Pour shot", tone: "amber", isPrimary: false },
      { id: "img-obo-3", label: "Nutritional panel", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Type", value: "Olive-canola blend" },
      { label: "Volume", value: "1,000 ml" },
      { label: "Smoke point", value: "Approx. 220 C" },
      { label: "Packaging", value: "PET bottle" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [
      {
        id: "vg-vol",
        name: "Volume",
        options: [
          { id: "vo-1l", label: "1 L", sku: "OBO-1L-001", price: 1299, compareAt: 1499, inventoryQuantity: 9 },
          { id: "vo-3l", label: "3 L", sku: "OBO-3L-001", price: 3499, compareAt: 3999, inventoryQuantity: 4 },
        ],
      },
    ],
    reviews: [
      {
        id: "rev-obo-1",
        author: "Fatima Z.",
        rating: 5,
        comment: "My go-to for daily cooking. Lighter than pure olive oil.",
        date: "2026-03-28",
        verified: true,
      },
      {
        id: "rev-obo-2",
        author: "Ahmed K.",
        rating: 5,
        comment: "Excellent quality. Will order the 3L next time.",
        date: "2026-03-15",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.8, totalCount: 45, distribution: { 5: 38, 4: 5, 3: 1, 2: 0, 1: 1 } },
  },
  "premium-basmati-rice-5kg": {
    sku: "PBR-5KG-001",
    shortDescription: "Aged long-grain basmati with natural aroma for biryani and pilaf.",
    longDescription:
      "Sourced from the premium basmati belt of Punjab and aged for 12 months for maximum elongation and aroma, this 5 kg family pack is ideal for weekly biryani, white rice, and pilaf. The grains cook separate and fluffy every time.",
    images: [
      { id: "img-pbr-1", label: "Sealed bag", tone: "rose", isPrimary: true },
      { id: "img-pbr-2", label: "Grain closeup", tone: "rose", isPrimary: false },
      { id: "img-pbr-3", label: "Cooked serving", tone: "amber", isPrimary: false },
    ],
    specifications: [
      { label: "Type", value: "Aged long-grain basmati" },
      { label: "Net weight", value: "5 kg" },
      { label: "Aging", value: "12 months" },
      { label: "Packaging", value: "Sealed poly bag" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-pbr-1",
        author: "Zainab H.",
        rating: 5,
        comment: "Perfect for Sunday biryani. Grains are long and don't stick.",
        date: "2026-04-01",
        verified: true,
      },
      {
        id: "rev-pbr-2",
        author: "Bilal T.",
        rating: 4,
        comment: "Good aroma, great value for a 5 kg bag.",
        date: "2026-03-20",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.6, totalCount: 27, distribution: { 5: 18, 4: 7, 3: 1, 2: 1, 1: 0 } },
  },
  "strong-brew-tea-bags-100-pack": {
    sku: "SBT-100PK-001",
    shortDescription: "Full-bodied CTC black tea for a bold, traditional Pakistani chai.",
    longDescription:
      "Strong Brew Tea Bags use a CTC (crush-tear-curl) process to release bold, malty flavour quickly. Each string-tied bag delivers an evenly brewed cup in two to three minutes and pairs well with milk and cardamom for the classic doodh patti experience.",
    images: [
      { id: "img-sbt-1", label: "Box front", tone: "sky", isPrimary: true },
      { id: "img-sbt-2", label: "Single bag closeup", tone: "sky", isPrimary: false },
    ],
    specifications: [
      { label: "Quantity", value: "100 tea bags" },
      { label: "Type", value: "CTC black tea" },
      { label: "Brew time", value: "2-3 minutes" },
      { label: "Caffeine", value: "Medium-high" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-sbt-1",
        author: "Shahid A.",
        rating: 4,
        comment: "Strong flavour, exactly what I need for morning doodh patti.",
        date: "2026-03-22",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.1, totalCount: 14, distribution: { 5: 5, 4: 6, 3: 2, 2: 1, 1: 0 } },
  },
  "hydra-care-face-wash": {
    sku: "HCF-100ML-001",
    shortDescription: "Soap-free, pH-balanced daily cleanser with aloe vera and niacinamide.",
    longDescription:
      "Hydra Care Face Wash is dermatologist-tested and free from SLS, parabens, and artificial colourants. The gel formula lifts impurities gently while the niacinamide complex helps even skin tone over time. Suitable for normal, combination, and sensitive skin.",
    images: [
      { id: "img-hcf-1", label: "Tube front", tone: "emerald", isPrimary: true },
      { id: "img-hcf-2", label: "Dispense shot", tone: "emerald", isPrimary: false },
      { id: "img-hcf-3", label: "Ingredient panel", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Form", value: "Gel" },
      { label: "Volume", value: "100 ml" },
      { label: "Key actives", value: "Aloe vera, Niacinamide" },
      { label: "Skin type", value: "Normal, combination, sensitive" },
      { label: "SLS-free", value: "Yes" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [
      {
        id: "vg-size",
        name: "Size",
        options: [
          { id: "vo-100ml", label: "100 ml", sku: "HCF-100ML-001", price: 699, inventoryQuantity: 22 },
          { id: "vo-200ml", label: "200 ml", sku: "HCF-200ML-001", price: 1199, compareAt: 1399, inventoryQuantity: 9 },
          { id: "vo-50ml", label: "50 ml (travel)", sku: "HCF-50ML-001", price: 399, inventoryQuantity: 3 },
        ],
      },
    ],
    reviews: [
      {
        id: "rev-hcf-1",
        author: "Mariam I.",
        rating: 5,
        comment: "Skin feels clean without tightness after washing. Love this product.",
        date: "2026-03-30",
        verified: true,
      },
      {
        id: "rev-hcf-2",
        author: "Sara Q.",
        rating: 4,
        comment: "Gentle enough for daily use. Slight niacinamide brightening visible in 3 weeks.",
        date: "2026-03-12",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.5, totalCount: 19, distribution: { 5: 11, 4: 6, 3: 1, 2: 1, 1: 0 } },
  },
  "silk-soft-body-lotion-250ml": {
    sku: "SSL-250ML-001",
    shortDescription: "Fast-absorbing non-greasy lotion with shea butter and vitamin E.",
    longDescription:
      "Silk Soft Body Lotion absorbs within 60 seconds without leaving a white cast or greasy film, making it ideal for morning use before getting dressed. Shea butter and vitamin E provide 24-hour moisturisation suited to Karachi's dry winter months.",
    images: [
      { id: "img-ssl-1", label: "Bottle front", tone: "rose", isPrimary: true },
      { id: "img-ssl-2", label: "Pump detail", tone: "rose", isPrimary: false },
    ],
    specifications: [
      { label: "Form", value: "Lotion" },
      { label: "Volume", value: "250 ml" },
      { label: "Key actives", value: "Shea butter, Vitamin E" },
      { label: "Absorption", value: "< 60 seconds" },
      { label: "Fragrance", value: "Lightly scented" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-ssl-1",
        author: "Kiran P.",
        rating: 4,
        comment: "Good consistency, absorbs quickly. Mild but pleasant scent.",
        date: "2026-02-28",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.3, totalCount: 16, distribution: { 5: 7, 4: 7, 3: 1, 2: 1, 1: 0 } },
  },
  "fresh-mint-toothpaste-120g": {
    sku: "FMT-120G-001",
    shortDescription: "Fluoride-rich mint paste with cavity-protection and whitening action.",
    longDescription:
      "Fresh Mint Toothpaste delivers 1,450 ppm fluoride for strong enamel protection, paired with mild micro-particles for gentle daily polishing. The crisp spearmint flavour leaves breath fresh for up to four hours.",
    images: [
      { id: "img-fmt-1", label: "Tube front", tone: "slate", isPrimary: true },
      { id: "img-fmt-2", label: "Cap and tube", tone: "slate", isPrimary: false },
    ],
    specifications: [
      { label: "Form", value: "Paste" },
      { label: "Net weight", value: "120 g" },
      { label: "Fluoride", value: "1,450 ppm" },
      { label: "Action", value: "Cavity protection + whitening" },
      { label: "Flavour", value: "Spearmint" },
      { label: "Country of origin", value: "Pakistan" },
    ],
    variantGroups: [],
    reviews: [
      {
        id: "rev-fmt-1",
        author: "Raza N.",
        rating: 4,
        comment: "Strong mint. Keeps breath fresh well past lunch.",
        date: "2026-03-08",
        verified: true,
      },
    ],
    reviewSummary: { averageRating: 4.0, totalCount: 9, distribution: { 5: 3, 4: 4, 3: 1, 2: 1, 1: 0 } },
  },
};
