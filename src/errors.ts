import { ZeroSettleError, type ZeroSettleErrorCode } from './models/ZeroSettleError';

/**
 * Wraps a native module error into a typed `ZeroSettleError`.
 *
 * React Native bridges native errors as objects with `code`, `message`,
 * and optional `userInfo` properties. This function normalizes them into
 * the SDK's typed error class.
 */
export function wrapNativeError(error: any): ZeroSettleError {
  const code = (error?.code ?? 'api_error') as ZeroSettleErrorCode;
  const message = error?.message ?? 'Unknown error';
  const userInfo = error?.userInfo as Record<string, unknown> | undefined;
  return new ZeroSettleError(code, message, userInfo);
}
