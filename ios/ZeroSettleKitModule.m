#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ZeroSettleKitModule, RCTEventEmitter)

// Configuration & Lifecycle
RCT_EXTERN_METHOD(configure:(NSString *)publishableKey
                  syncStoreKitTransactions:(BOOL)syncStoreKitTransactions
                  appleMerchantId:(NSString *)appleMerchantId
                  preloadCheckout:(BOOL)preloadCheckout
                  maxPreloadedWebViews:(NSNumber *)maxPreloadedWebViews)
RCT_EXTERN_METHOD(bootstrap:(NSString *)userId
                  name:(NSString *)name
                  email:(NSString *)email
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(logout)
RCT_EXTERN_METHOD(setCustomer:(NSString *)name email:(NSString *)email)
RCT_EXTERN_METHOD(getIsConfigured:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getIsBootstrapped:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

// Products
RCT_EXTERN_METHOD(fetchProducts:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getProducts:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getProduct:(NSString *)productId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Checkout
RCT_EXTERN_METHOD(purchase:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(handleUniversalLink:(NSString *)url
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getPendingCheckout:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(warmUp:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(warmUpAll:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Entitlements
RCT_EXTERN_METHOD(restoreEntitlements:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getEntitlements:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getActiveEntitlements:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(hasActiveEntitlement:(NSString *)productId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Transactions
RCT_EXTERN_METHOD(fetchTransactionHistory:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Cancel Flow
RCT_EXTERN_METHOD(presentCancelFlow:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(fetchCancelFlowConfig:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getCancelFlowConfig:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(acceptSaveOffer:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(submitCancelFlowResponse:(NSDictionary *)response
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pauseSubscription:(NSString *)productId
                  userId:(NSString *)userId
                  pauseDurationDays:(NSNumber *)pauseDurationDays
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resumeSubscription:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(cancelSubscription:(NSString *)productId
                  userId:(NSString *)userId
                  immediate:(BOOL)immediate
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Upgrade Offer
RCT_EXTERN_METHOD(presentUpgradeOffer:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(fetchUpgradeOfferConfig:(NSString *)productId
                  userId:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Migration
RCT_EXTERN_METHOD(getMigrationManager:(NSString *)userId
                  stripeCustomerId:(NSString *)stripeCustomerId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackMigrationConversion:(NSString *)userId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resetMigrateTipState)
RCT_EXTERN_METHOD(presentMigrateTip:(NSString *)backgroundColorHex userId:(NSString *)userId)
RCT_EXTERN_METHOD(dismissMigrateTip)

// Manage Subscription Sheet
RCT_EXTERN_METHOD(presentManageSubscriptionSheet:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(dismissManageSubscriptionSheet)

// Analytics
RCT_EXTERN_METHOD(trackEvent:(NSString *)eventType
                  productId:(NSString *)productId
                  screenName:(NSString *)screenName
                  metadata:(NSDictionary *)metadata)

// Events
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)

@end
