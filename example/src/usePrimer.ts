import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethod,
  UXMode,
} from '@primer-io/react-native';
import type { PaymentMethodConfig } from 'src/types';

interface UsePrimerOptions {
  clientToken: string;
  paymentMethods: PaymentMethodConfig[];
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

  const showCheckout = () => {
    UniversalCheckout.show();
  };

  useEffect(() => {
    UniversalCheckout.initialize({
      clientToken,
      customerId: 'my customer',
      amount,
      currency,
      uxMode,
      paymentMethods: [
        PaymentMethod.GoCardless({
          companyName: 'E-Corp',
          companyAddress: {
            line1: 'Unit 10',
            city: 'Marin',
            countryCode: 'SE',
            postalCode: '654936',
          },
          customerName: 'J Doe',
          customerEmail: 'j.doe@email.com',
          customerAddress: {
            line1: '123 Fake St',
            postalCode: '836520',
            city: 'Paris',
            countryCode: 'FR',
          },
        }),
      ],
      theme: {
        android: {
          backgroundColor: '#ff0000',
          buttonCornerRadius: 2.0,
          buttonDefaultColor: '#00ff00',
          windowMode: 'FULL_SCREEN',
        },
        ios: {
          colorTheme: {
            tint1: '#2D50E6',
          },
          textFieldTheme: 'doublelined',
        },
      },
      onEvent(e) {
        console.log(e);
        UniversalCheckout.dismiss();
      },
    });
  });

  return {
    showCheckout,
    token,
  };
}
