import { useEffect } from 'react';
import { NativeEventEmitter, Platform } from 'react-native';
import NativeZeroSettleKit from './NativeZeroSettleKit';
import type { CheckoutTransaction } from './models/CheckoutTransaction';
import type { Entitlement } from './models/Entitlement';
import type { ZeroSettleError } from './models/ZeroSettleError';

/**
 * Event handlers for ZeroSettle SDK lifecycle events.
 *
 * All handlers are optional -- only subscribe to the events you need.
 */
export interface ZeroSettleEventHandlers {
  /** Called when a web checkout begins (Safari is opening). */
  onCheckoutDidBegin?: (productId: string) => void;
  /** Called when a web checkout completes successfully. */
  onCheckoutDidComplete?: (transaction: CheckoutTransaction) => void;
  /** Called when the user cancels the web checkout. */
  onCheckoutDidCancel?: (productId: string) => void;
  /** Called when a web checkout fails. */
  onCheckoutDidFail?: (data: {
    productId: string;
    error: ZeroSettleError;
  }) => void;
  /** Called when the user's entitlements are updated. */
  onEntitlementsDidUpdate?: (entitlements: Entitlement[]) => void;
  /** Called when a native StoreKit transaction is synced to ZeroSettle. */
  onDidSyncStoreKitTransaction?: (data: {
    productId: string;
    transactionId: number;
  }) => void;
  /** Called when syncing a StoreKit transaction fails. */
  onStoreKitSyncFailed?: (error: ZeroSettleError) => void;
}

/**
 * React hook to subscribe to ZeroSettle SDK lifecycle events.
 *
 * Automatically manages event listener subscriptions and cleanup.
 * On non-iOS platforms, this is a no-op.
 *
 * @example
 * ```tsx
 * useZeroSettleEvents({
 *   onCheckoutDidComplete: (tx) => console.log('Checkout complete:', tx.productId),
 *   onEntitlementsDidUpdate: (ents) => setEntitlements(ents),
 * });
 * ```
 */
export function useZeroSettleEvents(handlers: ZeroSettleEventHandlers): void {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const emitter = new NativeEventEmitter(
      NativeZeroSettleKit as any
    );
    const subscriptions: ReturnType<typeof emitter.addListener>[] = [];

    if (handlers.onCheckoutDidBegin) {
      subscriptions.push(
        emitter.addListener('checkoutDidBegin', (event) => {
          handlers.onCheckoutDidBegin!(event.productId);
        })
      );
    }

    if (handlers.onCheckoutDidComplete) {
      subscriptions.push(
        emitter.addListener('checkoutDidComplete', (event) => {
          handlers.onCheckoutDidComplete!(event as CheckoutTransaction);
        })
      );
    }

    if (handlers.onCheckoutDidCancel) {
      subscriptions.push(
        emitter.addListener('checkoutDidCancel', (event) => {
          handlers.onCheckoutDidCancel!(event.productId);
        })
      );
    }

    if (handlers.onCheckoutDidFail) {
      subscriptions.push(
        emitter.addListener('checkoutDidFail', (event) => {
          handlers.onCheckoutDidFail!(event);
        })
      );
    }

    if (handlers.onEntitlementsDidUpdate) {
      subscriptions.push(
        emitter.addListener('entitlementsDidUpdate', (event) => {
          handlers.onEntitlementsDidUpdate!(event.entitlements);
        })
      );
    }

    if (handlers.onDidSyncStoreKitTransaction) {
      subscriptions.push(
        emitter.addListener('didSyncStoreKitTransaction', (event) => {
          handlers.onDidSyncStoreKitTransaction!(event);
        })
      );
    }

    if (handlers.onStoreKitSyncFailed) {
      subscriptions.push(
        emitter.addListener('storeKitSyncFailed', (event) => {
          handlers.onStoreKitSyncFailed!(event);
        })
      );
    }

    return () => {
      subscriptions.forEach((sub) => sub.remove());
    };
  }, [handlers]);
}
