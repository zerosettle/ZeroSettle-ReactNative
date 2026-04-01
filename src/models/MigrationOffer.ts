import type { MigrationPrompt } from './RemoteConfig';

/** The current state of the migration offer flow. */
export type MigrationState =
  | 'loading'
  | 'ineligible'
  | 'eligible'
  | 'presented'
  | 'accepted'
  | 'completed'
  | 'dismissed';

/** Data describing the migration offer available to an eligible user. */
export interface MigrationOfferData {
  /** The migration prompt containing title, message, discount, and product ID. */
  prompt: MigrationPrompt;
  /** Days remaining on the user's current StoreKit subscription. */
  freeTrialDays: number;
  /** The product ID of the user's active StoreKit subscription. */
  activeStoreKitProductId: string;
  /** Exact expiration date of the StoreKit subscription (ISO 8601). */
  storekitSubscriptionEnd: string | null;
  /** The original StoreKit transaction ID for the active subscription. */
  activeStoreKitOriginalTransactionId: string | null;
}

/** Snapshot of the migration manager state returned from the native SDK. */
export interface MigrationManagerSnapshot {
  /** Current state of the migration flow. */
  state: MigrationState;
  /** Migration offer data (available when state is 'eligible' or later). */
  offerData: MigrationOfferData | null;
}
