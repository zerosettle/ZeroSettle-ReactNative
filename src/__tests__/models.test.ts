import { ZeroSettleError } from '../models/ZeroSettleError';
import { wrapNativeError } from '../errors';
import type { Price } from '../models/Price';
import type { ZSProduct } from '../models/ZSProduct';
import type { Entitlement } from '../models/Entitlement';
import type { CheckoutTransaction } from '../models/CheckoutTransaction';
import type { CancelFlowConfig } from '../models/CancelFlow';
import type { UpgradeOfferConfig } from '../models/UpgradeOffer';
import type { RemoteConfig } from '../models/RemoteConfig';
import type { MigrationManagerSnapshot } from '../models/MigrationOffer';

describe('ZeroSettleError', () => {
  it('constructs with code, message, and details', () => {
    const error = new ZeroSettleError('not_configured', 'SDK not configured', {
      hint: 'call configure() first',
    });

    expect(error.code).toBe('not_configured');
    expect(error.message).toBe('SDK not configured');
    expect(error.details).toEqual({ hint: 'call configure() first' });
    expect(error.name).toBe('ZeroSettleError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ZeroSettleError);
  });

  it('constructs without details', () => {
    const error = new ZeroSettleError('cancelled', 'User cancelled');

    expect(error.code).toBe('cancelled');
    expect(error.message).toBe('User cancelled');
    expect(error.details).toBeUndefined();
  });

  describe('isCancellation', () => {
    it('returns true for cancelled ZeroSettleError', () => {
      const error = new ZeroSettleError('cancelled', 'User cancelled');
      expect(ZeroSettleError.isCancellation(error)).toBe(true);
    });

    it('returns false for non-cancelled ZeroSettleError', () => {
      const error = new ZeroSettleError('api_error', 'Server error');
      expect(ZeroSettleError.isCancellation(error)).toBe(false);
    });

    it('returns false for plain Error', () => {
      const error = new Error('something');
      expect(ZeroSettleError.isCancellation(error)).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(ZeroSettleError.isCancellation(null)).toBe(false);
      expect(ZeroSettleError.isCancellation(undefined)).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(ZeroSettleError.isCancellation('cancelled')).toBe(false);
      expect(ZeroSettleError.isCancellation(42)).toBe(false);
    });
  });
});

describe('wrapNativeError', () => {
  it('wraps a native error with code and message', () => {
    const nativeError = {
      code: 'product_not_found',
      message: 'Product not found: premium',
    };

    const wrapped = wrapNativeError(nativeError);

    expect(wrapped).toBeInstanceOf(ZeroSettleError);
    expect(wrapped.code).toBe('product_not_found');
    expect(wrapped.message).toBe('Product not found: premium');
  });

  it('wraps a native error with userInfo as details', () => {
    const nativeError = {
      code: 'api_error',
      message: 'Server error',
      userInfo: { statusCode: 500 },
    };

    const wrapped = wrapNativeError(nativeError);

    expect(wrapped.details).toEqual({ statusCode: 500 });
  });

  it('uses defaults for missing properties', () => {
    const wrapped = wrapNativeError({});

    expect(wrapped.code).toBe('api_error');
    expect(wrapped.message).toBe('Unknown error');
    expect(wrapped.details).toBeUndefined();
  });

  it('handles null/undefined input', () => {
    const wrapped = wrapNativeError(null);

    expect(wrapped).toBeInstanceOf(ZeroSettleError);
    expect(wrapped.code).toBe('api_error');
    expect(wrapped.message).toBe('Unknown error');
  });
});

describe('Model type shapes', () => {
  it('Price accepts valid data', () => {
    const price: Price = {
      amountCents: 999,
      currencyCode: 'USD',
      formatted: '$9.99',
    };
    expect(price.amountCents).toBe(999);
    expect(price.currencyCode).toBe('USD');
    expect(price.formatted).toBe('$9.99');
  });

  it('ZSProduct accepts valid data with nullables', () => {
    const product: ZSProduct = {
      id: 'premium_monthly',
      displayName: 'Premium Monthly',
      productDescription: 'Access all premium features',
      type: 'auto_renewable_subscription',
      webPrice: { amountCents: 699, currencyCode: 'USD', formatted: '$6.99' },
      appStorePrice: {
        amountCents: 999,
        currencyCode: 'USD',
        formatted: '$9.99',
      },
      syncedToAppStoreConnect: true,
      promotion: null,
      billingInterval: 'month',
      billingPeriod: 'month',
      subscriptionGroupId: 1,
      freeTrialDuration: '1_week',
      isTrialEligible: true,
      storeKitAvailable: true,
      storeKitPrice: {
        amountCents: 999,
        currencyCode: 'USD',
        formatted: '$9.99',
      },
      freeTrialDays: 7,
      freeTrialLabel: '7-day free trial',
      savingsPercent: 30,
    };
    expect(product.id).toBe('premium_monthly');
    expect(product.type).toBe('auto_renewable_subscription');
  });

  it('Entitlement accepts valid data with computed properties', () => {
    const entitlement: Entitlement = {
      id: 'ent_123',
      productId: 'premium_monthly',
      source: 'web_checkout',
      isActive: true,
      status: 'active',
      pausedAt: null,
      pauseResumesAt: null,
      expiresAt: '2025-12-31T23:59:59Z',
      willRenew: true,
      isTrial: false,
      trialEndsAt: null,
      cancelledAt: null,
      purchasedAt: '2025-01-01T00:00:00Z',
      storekitOriginalTransactionId: null,
      originalPurchaseDate: null,
      isPaused: false,
      isCancelled: false,
      trialDaysRemaining: null,
    };
    expect(entitlement.isActive).toBe(true);
    expect(entitlement.source).toBe('web_checkout');
  });

  it('CheckoutTransaction accepts valid data', () => {
    const tx: CheckoutTransaction = {
      id: 'tx_456',
      productId: 'premium_monthly',
      status: 'completed',
      source: 'web_checkout',
      purchasedAt: '2025-01-15T12:00:00Z',
      expiresAt: '2025-02-15T12:00:00Z',
      productName: 'Premium Monthly',
      amountCents: 699,
      currency: 'usd',
      storekitStatus: null,
    };
    expect(tx.status).toBe('completed');
  });

  it('CancelFlowConfig accepts valid data', () => {
    const config: CancelFlowConfig = {
      enabled: true,
      questions: [
        {
          id: 1,
          order: 1,
          questionText: 'Why are you leaving?',
          questionType: 'single_select',
          isRequired: true,
          options: [
            {
              id: 1,
              order: 1,
              label: 'Too expensive',
              iconName: null,
              subtitle: null,
              triggersOffer: true,
              triggersPause: false,
            },
          ],
        },
      ],
      offer: {
        enabled: true,
        title: 'Wait!',
        body: 'How about 40% off?',
        ctaText: 'Stay & Save',
        type: 'discount',
        value: '40',
        durationMonths: 3,
      },
      pause: null,
      variantId: null,
    };
    expect(config.enabled).toBe(true);
    expect(config.questions).toHaveLength(1);
  });

  it('UpgradeOfferConfig accepts valid data', () => {
    const config: UpgradeOfferConfig = {
      available: true,
      reason: null,
      currentProduct: {
        referenceId: 'monthly',
        name: 'Monthly',
        price: { amountCents: 999, currencyCode: 'USD', formatted: '$9.99' },
        billingLabel: '/month',
        monthlyEquivalent: null,
      },
      targetProduct: {
        referenceId: 'annual',
        name: 'Annual',
        price: { amountCents: 4999, currencyCode: 'USD', formatted: '$49.99' },
        billingLabel: '/year',
        monthlyEquivalent: {
          amountCents: 416,
          currencyCode: 'USD',
          formatted: '$4.16',
        },
      },
      savingsPercent: 58,
      upgradeType: 'web_to_web',
      proration: { amountCents: -500, currency: 'USD', nextBillingDate: null },
      display: {
        title: 'Upgrade to Annual',
        body: 'Save 58%',
        ctaText: 'Upgrade Now',
        dismissText: 'Not Now',
        storekitMigrationBody: null,
        storekitCancelInstructions: null,
      },
      variantId: null,
    };
    expect(config.available).toBe(true);
    expect(config.savingsPercent).toBe(58);
  });

  it('RemoteConfig accepts valid data', () => {
    const config: RemoteConfig = {
      checkout: {
        sheetType: 'webview',
        isEnabled: true,
        jurisdictions: {},
        appleMerchantId: null,
      },
      migration: null,
    };
    expect(config.checkout.sheetType).toBe('webview');
  });

  it('MigrationManagerSnapshot accepts valid data', () => {
    const snapshot: MigrationManagerSnapshot = {
      state: 'eligible',
      offerData: {
        prompt: {
          productId: 'premium_monthly',
          eligibleProductIds: ['premium_monthly'],
          discountPercent: 20,
          minSubscriptionDays: 0,
          maxSubscriptionDays: null,
          freeTrialDays: 14,
          title: 'Switch & Save',
          message: 'Save 20% on web billing',
          ctaText: 'Switch Now',
          rolloutPercent: null,
          perProductPrompts: null,
        },
        freeTrialDays: 14,
        activeStoreKitProductId: 'premium_monthly',
        storekitSubscriptionEnd: '2025-02-01T00:00:00Z',
        activeStoreKitOriginalTransactionId: '12345',
      },
    };
    expect(snapshot.state).toBe('eligible');
    expect(snapshot.offerData?.freeTrialDays).toBe(14);
  });
});
