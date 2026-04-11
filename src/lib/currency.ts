type FormatPriceOptions = {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function formatPrice(
  value: number | string,
  {
    currency = "PKR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  }: FormatPriceOptions = {},
) {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return `${currency} 0`;
  }

  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}
