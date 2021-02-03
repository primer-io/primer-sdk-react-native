import { useEffect, useState } from 'react';
import {
  UniversalCheckout,
  PaymentMethod,
  UXMode,
} from '@primer-io/react-native';
import { Platform } from 'react-native';
import type {
  PaymentMethodConfig,
  IUniversalCheckout,
  IOSUniversalCheckout,
} from 'src/types';

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

  const onEvent = (e: unknown) => {
    console.log(e);
  };

  const showCheckout = () => {
    if (Platform.OS === 'android') {
      (UniversalCheckout as IUniversalCheckout).show();
    } else {
      // (UniversalCheckout as IOSUniversalCheckout).loadPaymentMethods((arg) => {
      //   console.log('🍷 args:', arg);
      //   return;
      // });
      (UniversalCheckout as IOSUniversalCheckout).loadDirectDebitView();
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
        theme: {
          backgroundColor: '#ff0000',
          buttonCornerRadius: 2.0,
          buttonDefaultColor: '#00ff00',
          android: {
            windowMode: 'FULL_SCREEN',
          },
        },
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
            clientToken:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjNmNDRhNDg3LWQzZmEtNGFmYi1hNDNhLTVjMDNlYmFlNjM3YyIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOm51bGwsInBheW1lbnRGbG93IjoiUFJFRkVSX1ZBVUxUIiwidGhyZWVEU2VjdXJlSW5pdFVybCI6Imh0dHBzOi8vc29uZ2JpcmRzdGFnLmNhcmRpbmFsY29tbWVyY2UuY29tL2NhcmRpbmFsY3J1aXNlL3YxL3NvbmdiaXJkLmpzIiwidGhyZWVEU2VjdXJlVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcWRHa2lPaUppWWpSbFpqY3hNeTAxTkRGaExUUmtaRFl0WVRReE5TMHlOV1ZrWlRVMVpEZ3dZVEFpTENKcFlYUWlPakUyTVRJek56VTVNallzSW1semN5STZJalZsWWpWaVlXVmpaVFpsWXpjeU5tVmhOV1ppWVRkbE5TSXNJazl5WjFWdWFYUkpaQ0k2SWpWbFlqVmlZVFF4WkRRNFptSmtOakE0T0RoaU9HVTBOQ0o5Llg2TkZwSGdzTDJqWFNiNUFPVmRxaExONlRHQ2xscnhGTF9JNVBEQXAtcmciLCJjb3JlVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJwY2lVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pbyIsImVudiI6IlNBTkRCT1gifQ.pSS4x5K7poffMRzxflpjt3vHC6MYT0NhtiKJkg8mQ48',
            expirationDate: '2021-02-04T18:12:06.087872',
          },
          amount,
          currency,
          customerId: 'customer_1',
          countryCode: 'FR',
          theme: {
            colorTheme: {
              tint1: {
                red: 45,
                green: 80,
                blue: 230,
              },
            },
            textFieldTheme: 'doublelined',
          },
          businessDetails: {
            name: 'My Business Ltd.',
            address: {
              addressLine1: '4 Rue',
              city: 'Paris',
              postalCode: '75001',
              countryCode: 'FR',
            },
          },
          // isFullScreenOnly: true, //toggle to only enable full screen view
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
