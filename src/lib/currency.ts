type FormatPriceOptions = {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function formatPrice(
  value: number | string,
  {
    currency = "Rs.",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  }: FormatPriceOptions = {},
) {
  const amount = typeof value === "string" ? Number(value) : value;
  const normalizedMinimumFractionDigits = Math.max(0, minimumFractionDigits);
  const normalizedMaximumFractionDigits = Math.max(
    maximumFractionDigits,
    normalizedMinimumFractionDigits,
  );

  if (!Number.isFinite(amount)) {
    return "--";
  }

  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: normalizedMinimumFractionDigits,
    maximumFractionDigits: normalizedMaximumFractionDigits,
  })}`;
}
