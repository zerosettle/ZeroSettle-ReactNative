import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Configuration & Lifecycle
  configure(
    publishableKey: string,
    syncStoreKitTransactions: boolean,
    appleMerchantId: string | null,
    preloadCheckout: boolean,
    maxPreloadedWebViews: number | null
  ): void;
  bootstrap(
    userId: string,
    name: string | null,
    email: string | null
  ): Promise<Object>;
  logout(): void;
  setCustomer(name: string | null, email: string | null): void;
  getIsConfigured(
    resolve: (value: boolean) => void,
    reject: (error: any) => void
  ): void;
  getIsBootstrapped(
    resolve: (value: boolean) => void,
    reject: (error: any) => void
  ): void;

  // Products
  fetchProducts(userId: string | null): Promise<Object>;
  getProducts(): Promise<Object[]>;
  getProduct(productId: string): Promise<Object | null>;

  // Checkout
  purchase(productId: string, userId: string | null): Promise<Object>;
  handleUniversalLink(url: string): Promise<boolean>;
  getPendingCheckout(): Promise<boolean>;
  warmUp(productId: string, userId: string | null): Promise<void>;
  warmUpAll(userId: string | null): Promise<void>;

  // Entitlements
  restoreEntitlements(userId: string): Promise<Object[]>;
  getEntitlements(): Promise<Object[]>;
  getActiveEntitlements(): Promise<Object[]>;
  hasActiveEntitlement(productId: string): Promise<boolean>;

  // Transactions
  fetchTransactionHistory(userId: string): Promise<Object[]>;

  // Cancel Flow
  presentCancelFlow(
    productId: string,
    userId: string
  ): Promise<string>;
  fetchCancelFlowConfig(userId: string | null): Promise<Object>;
  getCancelFlowConfig(): Promise<Object | null>;
  acceptSaveOffer(
    productId: string,
    userId: string
  ): Promise<Object>;
  submitCancelFlowResponse(response: Object): Promise<void>;
  pauseSubscription(
    productId: string,
    userId: string,
    pauseDurationDays: number | null
  ): Promise<string | null>;
  resumeSubscription(productId: string, userId: string): Promise<void>;
  cancelSubscription(
    productId: string,
    userId: string,
    immediate: boolean
  ): Promise<void>;

  // Upgrade Offer
  presentUpgradeOffer(
    productId: string | null,
    userId: string
  ): Promise<string>;
  fetchUpgradeOfferConfig(
    productId: string | null,
    userId: string
  ): Promise<Object>;

  // Migration
  getMigrationManager(
    userId: string,
    stripeCustomerId: string | null
  ): Promise<Object>;
  trackMigrationConversion(userId: string): Promise<void>;
  resetMigrateTipState(): void;
  presentMigrateTip(backgroundColorHex: string, userId: string): void;
  dismissMigrateTip(): void;

  // Manage Subscription Sheet
  presentManageSubscriptionSheet(): Promise<string>;
  dismissManageSubscriptionSheet(): void;

  // Analytics
  trackEvent(
    eventType: string,
    productId: string,
    screenName: string | null,
    metadata: Object | null
  ): void;

  // Events
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZeroSettleKit');
