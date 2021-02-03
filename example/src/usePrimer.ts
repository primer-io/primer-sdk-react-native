import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethod,
  UXMode,
} from '@primer-io/react-native';
import { Platform } from 'react-native';
import type { IUniversalCheckout, IOSUniversalCheckout } from 'src/types';

interface UsePrimerOptions {
  clientToken: string;
  uxMode?: UXMode;
  currency?: string;
  amount?: number;
}

export function usePrimer({
  clientToken,
  uxMode = UXMode.CHECKOUT,
  amount,
  currency,
}: UsePrimerOptions) {
  const [token] = useState<string | null>(null);

  const onEvent = (e: unknown) => {
    console.log(e);
  };

  const showCheckout = () => {
    if (Platform.OS === 'android') {
      (UniversalCheckout as IUniversalCheckout).show();
    } else {
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      (UniversalCheckout as IUniversalCheckout).initialize({
        clientToken,
        paymentMethods: [PaymentMethod.Card()],
        onEvent,
        uxMode,
        amount,
        currency,
      });

      return () => {
        (UniversalCheckout as IUniversalCheckout).destroy();
      };
    } else {
      if (!amount) return;
      if (!currency) return;

      (UniversalCheckout as IOSUniversalCheckout).initialize(
        {
          clientTokenData: {
            clientToken: clientToken,
            expirationDate: '',
          },
          amount,
          currency,
          customerId: '',
          countryCode: 'FR',
        },
        (paymentMethodToken) => {
          console.log(paymentMethodToken);

          // dismiss checkout after successful tokenization.
          (UniversalCheckout as IOSUniversalCheckout).dismissCheckout();

          return;
        }
      );
      return;
    }
  });

  return {
    showCheckout,
    token,
  };
}
