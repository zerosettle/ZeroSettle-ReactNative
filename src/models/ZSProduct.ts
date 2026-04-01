import type { Price } from './Price';
import type { Promotion } from './Promotion';

/** The type of in-app purchase product. */
export type ProductType =
  | 'auto_renewable_subscription'
  | 'non_renewing_subscription'
  | 'consumable'
  | 'non_consumable';

/** The billing cadence for a subscription product. */
export type BillingInterval = 'week' | 'month' | 'year';

/**
 * A product available for web checkout via ZeroSettle.
 *
 * The `id` matches the StoreKit product identifier configured on the ZeroSettle dashboard.
 */
export interface ZSProduct {
  /** StoreKit product identifier (e.g., "com.app.premium_monthly"). */
  id: string;
  /** Display name for the product. */
  displayName: string;
  /** Product description. */
  productDescription: string;
  /** The type of product (subscription, consumable, etc.). */
  type: ProductType;
  /** The web checkout price. `null` when web checkout is not configured. */
  webPrice: Price | null;
  /** App Store price from the backend (for display purposes). */
  appStorePrice: Price | null;
  /** Whether this product is synced to App Store Connect. */
  syncedToAppStoreConnect: boolean;
  /** Active promotion, if any. */
  promotion: Promotion | null;
  /** Billing interval raw string for subscriptions. */
  billingInterval: string | null;
  /** Type-safe billing period. `null` for non-subscriptions or unrecognized values. */
  billingPeriod: BillingInterval | null;
  /** Subscription group identifier. */
  subscriptionGroupId: number | null;
  /** Free trial duration string (e.g., "1_week", "30"). `null` when no trial is configured. */
  freeTrialDuration: string | null;
  /** Whether the current user is eligible for the free trial. */
  isTrialEligible: boolean | null;
  /** Whether StoreKit purchase is available for this product. */
  storeKitAvailable: boolean;
  /** StoreKit price (prefers on-device fetch, falls back to backend). */
  storeKitPrice: Price | null;
  /** Parsed free trial duration in days. `null` when no trial or user is ineligible. */
  freeTrialDays: number | null;
  /** Human-readable free trial label (e.g., "3-day free trial"). */
  freeTrialLabel: string | null;
  /** Percentage savings of web price vs App Store price. `null` if not applicable. */
  savingsPercent: number | null;
}
