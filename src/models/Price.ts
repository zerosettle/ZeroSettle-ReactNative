/**
 * A price with currency information.
 *
 * All amounts are in **cents** (e.g., 999 = $9.99), consistent with Stripe conventions.
 */
export interface Price {
  /** Price in cents (e.g., 999 = $9.99). */
  amountCents: number;
  /** ISO 4217 currency code (e.g., "USD"). */
  currencyCode: string;
  /** Formatted price string (e.g., "$9.99"). */
  formatted: string;
}
