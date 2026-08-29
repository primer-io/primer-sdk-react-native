import { Platform } from 'react-native';

/** The Google Pay payment-method type. */
export const GOOGLE_PAY = 'GOOGLE_PAY';

/**
 * Whether Google Pay can be presented. The iOS SDK also recognizes `GOOGLE_PAY`, so it can appear
 * in the available-methods list on iOS — gate on `Platform.OS` so merchants need no platform branch
 * in their render path (FR-010). Native already gated capability via `isReadyToPay`, so list
 * membership on Android is sufficient.
 */
export const isGooglePaySupported = (methods: ReadonlyArray<{ paymentMethodType: string }>): boolean =>
  Platform.OS === 'android' && methods.some((m) => m.paymentMethodType === GOOGLE_PAY);
