// Taux de conversion VERS B$ (1 devise locale = X B$)
// Basé sur : 1 B$ = 1 USD
export const TO_BSD_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 1 / 0.92,   // 1 EUR = ~1.087 B$
  XOF: 1 / 610,    // 1 XOF = ~0.00164 B$
  GBP: 1 / 0.79,   // 1 GBP = ~1.266 B$
};

// Taux de conversion DEPUIS B$ vers devise locale (pour les retraits)
export const FROM_BSD_RATES: { [key: string]: number } = {
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

/** [LEGACY] Gardé pour compatibilité, utilise formatBSD en interne */
export function formatAmount(amount: number, _currency?: string): string {
  return formatBSD(amount);
}

