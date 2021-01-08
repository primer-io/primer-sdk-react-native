import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethodType,
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
  uxMode,
  amount,
  currency,
}: UsePrimerOptions) {
  const [token] = useState<string | null>(null);

  const onEvent = (e: unknown) => {
    console.log(e);
  };

  const showCheckout = () => {
    UniversalCheckout.show(onEvent, {
      uxMode,
      amount,
      currency,
    });
  };

  useEffect(() => {
    UniversalCheckout.initialize(clientToken);
    UniversalCheckout.loadPaymentMethods([
      { type: PaymentMethodType.PAYMENT_CARD },
    ]);

    return () => {
      UniversalCheckout.destroy();
    };
  });

  return {
    showCheckout,
    token,
  };
}
