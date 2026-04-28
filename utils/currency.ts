// Taux de conversion VERS B$ (1 devise locale = X B$)
// Basé sur : 1 B$ = 1 USD
export let TO_BSD_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 1.08,
  XOF: 0.0016,
  GBP: 1.27,
};

// Taux de conversion DEPUIS B$ vers devise locale (pour les retraits)
export let FROM_BSD_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  XOF: 610,
  GBP: 0.79,
};

export function updateRates(toBSD: any, fromBSD: any) {
  TO_BSD_RATES = { ...TO_BSD_RATES, ...toBSD };
  FROM_BSD_RATES = { ...FROM_BSD_RATES, ...fromBSD };
}

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  XOF: "CFA",
  GBP: "£",
};

/** Affichage interne : toujours en B$ */
export function formatBSD(amount: number): string {
  return `B$ ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/** Convertir une devise locale en B$ (pour les dépôts) */
export function convertToBSD(amount: number, fromCurrency: string): number {
  const rate = TO_BSD_RATES[fromCurrency.toUpperCase()] || 1;
  return amount * rate;
}

/** Convertir B$ en devise locale (pour les retraits) */
export function convertFromBSD(bsdAmount: number, toCurrency: string): number {
  const rate = FROM_BSD_RATES[toCurrency.toUpperCase()] || 1;
  return bsdAmount * rate;
}

/** Affichage local : Dépend de la devise de l'utilisateur */
export function formatLocal(amount: number, currency: string = "XOF"): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: currency.toUpperCase() === "XOF" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency.toUpperCase() === "XOF" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

/** [LEGACY] Gardé pour compatibilité, utilise formatBSD en interne */
export function formatAmount(amount: number, currency?: string): string {
  if (currency && currency !== "BSD") return formatLocal(amount, currency);
  return formatBSD(amount);
}

