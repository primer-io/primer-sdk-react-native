import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethod,
  UXMode,
} from '@primer-io/react-native';

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
    UniversalCheckout.show();
  };

  useEffect(() => {
    UniversalCheckout.initialize({
      clientToken,
      paymentMethods: [PaymentMethod.Card()],
      onEvent,
      uxMode,
      amount,
      currency,
    });

    return () => {
      UniversalCheckout.destroy();
    };
  });

  return {
    showCheckout,
    token,
  };
}
