import type { ZSProduct } from './ZSProduct';
import type { RemoteConfig } from './RemoteConfig';

/**
 * The result of fetching the product catalog.
 *
 * Contains both the product list and any remote configuration returned
 * by the backend in a single response.
 */
export interface ProductCatalog {
  /** Products with web prices, StoreKit prices, and any active promotions. */
  products: ZSProduct[];
  /** Remote configuration (checkout type, migration campaign, etc.). */
  config: RemoteConfig | null;
}
