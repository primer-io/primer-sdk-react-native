import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethod,
  UXMode,
} from '@primer-io/react-native';

interface UsePrimerOptions {
  clientToken: string;
  currency?: string;
  amount?: number;
}

export function usePrimer({ clientToken, amount, currency }: UsePrimerOptions) {
  const [token] = useState<string | null>(null);

  const showCheckout = () => {
    UniversalCheckout.initialize({
      clientToken,
      amount,
      currency,
      uxMode: UXMode.STANDALONE_PAYMENT_METHOD,
      paymentMethods: [
        PaymentMethod.GoCardless({
          companyName: 'E-Corp',
          companyAddress: {
            line1: 'Unit 10',
            city: 'Marin',
            countryCode: 'SE',
            postalCode: '654936',
          },
          customerName: 'John Doe',
          customerEmail: 'test@mail.com',
          customerAddress: {
            line1: '1 Rue de Rivoli',
            postalCode: '75001',
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
          textFieldTheme: 'outlined',
          cornerRadiusTheme: {
            buttons: 12,
            textFields: 8,
          },
        },
      },
      onEvent(e) {
        console.log(e);
        UniversalCheckout.dismiss();
      },
    });
    UniversalCheckout.show();
  };

  useEffect(() => {
    UniversalCheckout.initialize({
      clientToken,
      amount,
      currency,
      uxMode: UXMode.STANDALONE_PAYMENT_METHOD,
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
          buttonCornerRadius: 12.0,
          buttonDefaultColor: '#00ff00',
          windowMode: 'FULL_SCREEN',
        },
        ios: {
          colorTheme: {
            tint1: '#2D50E6',
            neutral1: '#2D50E6',
          },
          textFieldTheme: 'outlined',
          cornerRadiusTheme: {
            buttons: 12,
            textFields: 8,
          },
        },
      },
      onEvent(e) {
        console.log(e);
        UniversalCheckout.dismiss();
      },
    });

    UniversalCheckout.getSavedPaymentMethods().then((pms) => {
      console.log('PMS!', pms);
    });
  });

  return {
    showCheckout,
    token,
  };
}
