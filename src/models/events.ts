/** Funnel analytics event types for paywall and checkout tracking. */
export type FunnelEventType =
  | 'paywall_viewed'
  | 'checkout_started'
  | 'checkout_abandoned';

/** Native event names emitted by the ZeroSettle SDK. */
export type ZeroSettleEventType =
  | 'checkoutDidBegin'
  | 'checkoutDidComplete'
  | 'checkoutDidCancel'
  | 'checkoutDidFail'
  | 'entitlementsDidUpdate'
  | 'didSyncStoreKitTransaction'
  | 'storeKitSyncFailed';
