import { Platform } from 'react-native';
import NativeZeroSettleKit from './NativeZeroSettleKit';
import { wrapNativeError } from './errors';
import type { ProductCatalog } from './models/ProductCatalog';
import type { ZSProduct } from './models/ZSProduct';
import type { Entitlement } from './models/Entitlement';
import type { CheckoutTransaction } from './models/CheckoutTransaction';
import type {
  CancelFlowConfig,
  CancelFlowResponse,
  CancelFlowResult,
  SaveOfferResult,
} from './models/CancelFlow';
import type {
  UpgradeOfferConfig,
  UpgradeOfferResult,
} from './models/UpgradeOffer';
import type { MigrationManagerSnapshot } from './models/MigrationOffer';
import type { FunnelEventType } from './models/events';

/** Configuration options for the ZeroSettle SDK. */
export interface ZeroSettleConfiguration {
  /** Your publishable key from the ZeroSettle dashboard. */
  publishableKey: string;
  /** Whether to listen for and forward native StoreKit transactions. Defaults to `true`. */
  syncStoreKitTransactions?: boolean;
  /** Apple Pay merchant identifier for native pay checkout. */
  appleMerchantId?: string;
  /** Whether to preload checkout sessions after bootstrap. Defaults to `false`. */
  preloadCheckout?: boolean;
  /** Maximum number of WKWebViews to pre-render. `undefined` for no limit. */
  maxPreloadedWebViews?: number;
}

/**
 * Main entry point for the ZeroSettle React Native SDK.
 *
 * Use `ZeroSettleKit` (the singleton instance) to configure the SDK,
 * fetch products, manage entitlements, and present checkout flows.
 *
 * @example
 * ```ts
 * import { ZeroSettleKit } from 'react-native-zerosettle-kit';
 *
 * ZeroSettleKit.configure({ publishableKey: 'zs_pk_live_...' });
 * const catalog = await ZeroSettleKit.bootstrap('user_123');
 * ```
 */
class ZeroSettleKitClass {
  // ---------------------------------------------------------------------------
  // Configuration & Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Configure the SDK. Must be called before any other methods.
   *
   * On non-iOS platforms this is a no-op.
   */
  configure(config: ZeroSettleConfiguration): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.configure(
      config.publishableKey,
      config.syncStoreKitTransactions ?? true,
      config.appleMerchantId ?? null,
      config.preloadCheckout ?? false,
      config.maxPreloadedWebViews ?? null
    );
  }

  /**
   * Fetch products and restore entitlements in one call.
   *
   * @param userId - Your app's user identifier
   * @param options - Optional customer name and email
   * @returns The product catalog with remote configuration
   */
  async bootstrap(
    userId: string,
    options?: { name?: string; email?: string }
  ): Promise<ProductCatalog> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.bootstrap(
        userId,
        options?.name ?? null,
        options?.email ?? null
      );
      return result as ProductCatalog;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /**
   * Clear all user-scoped state, resetting the SDK to pre-bootstrap condition.
   *
   * On non-iOS platforms this is a no-op.
   */
  logout(): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.logout();
  }

  /**
   * Update customer name and/or email for subsequent checkout requests.
   *
   * On non-iOS platforms this is a no-op.
   */
  setCustomer(options: { name?: string; email?: string }): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.setCustomer(
      options.name ?? null,
      options.email ?? null
    );
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  /** Fetch the product catalog from ZeroSettle. */
  async fetchProducts(userId?: string): Promise<ProductCatalog> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.fetchProducts(userId ?? null);
      return result as ProductCatalog;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Get the cached products from the last fetch. */
  async getProducts(): Promise<ZSProduct[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const result = await NativeZeroSettleKit.getProducts();
      return result as ZSProduct[];
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Returns the product with the given ID, if loaded. */
  async product(id: string): Promise<ZSProduct | null> {
    if (Platform.OS !== 'ios') return null;
    try {
      const result = await NativeZeroSettleKit.getProduct(id);
      return result as ZSProduct | null;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------------

  /** Purchase a product via web checkout. */
  async purchase(
    productId: string,
    userId?: string
  ): Promise<CheckoutTransaction> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.purchase(
        productId,
        userId ?? null
      );
      return result as CheckoutTransaction;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Handle a universal link callback from web checkout. */
  async handleUniversalLink(url: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      return await NativeZeroSettleKit.handleUniversalLink(url);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Whether a web checkout is currently in progress. */
  async pendingCheckout(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      return await NativeZeroSettleKit.getPendingCheckout();
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Preload the checkout session for a specific product. */
  async warmUp(productId: string, userId?: string): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      await NativeZeroSettleKit.warmUp(productId, userId ?? null);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Preload checkout sessions for all products. */
  async warmUpAll(userId?: string): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      await NativeZeroSettleKit.warmUpAll(userId ?? null);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Entitlements
  // ---------------------------------------------------------------------------

  /** Restore entitlements from both web checkout and StoreKit. */
  async restoreEntitlements(userId: string): Promise<Entitlement[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const result = await NativeZeroSettleKit.restoreEntitlements(userId);
      return result as Entitlement[];
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Get the current cached entitlements (all statuses). */
  async getEntitlements(): Promise<Entitlement[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const result = await NativeZeroSettleKit.getEntitlements();
      return result as Entitlement[];
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Get only currently active entitlements. */
  async getActiveEntitlements(): Promise<Entitlement[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const result = await NativeZeroSettleKit.getActiveEntitlements();
      return result as Entitlement[];
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Whether the user has an active entitlement for the given product ID. */
  async hasActiveEntitlement(productId: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      return await NativeZeroSettleKit.hasActiveEntitlement(productId);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------

  /** Fetch the full transaction history for a user. */
  async fetchTransactionHistory(
    userId: string
  ): Promise<CheckoutTransaction[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const result = await NativeZeroSettleKit.fetchTransactionHistory(userId);
      return result as CheckoutTransaction[];
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Cancel Flow
  // ---------------------------------------------------------------------------

  /**
   * Present the cancel flow questionnaire for a subscription.
   *
   * Returns a result string: "cancelled", "retained", "dismissed",
   * or "paused:<ISO8601>" for pause results.
   */
  async presentCancelFlow(
    productId: string,
    userId: string
  ): Promise<CancelFlowResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.presentCancelFlow(
        productId,
        userId
      );
      return result as CancelFlowResult;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Fetch the cancel flow configuration without presenting any UI. */
  async fetchCancelFlowConfig(userId?: string): Promise<CancelFlowConfig> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.fetchCancelFlowConfig(
        userId ?? null
      );
      return result as CancelFlowConfig;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Get the cached cancel flow configuration (populated during bootstrap). */
  async getCancelFlowConfig(): Promise<CancelFlowConfig | null> {
    if (Platform.OS !== 'ios') return null;
    try {
      const result = await NativeZeroSettleKit.getCancelFlowConfig();
      return result as CancelFlowConfig | null;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Accept the save offer for a subscription about to be cancelled. */
  async acceptSaveOffer(
    productId: string,
    userId: string
  ): Promise<SaveOfferResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.acceptSaveOffer(
        productId,
        userId
      );
      return result as SaveOfferResult;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Submit the cancel flow analytics response. */
  async submitCancelFlowResponse(response: CancelFlowResponse): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      await NativeZeroSettleKit.submitCancelFlowResponse(response as any);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /**
   * Pause a subscription.
   *
   * @returns ISO 8601 date string when the subscription resumes, or `null`.
   */
  async pauseSubscription(
    productId: string,
    userId: string,
    pauseDurationDays?: number
  ): Promise<string | null> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      return await NativeZeroSettleKit.pauseSubscription(
        productId,
        userId,
        pauseDurationDays ?? null
      );
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Resume a previously paused subscription. */
  async resumeSubscription(
    productId: string,
    userId: string
  ): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      await NativeZeroSettleKit.resumeSubscription(productId, userId);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /**
   * Cancel a subscription.
   *
   * @param immediate - If `true`, cancel immediately. Default: cancel at period end.
   */
  async cancelSubscription(
    productId: string,
    userId: string,
    immediate?: boolean
  ): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      await NativeZeroSettleKit.cancelSubscription(
        productId,
        userId,
        immediate ?? false
      );
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Upgrade Offers
  // ---------------------------------------------------------------------------

  /**
   * Present the upgrade offer sheet.
   *
   * Returns a result string: "upgraded", "declined", or "dismissed".
   */
  async presentUpgradeOffer(
    userId: string,
    productId?: string
  ): Promise<UpgradeOfferResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.presentUpgradeOffer(
        productId ?? null,
        userId
      );
      return result as UpgradeOfferResult;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Fetch the upgrade offer configuration without presenting any UI. */
  async fetchUpgradeOfferConfig(
    userId: string,
    productId?: string
  ): Promise<UpgradeOfferConfig> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.fetchUpgradeOfferConfig(
        productId ?? null,
        userId
      );
      return result as UpgradeOfferConfig;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Migration
  // ---------------------------------------------------------------------------

  /** Get the migration manager snapshot for the given user. */
  async getMigrationManager(
    userId: string,
    stripeCustomerId?: string
  ): Promise<MigrationManagerSnapshot> {
    if (Platform.OS !== 'ios') {
      throw new Error('ZeroSettleKit is only available on iOS');
    }
    try {
      const result = await NativeZeroSettleKit.getMigrationManager(
        userId,
        stripeCustomerId ?? null
      );
      return result as MigrationManagerSnapshot;
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /** Track a successful migration conversion. */
  async trackMigrationConversion(userId: string): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      await NativeZeroSettleKit.trackMigrationConversion(userId);
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /**
   * Reset the persisted dismissal state for the migration tip view.
   *
   * On non-iOS platforms this is a no-op.
   */
  resetMigrateTipState(): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.resetMigrateTipState();
  }

  /**
   * Present the migration tip as a modal overlay.
   *
   * On non-iOS platforms this is a no-op.
   */
  presentMigrateTip(backgroundColorHex: string, userId: string): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.presentMigrateTip(backgroundColorHex, userId);
  }

  /**
   * Dismiss the migration tip modal if currently presented.
   *
   * On non-iOS platforms this is a no-op.
   */
  dismissMigrateTip(): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.dismissMigrateTip();
  }

  // ---------------------------------------------------------------------------
  // Manage Subscription
  // ---------------------------------------------------------------------------

  /** Present the manage subscription retention sheet. */
  async presentManageSubscriptionSheet(): Promise<string> {
    if (Platform.OS !== 'ios') return 'dismissed';
    try {
      return await NativeZeroSettleKit.presentManageSubscriptionSheet();
    } catch (error) {
      throw wrapNativeError(error);
    }
  }

  /**
   * Dismiss the manage subscription sheet if currently presented.
   *
   * On non-iOS platforms this is a no-op.
   */
  dismissManageSubscriptionSheet(): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.dismissManageSubscriptionSheet();
  }

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  /**
   * Fire-and-forget analytics event for paywall and checkout funnel tracking.
   *
   * On non-iOS platforms this is a no-op.
   */
  trackEvent(
    type: FunnelEventType,
    options: {
      productId: string;
      screenName?: string;
      metadata?: Record<string, string>;
    }
  ): void {
    if (Platform.OS !== 'ios') return;
    NativeZeroSettleKit.trackEvent(
      type,
      options.productId,
      options.screenName ?? null,
      (options.metadata as any) ?? null
    );
  }
}

/**
 * Singleton instance of the ZeroSettleKit SDK.
 *
 * @example
 * ```ts
 * import { ZeroSettleKit } from 'react-native-zerosettle-kit';
 *
 * ZeroSettleKit.configure({ publishableKey: 'zs_pk_live_...' });
 * ```
 */
export const ZeroSettleKit = new ZeroSettleKitClass();
