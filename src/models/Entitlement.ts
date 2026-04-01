/** The origin of a purchase/entitlement. */
export type EntitlementSource = 'store_kit' | 'web_checkout';

/** The lifecycle status of an entitlement. */
export type EntitlementStatus =
  | 'active'
  | 'paused'
  | 'expired'
  | 'revoked'
  | 'cancelled'
  | 'grace_period'
  | 'past_due';

/**
 * Represents an entitlement from either a StoreKit or web checkout purchase.
 *
 * All date fields are ISO 8601 strings.
 */
export interface Entitlement {
  /** Entitlement identifier. */
  id: string;
  /** The product ID associated with this entitlement. */
  productId: string;
  /** Where the purchase originated. */
  source: EntitlementSource;
  /** Whether this entitlement is currently active. */
  isActive: boolean;
  /** The lifecycle status of this entitlement. */
  status: EntitlementStatus;
  /** When the entitlement was paused (ISO 8601). `null` if not paused. */
  pausedAt: string | null;
  /** When a paused entitlement will automatically resume (ISO 8601). `null` if not paused. */
  pauseResumesAt: string | null;
  /** When the entitlement expires (ISO 8601). `null` for lifetime/consumable purchases. */
  expiresAt: string | null;
  /** Whether the subscription will auto-renew at the end of the current period. */
  willRenew: boolean;
  /** Whether this entitlement is currently in a free trial period. */
  isTrial: boolean;
  /** When the free trial period ends (ISO 8601). `null` if not a trial. */
  trialEndsAt: string | null;
  /** When the user cancelled the subscription (ISO 8601). `null` if not cancelled. */
  cancelledAt: string | null;
  /** When the purchase was made (ISO 8601). */
  purchasedAt: string;
  /** The original StoreKit transaction ID. Only present for StoreKit-sourced entitlements. */
  storekitOriginalTransactionId: string | null;
  /** The date of the original subscription purchase (ISO 8601). */
  originalPurchaseDate: string | null;
  /** Whether this entitlement is currently paused. */
  isPaused: boolean;
  /** Whether the user has cancelled but the entitlement is still active until period end. */
  isCancelled: boolean;
  /** Days remaining in the trial period. `null` if not a trial. */
  trialDaysRemaining: number | null;
}
