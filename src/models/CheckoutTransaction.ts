import type { EntitlementSource } from './Entitlement';

/** The status of a transaction. */
export type TransactionStatus =
  | 'completed'
  | 'pending'
  | 'processing'
  | 'failed'
  | 'refunded';

/**
 * Represents a completed or pending purchase transaction.
 *
 * All date fields are ISO 8601 strings.
 */
export interface CheckoutTransaction {
  /** ZeroSettle transaction ID. */
  id: string;
  /** The product that was purchased. */
  productId: string;
  /** Current status of the transaction. */
  status: TransactionStatus;
  /** Where the purchase originated. */
  source: EntitlementSource;
  /** When the purchase was made (ISO 8601). */
  purchasedAt: string;
  /** When this entitlement expires (ISO 8601). `null` for non-expiring products. */
  expiresAt: string | null;
  /** Human-readable product name (populated in transaction history). */
  productName: string | null;
  /** Amount charged in cents (populated in transaction history). */
  amountCents: number | null;
  /** Currency code, e.g. "usd" (populated in transaction history). */
  currency: string | null;
  /** StoreKit subscription status (1=subscribed, 2=expired, etc.). */
  storekitStatus: number | null;
}
