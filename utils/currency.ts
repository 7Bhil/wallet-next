export const CURRENCY_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  XOF: 610,
  GBP: 0.79,
};

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  XOF: "CFA",
  GBP: "£",
};

export function formatAmount(amount: number, currency: string = "USD"): string {
  const rate = CURRENCY_RATES[currency.toUpperCase()] || 1;
  const converted = amount * rate;
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || "$";

  if (currency.toUpperCase() === "XOF") {
    return `${new Intl.NumberFormat("fr-FR").format(Math.round(converted))} ${symbol}`;
  }

  return `${symbol}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted)}`;
}
