import { Platform } from 'react-native';

/** The Apple Pay payment-method type. */
export const APPLE_PAY = 'APPLE_PAY';

/**
 * Whether Apple Pay can be presented. The iOS SDK already filters APPLE_PAY out of the
 * available-methods list when the device can't present it, so list membership on iOS is
 * sufficient; gate on Platform.OS so merchants need no platform branch in their render path.
 */
export const isApplePaySupported = (methods: ReadonlyArray<{ paymentMethodType: string }>): boolean =>
  Platform.OS === 'ios' && methods.some((m) => m.paymentMethodType === APPLE_PAY);
