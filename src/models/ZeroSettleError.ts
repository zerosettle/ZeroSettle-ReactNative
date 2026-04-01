/** Machine-readable error codes from the ZeroSettle SDK. */
export type ZeroSettleErrorCode =
  | 'not_configured'
  | 'invalid_publishable_key'
  | 'product_not_found'
  | 'checkout_failed'
  | 'transaction_verification_failed'
  | 'api_error'
  | 'invalid_callback_url'
  | 'web_checkout_disabled_for_jurisdiction'
  | 'user_id_required'
  | 'restore_entitlements_failed'
  | 'cancelled'
  | 'purchase_pending'
  | 'storekit_verification_failed'
  | 'invalid_user_id';

/**
 * Typed error thrown by ZeroSettleKit methods.
 *
 * Use `ZeroSettleError.isCancellation(error)` to check if an error
 * represents a user-initiated cancellation.
 */
export class ZeroSettleError extends Error {
  readonly code: ZeroSettleErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ZeroSettleErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ZeroSettleError';
    this.code = code;
    this.details = details;
  }

  /**
   * Returns `true` if the error represents a user-initiated cancellation,
   * regardless of which layer threw it.
   */
  static isCancellation(error: unknown): boolean {
    return error instanceof ZeroSettleError && error.code === 'cancelled';
  }
}
