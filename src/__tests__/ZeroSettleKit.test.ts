import { Platform } from 'react-native';
import { ZeroSettleError } from '../models/ZeroSettleError';

// Mock the TurboModule
const mockNativeModule = {
  configure: jest.fn(),
  bootstrap: jest.fn(),
  logout: jest.fn(),
  setCustomer: jest.fn(),
  getIsConfigured: jest.fn(),
  getIsBootstrapped: jest.fn(),
  fetchProducts: jest.fn(),
  getProducts: jest.fn(),
  getProduct: jest.fn(),
  purchase: jest.fn(),
  handleUniversalLink: jest.fn(),
  getPendingCheckout: jest.fn(),
  warmUp: jest.fn(),
  warmUpAll: jest.fn(),
  restoreEntitlements: jest.fn(),
  getEntitlements: jest.fn(),
  getActiveEntitlements: jest.fn(),
  hasActiveEntitlement: jest.fn(),
  fetchTransactionHistory: jest.fn(),
  presentCancelFlow: jest.fn(),
  fetchCancelFlowConfig: jest.fn(),
  getCancelFlowConfig: jest.fn(),
  acceptSaveOffer: jest.fn(),
  submitCancelFlowResponse: jest.fn(),
  pauseSubscription: jest.fn(),
  resumeSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
  presentUpgradeOffer: jest.fn(),
  fetchUpgradeOfferConfig: jest.fn(),
  getMigrationManager: jest.fn(),
  trackMigrationConversion: jest.fn(),
  resetMigrateTipState: jest.fn(),
  presentMigrateTip: jest.fn(),
  dismissMigrateTip: jest.fn(),
  presentManageSubscriptionSheet: jest.fn(),
  dismissManageSubscriptionSheet: jest.fn(),
  trackEvent: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

jest.mock('../NativeZeroSettleKit', () => ({
  __esModule: true,
  default: mockNativeModule,
}));

// Must import after mock is set up
import { ZeroSettleKit } from '../ZeroSettleKit';

beforeEach(() => {
  jest.clearAllMocks();
  // Default to iOS
  (Platform as any).OS = 'ios';
});

describe('ZeroSettleKit', () => {
  describe('configure', () => {
    it('calls native module with correct args and defaults', () => {
      ZeroSettleKit.configure({
        publishableKey: 'zs_pk_test_abc123',
      });

      expect(mockNativeModule.configure).toHaveBeenCalledWith(
        'zs_pk_test_abc123',
        true, // syncStoreKitTransactions default
        null, // appleMerchantId default
        false, // preloadCheckout default
        null // maxPreloadedWebViews default
      );
    });

    it('passes all custom config values', () => {
      ZeroSettleKit.configure({
        publishableKey: 'zs_pk_live_xyz',
        syncStoreKitTransactions: false,
        appleMerchantId: 'merchant.com.app',
        preloadCheckout: true,
        maxPreloadedWebViews: 3,
      });

      expect(mockNativeModule.configure).toHaveBeenCalledWith(
        'zs_pk_live_xyz',
        false,
        'merchant.com.app',
        true,
        3
      );
    });

    it('is a no-op on non-iOS platforms', () => {
      (Platform as any).OS = 'android';

      ZeroSettleKit.configure({
        publishableKey: 'zs_pk_test_abc123',
      });

      expect(mockNativeModule.configure).not.toHaveBeenCalled();
    });
  });

  describe('bootstrap', () => {
    it('calls native module and returns ProductCatalog', async () => {
      const mockCatalog = {
        products: [{ id: 'premium', displayName: 'Premium' }],
        config: null,
      };
      mockNativeModule.bootstrap.mockResolvedValue(mockCatalog);

      const result = await ZeroSettleKit.bootstrap('user_123');

      expect(mockNativeModule.bootstrap).toHaveBeenCalledWith(
        'user_123',
        null,
        null
      );
      expect(result).toEqual(mockCatalog);
    });

    it('passes name and email options', async () => {
      mockNativeModule.bootstrap.mockResolvedValue({
        products: [],
        config: null,
      });

      await ZeroSettleKit.bootstrap('user_123', {
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(mockNativeModule.bootstrap).toHaveBeenCalledWith(
        'user_123',
        'Jane Doe',
        'jane@example.com'
      );
    });

    it('wraps native errors as ZeroSettleError', async () => {
      mockNativeModule.bootstrap.mockRejectedValue({
        code: 'not_configured',
        message: 'SDK not configured',
      });

      await expect(ZeroSettleKit.bootstrap('user_123')).rejects.toThrow(
        ZeroSettleError
      );

      try {
        await ZeroSettleKit.bootstrap('user_123');
      } catch (error) {
        expect(error).toBeInstanceOf(ZeroSettleError);
        expect((error as ZeroSettleError).code).toBe('not_configured');
      }
    });

    it('throws plain Error on non-iOS', async () => {
      (Platform as any).OS = 'android';

      await expect(ZeroSettleKit.bootstrap('user_123')).rejects.toThrow(
        'ZeroSettleKit is only available on iOS'
      );
    });
  });

  describe('logout', () => {
    it('calls native module', () => {
      ZeroSettleKit.logout();
      expect(mockNativeModule.logout).toHaveBeenCalled();
    });

    it('is a no-op on non-iOS', () => {
      (Platform as any).OS = 'android';
      ZeroSettleKit.logout();
      expect(mockNativeModule.logout).not.toHaveBeenCalled();
    });
  });

  describe('setCustomer', () => {
    it('calls native module with values', () => {
      ZeroSettleKit.setCustomer({ name: 'Jane', email: 'jane@test.com' });
      expect(mockNativeModule.setCustomer).toHaveBeenCalledWith(
        'Jane',
        'jane@test.com'
      );
    });

    it('passes null for omitted values', () => {
      ZeroSettleKit.setCustomer({ name: 'Jane' });
      expect(mockNativeModule.setCustomer).toHaveBeenCalledWith('Jane', null);
    });
  });

  describe('fetchProducts', () => {
    it('calls native module and returns catalog', async () => {
      const mockCatalog = { products: [], config: null };
      mockNativeModule.fetchProducts.mockResolvedValue(mockCatalog);

      const result = await ZeroSettleKit.fetchProducts('user_123');

      expect(mockNativeModule.fetchProducts).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(mockCatalog);
    });

    it('passes null when userId is omitted', async () => {
      mockNativeModule.fetchProducts.mockResolvedValue({
        products: [],
        config: null,
      });

      await ZeroSettleKit.fetchProducts();

      expect(mockNativeModule.fetchProducts).toHaveBeenCalledWith(null);
    });
  });

  describe('purchase', () => {
    it('calls native module and returns transaction', async () => {
      const mockTx = {
        id: 'tx_1',
        productId: 'premium',
        status: 'completed',
      };
      mockNativeModule.purchase.mockResolvedValue(mockTx);

      const result = await ZeroSettleKit.purchase('premium', 'user_123');

      expect(mockNativeModule.purchase).toHaveBeenCalledWith(
        'premium',
        'user_123'
      );
      expect(result).toEqual(mockTx);
    });

    it('wraps cancellation errors', async () => {
      mockNativeModule.purchase.mockRejectedValue({
        code: 'cancelled',
        message: 'User cancelled',
      });

      try {
        await ZeroSettleKit.purchase('premium');
      } catch (error) {
        expect(ZeroSettleError.isCancellation(error)).toBe(true);
      }
    });
  });

  describe('entitlements', () => {
    it('restoreEntitlements calls native module', async () => {
      mockNativeModule.restoreEntitlements.mockResolvedValue([]);
      const result = await ZeroSettleKit.restoreEntitlements('user_123');

      expect(mockNativeModule.restoreEntitlements).toHaveBeenCalledWith(
        'user_123'
      );
      expect(result).toEqual([]);
    });

    it('getEntitlements returns empty array on non-iOS', async () => {
      (Platform as any).OS = 'android';
      const result = await ZeroSettleKit.getEntitlements();
      expect(result).toEqual([]);
    });

    it('hasActiveEntitlement returns false on non-iOS', async () => {
      (Platform as any).OS = 'android';
      const result = await ZeroSettleKit.hasActiveEntitlement('premium');
      expect(result).toBe(false);
    });
  });

  describe('cancel flow', () => {
    it('presentCancelFlow returns result string', async () => {
      mockNativeModule.presentCancelFlow.mockResolvedValue('retained');

      const result = await ZeroSettleKit.presentCancelFlow(
        'premium',
        'user_123'
      );

      expect(result).toBe('retained');
    });

    it('cancelSubscription defaults immediate to false', async () => {
      mockNativeModule.cancelSubscription.mockResolvedValue(undefined);

      await ZeroSettleKit.cancelSubscription('premium', 'user_123');

      expect(mockNativeModule.cancelSubscription).toHaveBeenCalledWith(
        'premium',
        'user_123',
        false
      );
    });
  });

  describe('upgrade offer', () => {
    it('presentUpgradeOffer returns result string', async () => {
      mockNativeModule.presentUpgradeOffer.mockResolvedValue('upgraded');

      const result = await ZeroSettleKit.presentUpgradeOffer('user_123');

      expect(mockNativeModule.presentUpgradeOffer).toHaveBeenCalledWith(
        null,
        'user_123'
      );
      expect(result).toBe('upgraded');
    });

    it('passes productId when provided', async () => {
      mockNativeModule.presentUpgradeOffer.mockResolvedValue('dismissed');

      await ZeroSettleKit.presentUpgradeOffer('user_123', 'monthly');

      expect(mockNativeModule.presentUpgradeOffer).toHaveBeenCalledWith(
        'monthly',
        'user_123'
      );
    });
  });

  describe('migration', () => {
    it('resetMigrateTipState calls native module', () => {
      ZeroSettleKit.resetMigrateTipState();
      expect(mockNativeModule.resetMigrateTipState).toHaveBeenCalled();
    });

    it('presentMigrateTip calls native module', () => {
      ZeroSettleKit.presentMigrateTip('#1E1E1E', 'user_123');
      expect(mockNativeModule.presentMigrateTip).toHaveBeenCalledWith(
        '#1E1E1E',
        'user_123'
      );
    });

    it('dismissMigrateTip is no-op on non-iOS', () => {
      (Platform as any).OS = 'android';
      ZeroSettleKit.dismissMigrateTip();
      expect(mockNativeModule.dismissMigrateTip).not.toHaveBeenCalled();
    });
  });

  describe('manage subscription', () => {
    it('presentManageSubscriptionSheet returns result', async () => {
      mockNativeModule.presentManageSubscriptionSheet.mockResolvedValue(
        'stayWithDiscount'
      );

      const result = await ZeroSettleKit.presentManageSubscriptionSheet();

      expect(result).toBe('stayWithDiscount');
    });

    it('returns dismissed on non-iOS', async () => {
      (Platform as any).OS = 'android';
      const result = await ZeroSettleKit.presentManageSubscriptionSheet();
      expect(result).toBe('dismissed');
    });
  });

  describe('analytics', () => {
    it('trackEvent calls native module', () => {
      ZeroSettleKit.trackEvent('paywall_viewed', {
        productId: 'premium',
        screenName: 'settings',
        metadata: { variant: 'a' },
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        'paywall_viewed',
        'premium',
        'settings',
        { variant: 'a' }
      );
    });

    it('passes null for omitted optional args', () => {
      ZeroSettleKit.trackEvent('checkout_started', {
        productId: 'premium',
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        'checkout_started',
        'premium',
        null,
        null
      );
    });

    it('is no-op on non-iOS', () => {
      (Platform as any).OS = 'android';
      ZeroSettleKit.trackEvent('paywall_viewed', { productId: 'premium' });
      expect(mockNativeModule.trackEvent).not.toHaveBeenCalled();
    });
  });
});
