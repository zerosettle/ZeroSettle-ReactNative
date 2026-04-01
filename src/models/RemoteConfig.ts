/** Geographic jurisdiction for checkout configuration. */
export type Jurisdiction = 'us' | 'eu' | 'row';

/** The type of checkout UI to present. */
export type CheckoutType = 'webview' | 'safari_vc' | 'safari' | 'native_pay';

/** Per-jurisdiction checkout configuration override. */
export interface JurisdictionCheckoutConfig {
  /** The checkout sheet type for this jurisdiction. */
  sheetType: CheckoutType;
  /** Whether web checkout is enabled for this jurisdiction. */
  isEnabled: boolean;
}

/** Configuration for the checkout UI behavior. */
export interface CheckoutConfig {
  /** The global default checkout sheet type. */
  sheetType: CheckoutType;
  /** Whether web checkout is enabled globally. */
  isEnabled: boolean;
  /** Per-jurisdiction overrides (keyed by jurisdiction string). */
  jurisdictions: Record<string, JurisdictionCheckoutConfig>;
  /** Apple Pay merchant identifier provided by the backend. */
  appleMerchantId: string | null;
}

/** Per-product prompt data with product-specific discount and text. */
export interface MigrationPerProductData {
  discountPercent: number;
  title: string;
  message: string;
  ctaText: string;
}

/** Data for a migration campaign prompt. */
export interface MigrationPrompt {
  /** The default product ID for this campaign. */
  productId: string;
  /** The StoreKit product IDs eligible for this migration campaign. */
  eligibleProductIds: string[];
  /** The discount percentage offered (e.g., 20 for 20% off). */
  discountPercent: number;
  /** Minimum subscription tenure (days) to show the prompt. */
  minSubscriptionDays: number;
  /** Maximum subscription tenure (days) to show the prompt. `null` = no upper limit. */
  maxSubscriptionDays: number | null;
  /** Approximate number of free trial days for the migration checkout. */
  freeTrialDays: number;
  /** The title to display in the migration prompt. */
  title: string;
  /** The message body to display in the migration prompt. */
  message: string;
  /** The CTA button text to display in the migration prompt. */
  ctaText: string;
  /** Rollout percentage (0-100). `null` = all users. */
  rolloutPercent: number | null;
  /** Per-product prompt data keyed by product ID. */
  perProductPrompts: Record<string, MigrationPerProductData> | null;
}

/** Remote configuration from the ZeroSettle backend. */
export interface RemoteConfig {
  /** Checkout UI configuration. */
  checkout: CheckoutConfig;
  /** Migration prompt data (`null` if user not eligible or no active campaign). */
  migration: MigrationPrompt | null;
}
