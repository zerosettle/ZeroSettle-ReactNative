import type { Price } from './Price';

/** The type of promotional discount. */
export type PromotionKind = 'percent_off' | 'fixed_amount' | 'free_trial';

/** An active promotion for a product, configured on the ZeroSettle dashboard. */
export interface Promotion {
  /** Unique promotion identifier. */
  id: string;
  /** Display name for the promotion (e.g., "Launch Sale"). */
  displayName: string;
  /** The promotional price (replaces the standard web price during the promotion). */
  promotionalPrice: Price;
  /** When the promotion expires (ISO 8601). `null` means no expiration. */
  expiresAt: string | null;
  /** The type of promotion. */
  type: PromotionKind;
}
