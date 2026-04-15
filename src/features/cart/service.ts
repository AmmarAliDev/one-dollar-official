import { randomUUID } from "node:crypto";

import { Currency, ProductStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { routes } from "@/config/routes";
import { catalogCategorySeeds, catalogProductDetailSeeds, catalogProductSeeds } from "@/features/catalog/data";
import { AppError } from "@/lib/errors/app-error";
import type { DatabaseExecutor } from "@/server/db";
import { getPrismaClient, runWithTransaction } from "@/server/db";

import type {
  AddCartItemInput,
  CartItemSummary,
  CartStockIssue,
  CartStockValidationResult,
  CartSummary,
  RemoveCartItemInput,
  ResolveCartContextInput,
  UpdateCartItemInput,
} from "./types";

type ResolveCartSelectionInput = {
  productSlug: string;
  optionId?: string | undefined;
};

type CartSeedSelection = {
  categorySlug: string;
  categoryName: string;
  productSlug: string;
  productName: string;
  shortDescription: string;
  longDescription: string;
  optionId: string | null;
  optionLabel: string | null;
  sku: string;
  price: number;
  compareAt: number | null;
  inventoryQuantity: number;
};

type CartIncludePayload = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        productVariant: {
          include: {
            inventory: true;
            product: {
              include: {
                category: true;
              };
            };
          };
        };
      };
    };
  };
}>;

const MAX_CART_ITEM_QUANTITY = 99;

function normalizeQuantity(quantity: number | undefined) {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(MAX_CART_ITEM_QUANTITY, Math.trunc(quantity)));
}

function getAvailableInventoryQuantity(inventory: { quantity: number; reserved: number; safetyStock: number } | null) {
  if (!inventory) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, inventory.quantity - inventory.reserved - inventory.safetyStock);
}

function generateCartToken() {
  return randomUUID().replace(/-/g, "");
}

function isCartTokenConflict(error: unknown) {
  if (!(error instanceof PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const rawTarget = error.meta?.target;
  const targets = Array.isArray(rawTarget)
    ? rawTarget.map((value) => `${value}`.toLowerCase())
    : typeof rawTarget === "string"
      ? [rawTarget.toLowerCase()]
      : [];

  return targets.some((target) => target.includes("token"));
}

async function createActiveCartWithUniqueToken(
  input: {
    userId?: string | null;
  },
  db: DatabaseExecutor,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.cart.create({
        data: {
          userId: input.userId ?? null,
          token: generateCartToken(),
          status: "ACTIVE",
        },
      });
    } catch (error) {
      if (isCartTokenConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Unable to generate a unique cart token.", "CART_TOKEN_CONFLICT", {
    statusCode: 500,
    userMessage: "We could not create your cart right now. Please try again.",
  });
}

async function ensureCartHasUniqueToken(cartId: string, db: DatabaseExecutor) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.cart.update({
        where: { id: cartId },
        data: {
          token: generateCartToken(),
        },
      });
    } catch (error) {
      if (isCartTokenConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Unable to restore a cart token.", "CART_TOKEN_CONFLICT", {
    statusCode: 500,
    userMessage: "We could not restore your cart right now. Please try again.",
  });
}

async function findCartByToken(token: string, db: DatabaseExecutor) {
  return db.cart.findFirst({
    where: {
      token,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

function toMissingProductError(slug: string) {
  return new AppError(`Cart product not found for slug: ${slug}`, "CART_PRODUCT_NOT_FOUND", {
    statusCode: 404,
    userMessage: "This product is not available right now.",
  });
}

function toMissingVariantError(optionId: string) {
  return new AppError(`Cart variant not found for option: ${optionId}`, "CART_VARIANT_NOT_FOUND", {
    statusCode: 404,
    userMessage: "The selected option is no longer available.",
  });
}

function toOutOfStockError(productName: string) {
  return new AppError(`Cart stock unavailable for product: ${productName}`, "CART_OUT_OF_STOCK", {
    statusCode: 409,
    userMessage: "This item is currently out of stock.",
  });
}

function toInsufficientStockError(productName: string, available: number) {
  return new AppError(`Cart stock insufficient for product: ${productName}`, "CART_STOCK_INSUFFICIENT", {
    statusCode: 409,
    userMessage: `Only ${available} units of ${productName} are available right now.`,
  });
}

export function resolveCartSeedSelection(input: ResolveCartSelectionInput): CartSeedSelection {
  const product = catalogProductSeeds.find((item) => item.slug === input.productSlug);

  if (!product) {
    throw toMissingProductError(input.productSlug);
  }

  const productDetail = catalogProductDetailSeeds[input.productSlug];
  if (!productDetail) {
    throw toMissingProductError(input.productSlug);
  }

  const category = catalogCategorySeeds.find((item) => item.slug === product.categorySlug);
  if (!category) {
    throw toMissingProductError(input.productSlug);
  }

  const firstVariantGroup = productDetail.variantGroups[0];
  let selectedOption = null;

  if (input.optionId) {
    for (const group of productDetail.variantGroups) {
      const found = group.options.find((option) => option.id === input.optionId);
      if (found) {
        selectedOption = found;
        break;
      }
    }

    if (!selectedOption) {
      throw toMissingVariantError(input.optionId);
    }
  } else {
    selectedOption = firstVariantGroup?.options.find((option) => option.inventoryQuantity > 0) ?? firstVariantGroup?.options[0] ?? null;
  }

  const resolvedSku = selectedOption?.sku ?? productDetail.sku;
  if (!resolvedSku) {
    throw new AppError(`Cart SKU missing for product: ${input.productSlug}`, "CART_SKU_MISSING", {
      statusCode: 500,
      userMessage: "This product cannot be added right now. Please try again.",
    });
  }

  return {
    categorySlug: category.slug,
    categoryName: category.name,
    productSlug: product.slug,
    productName: product.name,
    shortDescription: productDetail.shortDescription,
    longDescription: productDetail.longDescription,
    optionId: selectedOption?.id ?? null,
    optionLabel: selectedOption?.label ?? null,
    sku: resolvedSku,
    price: selectedOption?.price ?? product.price,
    compareAt: selectedOption?.compareAt ?? product.compareAt ?? null,
    inventoryQuantity: selectedOption?.inventoryQuantity ?? product.inventoryQuantity,
  };
}

async function ensureSeedCatalogVariant(selection: CartSeedSelection, db: DatabaseExecutor) {
  const category = await db.category.upsert({
    where: { slug: selection.categorySlug },
    update: {
      name: selection.categoryName,
    },
    create: {
      slug: selection.categorySlug,
      name: selection.categoryName,
      description: `Seed-backed category for ${selection.categoryName}`,
    },
  });

  const product = await db.product.upsert({
    where: { slug: selection.productSlug },
    update: {
      name: selection.productName,
      shortDescription: selection.shortDescription,
      description: selection.longDescription,
      categoryId: category.id,
    },
    create: {
      slug: selection.productSlug,
      name: selection.productName,
      shortDescription: selection.shortDescription,
      description: selection.longDescription,
      categoryId: category.id,
      status: ProductStatus.PUBLISHED,
    },
  });

  const variant = await db.productVariant.upsert({
    where: { sku: selection.sku },
    update: {
      productId: product.id,
      title: selection.optionLabel,
      price: selection.price,
      compareAtPrice: selection.compareAt,
      isDefault: selection.optionId === null,
    },
    create: {
      productId: product.id,
      sku: selection.sku,
      title: selection.optionLabel,
      price: selection.price,
      compareAtPrice: selection.compareAt,
      currency: Currency.PKR,
      isDefault: selection.optionId === null,
    },
  });

  await db.inventory.upsert({
    where: {
      productVariantId: variant.id,
    },
    update: {
      quantity: selection.inventoryQuantity,
      safetyStock: 0,
    },
    create: {
      productVariantId: variant.id,
      quantity: selection.inventoryQuantity,
      reserved: 0,
      safetyStock: 0,
    },
  });

  return variant;
}

async function getOrCreateActiveCartForUser(userId: string, db: DatabaseExecutor) {
  const existing = await db.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (existing) {
    if (existing.token) {
      return existing;
    }

    return ensureCartHasUniqueToken(existing.id, db);
  }

  return createActiveCartWithUniqueToken({ userId }, db);
}

async function getOrCreateActiveCartForGuest(token: string, db: DatabaseExecutor) {
  const existing = await findCartByToken(token, db);

  if (existing?.status === "ACTIVE") {
    return existing;
  }

  if (existing) {
    return createActiveCartWithUniqueToken({}, db);
  }

  try {
    return await db.cart.create({
      data: {
        token,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    if (!isCartTokenConflict(error)) {
      throw error;
    }

    const conflicted = await findCartByToken(token, db);
    if (conflicted?.status === "ACTIVE") {
      return conflicted;
    }

    return createActiveCartWithUniqueToken({}, db);
  }
}

async function getCartWithItemsById(cartId: string, db: DatabaseExecutor) {
  return db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          productVariant: {
            include: {
              inventory: true,
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

function mapCartItem(item: CartIncludePayload["items"][number]): CartItemSummary {
  const availableQuantity = getAvailableInventoryQuantity(item.productVariant.inventory);
  const normalizedAvailableQuantity = Number.isFinite(availableQuantity) ? availableQuantity : MAX_CART_ITEM_QUANTITY;
  const productSlug = item.productVariant.product.slug;
  const categorySlug = item.productVariant.product.category?.slug ?? "categories";

  return {
    id: item.id,
    productName: item.productVariant.product.name,
    productSlug,
    categorySlug,
    sku: item.productVariant.sku ?? "",
    optionLabel: item.productVariant.title,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    compareAtPrice: item.productVariant.compareAtPrice,
    lineSubtotal: item.unitPrice * item.quantity,
    availableQuantity: normalizedAvailableQuantity,
    href: routes.storefront.product(categorySlug, productSlug),
  };
}

export function calculateCartSubtotal(items: ReadonlyArray<{ quantity: number; unitPrice: number }>) {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function validateCartStock(summary: CartSummary): CartStockValidationResult {
  const issues: CartStockIssue[] = summary.items
    .filter((item) => item.quantity > item.availableQuantity)
    .map((item) => ({
      cartItemId: item.id,
      productName: item.productName,
      sku: item.sku,
      requestedQuantity: item.quantity,
      availableQuantity: item.availableQuantity,
    }));

  return {
    ok: issues.length === 0,
    issues,
  };
}

function toCartSummary(cart: CartIncludePayload): CartSummary {
  const items = cart.items.map(mapCartItem);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    id: cart.id,
    token: cart.token ?? "",
    items,
    itemCount,
    subtotal: calculateCartSubtotal(items),
  };
}

async function resolveActiveCartId(input: ResolveCartContextInput, db: DatabaseExecutor): Promise<string | null> {
  if (input.userId) {
    const userCart = await getOrCreateActiveCartForUser(input.userId, db);

    if (input.guestToken && input.mergeGuestIntoUser) {
      await mergeGuestCartIntoUserCart({
        userId: input.userId,
        guestToken: input.guestToken,
      }, db);

      const refreshed = await getOrCreateActiveCartForUser(input.userId, db);
      return refreshed.id;
    }

    return userCart.id;
  }

  if (!input.guestToken) {
    return null;
  }

  const guestCart = await getOrCreateActiveCartForGuest(input.guestToken, db);
  return guestCart.id;
}

export async function getOrCreateGuestCartToken(inputToken?: string | undefined) {
  return inputToken && inputToken.length > 0 ? inputToken : generateCartToken();
}

export async function getCartSummaryForContext(input: ResolveCartContextInput): Promise<CartSummary | null> {
  const db = getPrismaClient();
  const cartId = await resolveActiveCartId(input, db);

  if (!cartId) {
    return null;
  }

  const cart = await getCartWithItemsById(cartId, db);
  if (!cart) {
    return null;
  }

  return toCartSummary(cart);
}

export async function mergeGuestCartIntoUserCart(
  input: {
    userId: string;
    guestToken: string;
  },
  db: DatabaseExecutor = getPrismaClient(),
) {
  return runWithTransaction(async (transaction) => {
    const guestCart = await transaction.cart.findFirst({
      where: {
        token: input.guestToken,
        userId: null,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return getOrCreateActiveCartForUser(input.userId, transaction);
    }

    const userCart = await getOrCreateActiveCartForUser(input.userId, transaction);

    for (const guestItem of guestCart.items) {
      const availableQuantity = getAvailableInventoryQuantity(guestItem.productVariant.inventory);
      if (availableQuantity < 1) {
        continue;
      }

      const existing = await transaction.cartItem.findUnique({
        where: {
          cartId_productVariantId: {
            cartId: userCart.id,
            productVariantId: guestItem.productVariantId,
          },
        },
      });

      const requestedQuantity = (existing?.quantity ?? 0) + guestItem.quantity;
      const nextQuantity = Math.min(
        Math.max(1, requestedQuantity),
        Number.isFinite(availableQuantity) ? availableQuantity : MAX_CART_ITEM_QUANTITY,
        MAX_CART_ITEM_QUANTITY,
      );

      await transaction.cartItem.upsert({
        where: {
          cartId_productVariantId: {
            cartId: userCart.id,
            productVariantId: guestItem.productVariantId,
          },
        },
        update: {
          quantity: nextQuantity,
          unitPrice: guestItem.unitPrice,
        },
        create: {
          cartId: userCart.id,
          productVariantId: guestItem.productVariantId,
          quantity: Math.min(guestItem.quantity, nextQuantity),
          unitPrice: guestItem.unitPrice,
        },
      });
    }

    await transaction.cart.update({
      where: { id: guestCart.id },
      data: {
        status: "ABANDONED",
        token: null,
      },
    });

    await transaction.cartItem.deleteMany({
      where: {
        cartId: guestCart.id,
      },
    });

    return userCart;
  }, db);
}

async function requireActiveCartForMutation(input: ResolveCartContextInput, db: DatabaseExecutor) {
  const cartId = await resolveActiveCartId(
    {
      ...input,
      mergeGuestIntoUser: input.mergeGuestIntoUser ?? true,
    },
    db,
  );

  if (!cartId) {
    throw new AppError("Cart context missing for mutation.", "CART_CONTEXT_MISSING", {
      statusCode: 400,
      userMessage: "We could not identify your cart. Please refresh and try again.",
    });
  }

  const cart = await db.cart.findUnique({
    where: { id: cartId },
  });

  if (!cart) {
    throw new AppError("Cart missing for mutation.", "CART_NOT_FOUND", {
      statusCode: 404,
      userMessage: "Your cart could not be found. Please refresh and retry.",
    });
  }

  return cart;
}

export async function addCartItemForContext(context: ResolveCartContextInput, input: AddCartItemInput) {
  const db = getPrismaClient();
  const selection = resolveCartSeedSelection(input);
  const quantity = normalizeQuantity(input.quantity);

  // Keep seed catalog synchronization outside the cart mutation transaction.
  // On cold serverless starts this removes several upserts from the interactive
  // transaction window and avoids stale/closed transaction errors.
  const variant = await ensureSeedCatalogVariant(selection, db);

  return runWithTransaction(async (transaction) => {
    const cart = await requireActiveCartForMutation(context, transaction);

    const inventory = await transaction.inventory.findUnique({
      where: {
        productVariantId: variant.id,
      },
    });

    const availableQuantity = getAvailableInventoryQuantity(inventory);

    if (availableQuantity < 1) {
      throw toOutOfStockError(selection.productName);
    }

    const existing = await transaction.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variant.id,
        },
      },
    });

    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > availableQuantity) {
      throw toInsufficientStockError(selection.productName, availableQuantity);
    }

    await transaction.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variant.id,
        },
      },
      update: {
        quantity: nextQuantity,
        unitPrice: selection.price,
      },
      create: {
        cartId: cart.id,
        productVariantId: variant.id,
        quantity,
        unitPrice: selection.price,
      },
    });

    const snapshot = await getCartWithItemsById(cart.id, transaction);
    if (!snapshot) {
      throw new AppError("Cart not found after add mutation.", "CART_SNAPSHOT_MISSING", {
        statusCode: 500,
      });
    }

    return toCartSummary(snapshot);
  }, db);
}

export async function updateCartItemQuantityForContext(context: ResolveCartContextInput, input: UpdateCartItemInput) {
  const db = getPrismaClient();

  return runWithTransaction(async (transaction) => {
    const cart = await requireActiveCartForMutation(context, transaction);

    const item = await transaction.cartItem.findFirst({
      where: {
        id: input.cartItemId,
        cartId: cart.id,
      },
      include: {
        productVariant: {
          include: {
            inventory: true,
            product: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError("Cart item not found for update.", "CART_ITEM_NOT_FOUND", {
        statusCode: 404,
        userMessage: "This cart item no longer exists.",
      });
    }

    if (input.quantity < 1) {
      await transaction.cartItem.delete({
        where: {
          id: item.id,
        },
      });
    } else {
      const nextQuantity = Math.min(MAX_CART_ITEM_QUANTITY, Math.trunc(input.quantity));
      const availableQuantity = getAvailableInventoryQuantity(item.productVariant.inventory);

      if (availableQuantity < 1) {
        throw toOutOfStockError(item.productVariant.product.name);
      }

      if (nextQuantity > availableQuantity) {
        throw toInsufficientStockError(item.productVariant.product.name, availableQuantity);
      }

      await transaction.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: nextQuantity,
        },
      });
    }

    const snapshot = await getCartWithItemsById(cart.id, transaction);
    if (!snapshot) {
      throw new AppError("Cart not found after update mutation.", "CART_SNAPSHOT_MISSING", {
        statusCode: 500,
      });
    }

    return toCartSummary(snapshot);
  }, db);
}

export async function removeCartItemForContext(context: ResolveCartContextInput, input: RemoveCartItemInput) {
  const db = getPrismaClient();

  return runWithTransaction(async (transaction) => {
    const cart = await requireActiveCartForMutation(context, transaction);

    await transaction.cartItem.deleteMany({
      where: {
        id: input.cartItemId,
        cartId: cart.id,
      },
    });

    const snapshot = await getCartWithItemsById(cart.id, transaction);
    if (!snapshot) {
      throw new AppError("Cart not found after remove mutation.", "CART_SNAPSHOT_MISSING", {
        statusCode: 500,
      });
    }

    return toCartSummary(snapshot);
  }, db);
}
