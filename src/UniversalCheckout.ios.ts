import { NativeModules } from 'react-native';
import type {
  IUniversalCheckout,
  IOSInitOptions,
  InitOptions,
  PaymentMethodToken,
  IOSCheckoutTheme,
  IOSRgbColor,
  IOSPrimerColorTheme,
  IOSBusinessDetails,
  IOSCustomerDetails,
} from './types';

const { UniversalCheckoutRN: IOSModule } = NativeModules;

export const UniversalCheckout: IUniversalCheckout = {
  /**
   * Initialize the iOS SDK
   * @param _options
   */
  initialize(options: InitOptions): void {
    const initOptions: Omit<
      IOSInitOptions,
      'businessDetails' | 'customerDetails'
    > & {
      businessDetails?: IOSBusinessDetails;
      customerDetails?: IOSCustomerDetails;
    } = {
      amount: options.amount ?? 100, // TODO - make this optional
      currency: options.currency ?? 'EUR', // TODO - make this optional,
      clientTokenData: {
        clientToken: options.clientToken,
        expirationDate: '',
      },
      countryCode: 'FR',
      customerId: 'mock-customer-id', // TODO - make this optional
      theme: formatTheme(options.theme?.ios) ?? undefined,
    };

    const gc = options.paymentMethods.find((e) => e.type === 'GOCARDLESS');

    if (gc != null && gc.type === 'GOCARDLESS') {
      const customerName = gc.customerName ?? '';
      const tokens = customerName.split(/\s+/g);
      const [first, ...others] = tokens;

      initOptions.businessDetails = {
        name: gc.companyName,
        address: {
          addressLine1: gc.companyAddress.line1,
          addressLine2: gc.companyAddress.line2,
          city: gc.companyAddress.city,
          state: gc.companyAddress.state,
          postalCode: gc.companyAddress.postalCode,
          countryCode: gc.companyAddress.countryCode,
        },
      };
      initOptions.customerDetails = {
        firstName: first,
        lastName: others.join(' '),
        email: gc.customerEmail ?? '',
        addressLine1: gc.companyAddress.line1,
        addressLine2: gc.companyAddress.line2,
        city: gc.companyAddress.city,
        state: gc.companyAddress.state,
        postalCode: gc.companyAddress.postalCode,
        countryCode: gc.companyAddress.countryCode,
      };
    }

    const onTokenizeSuccess = (val: any): void => {
      options.onEvent({ type: 'TOKENIZE_SUCCESS', data: val });
    };

    IOSModule.initialize(initOptions, onTokenizeSuccess);
  },

  /**
   * noop
   */
  destroy() {},

  /**
   * iOS will only support loading of DD view in RN for now
   */
  show(): void {
    IOSModule.loadDirectDebitView();
  },

  /**
   * noop
   */
  showProgressIndicator() {},

  /**
   * Noop
   */
  showSuccess() {},

  // /**
  //  * Set direct debit details
  //  */
  // setDirectDebitDetails({
  // }): void {
  //   IOSModule.setDirectDebitDetails
  // }

  /**
   * Fetch tokenised payment methods and direct debit
   * @param _options
   */
  getSavedPaymentMethods(): Promise<PaymentMethodToken[]> {
    return new Promise((resolve) => {
      IOSModule.loadPaymentMethods((val: string) => {
        const tokens = JSON.parse(val) as unknown[];
        resolve(tokens as PaymentMethodToken[]);
      });
    });
  },

  /**
   * Dismiss the checkout view
   * @param _options
   */
  dismiss(): void {
    IOSModule.dismissCheckout();
  },
};

function formatTheme(
  theme?: IOSCheckoutTheme
): IOSCheckoutTheme<IOSRgbColor> | null {
  if (!theme) {
    return null;
  }

  const { colorTheme, textFieldTheme, cornerRadiusTheme } = theme;

  if (!colorTheme) {
    return textFieldTheme
      ? { textFieldTheme, colorTheme: {}, cornerRadiusTheme }
      : null;
  }

  const nextTheme = Object.entries(colorTheme).reduce(
    (acc: IOSPrimerColorTheme<IOSRgbColor>, [key, hex]) => {
      const rgb = toRGB(hex as string);

      if (!rgb) {
        return acc;
      }

      return { ...acc, [key]: rgb };
    },
    {}
  );

  return {
    textFieldTheme,
    colorTheme: nextTheme,
    cornerRadiusTheme,
  };
}

function toRGB(hex: string): IOSRgbColor | null {
  // Make sure it looks like a proper color hex string
  if (!/^#[0-9a-f]{6,8}$/i.test(hex)) {
    return null;
  }

  // take just the rgb components
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/gi.exec(hex);

  if (!match) {
    return null;
  }

  const r = match[1];
  const g = match[2];
  const b = match[3];

  // convert hex string to decimal
  return {
    red: parseInt(r, 16),
    green: parseInt(g, 16),
    blue: parseInt(b, 16),
  };
}
