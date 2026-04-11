export function validateProductImageInput(payload: { productId?: string | null; productVariantId?: string | null }) {
  if (!payload.productId && !payload.productVariantId) {
    throw new Error('ProductImage must reference at least one of productId or productVariantId');
  }
}