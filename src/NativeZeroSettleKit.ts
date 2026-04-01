import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

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
  ): Promise<UnsafeObject>;
  logout(): void;
  setCustomer(name: string | null, email: string | null): void;
  getIsConfigured(): Promise<boolean>;
  getIsBootstrapped(): Promise<boolean>;

  // Products
  fetchProducts(userId: string | null): Promise<UnsafeObject>;
  getProducts(): Promise<UnsafeObject[]>;
  getProduct(productId: string): Promise<UnsafeObject | null>;

  // Checkout
  purchase(productId: string, userId: string | null): Promise<UnsafeObject>;
  handleUniversalLink(url: string): Promise<boolean>;
  getPendingCheckout(): Promise<boolean>;
  warmUp(productId: string, userId: string | null): Promise<void>;
  warmUpAll(userId: string | null): Promise<void>;

  // Entitlements
  restoreEntitlements(userId: string): Promise<UnsafeObject[]>;
  getEntitlements(): Promise<UnsafeObject[]>;
  getActiveEntitlements(): Promise<UnsafeObject[]>;
  hasActiveEntitlement(productId: string): Promise<boolean>;

  // Transactions
  fetchTransactionHistory(userId: string): Promise<UnsafeObject[]>;

  // Cancel Flow
  presentCancelFlow(
    productId: string,
    userId: string
  ): Promise<string>;
  fetchCancelFlowConfig(userId: string | null): Promise<UnsafeObject>;
  getCancelFlowConfig(): Promise<UnsafeObject | null>;
  acceptSaveOffer(
    productId: string,
    userId: string
  ): Promise<UnsafeObject>;
  submitCancelFlowResponse(response: UnsafeObject): Promise<void>;
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
  ): Promise<UnsafeObject>;

  // Migration
  getMigrationManager(
    userId: string,
    stripeCustomerId: string | null
  ): Promise<UnsafeObject>;
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
    metadata: UnsafeObject | null
  ): void;

  // Events
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZeroSettleKit');
