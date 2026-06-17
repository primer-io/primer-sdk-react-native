import type { PrimerSettings } from '@primer-io/react-native';

import { STRIPE_ACH_PUBLISHABLE_KEY } from '../Keys';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Full settings used by the Checkout Components examples (Default sheet and the
// custom payment selection demo). Card-only demos keep their own minimal settings.
export function buildCheckoutComponentsSettings(): PrimerSettings {
  const settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io',
      },
      stripeOptions: {
        publishableKey: STRIPE_ACH_PUBLISHABLE_KEY,
        mandateData: {
          merchantName: 'My Merchant Name',
        },
      },
      googlePayOptions: {
        isCaptureBillingAddressEnabled: true,
        isExistingPaymentMethodRequired: false,
        shippingAddressParameters: { isPhoneNumberRequired: true },
        requireShippingMethod: false,
        emailAddressRequired: true,
      },
    },
    uiOptions: {
      appearanceMode: customAppearanceMode,
    },
    debugOptions: {
      is3DSSanityCheckEnabled: false,
    },
    clientSessionCachingEnabled: true,
    apiVersion: '2.4',
  };

  if (appPaymentParameters.merchantName) {
    settings.paymentMethodOptions!.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName,
      isCaptureBillingAddressEnabled: false,
    };
  }

  return settings;
}
