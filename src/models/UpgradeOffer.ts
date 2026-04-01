import type { Price } from './Price';

/** Reason why an upgrade offer is not available. */
export type UpgradeOfferIneligibilityReason =
  | 'no_active_subscription'
  | 'already_highest_tier';

/** The upgrade path type. */
export type UpgradeType = 'web_to_web' | 'storekit_to_web';

/**
 * The outcome of an upgrade offer presentation.
 *
 * Returned as a string from native: "upgraded", "declined", or "dismissed".
 */
export type UpgradeOfferResult = 'upgraded' | 'declined' | 'dismissed';

/** Info about a subscription product in an upgrade offer (current or target). */
export interface UpgradeOfferProductInfo {
  referenceId: string;
  name: string;
  price: Price;
  billingLabel: string;
  /** Monthly equivalent price for annual/multi-month plans. `null` for current product. */
  monthlyEquivalent: Price | null;
}

/** Proration details for web-to-web upgrades. */
export interface UpgradeOfferProration {
  /** Credit or charge amount in cents (negative = credit). */
  amountCents: number;
  /** Currency code. */
  currency: string;
  /** Next billing date after the upgrade (ISO 8601). */
  nextBillingDate: string | null;
}

/** Messaging to display in the upgrade offer sheet. */
export interface UpgradeOfferDisplay {
  title: string;
  body: string;
  ctaText: string;
  dismissText: string;
  /** Additional body text for StoreKit to Web migrations. */
  storekitMigrationBody: string | null;
  /** Instructions for cancelling the Apple subscription. */
  storekitCancelInstructions: string | null;
}

/** Configuration returned by the backend describing an available upgrade. */
export interface UpgradeOfferConfig {
  /** Whether an upgrade offer is available for this user/product. */
  available: boolean;
  /** Reason if not available. */
  reason: UpgradeOfferIneligibilityReason | string | null;
  /** The user's current subscription product. */
  currentProduct: UpgradeOfferProductInfo | null;
  /** The upgrade target product. */
  targetProduct: UpgradeOfferProductInfo | null;
  /** Savings percentage (0-100). */
  savingsPercent: number | null;
  /** The type of upgrade path. */
  upgradeType: UpgradeType | null;
  /** Proration details for web-to-web upgrades. */
  proration: UpgradeOfferProration | null;
  /** Display messaging customized from the dashboard. */
  display: UpgradeOfferDisplay | null;
  /** A/B experiment variant identifier. */
  variantId: number | null;
}
