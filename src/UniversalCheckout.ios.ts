// import { NativeModules } from 'react-native';
// import type {
//   IUniversalCheckout,
//   IOSInitOptions,
//   InitOptions,
//   PaymentMethodToken,
//   IOSBusinessDetails,
//   IOSCustomerDetails,
// } from './types';
// import { formatTheme } from './utils';

// const { UniversalCheckoutRN: IOSModule } = NativeModules;

// export const UniversalCheckout: IUniversalCheckout = {
//   /**
//    * Initialize the iOS SDK
//    * @param _options
//    */
//   initialize(options: InitOptions): void {
//     const initOptions: Omit<
//       IOSInitOptions,
//       'businessDetails' | 'customerDetails'
//     > & {
//       businessDetails?: IOSBusinessDetails;
//       customerDetails?: IOSCustomerDetails;
//     } = {
//       amount: options.amount ?? 100, // TODO - make this optional
//       currency: options.currency ?? 'EUR', // TODO - make this optional,
//       clientTokenData: {
//         clientToken: options.clientToken,
//         expirationDate: '',
//       },
//       countryCode: 'FR',
//       customerId: 'mock-customer-id', // TODO - make this optional
//       theme: formatTheme(options.theme?.ios) ?? undefined,
//     };

//     const gc = options.paymentMethods.find((e) => e.type === 'GOCARDLESS');

//     if (gc != null && gc.type === 'GOCARDLESS') {
//       const customerName = gc.customerName ?? '';
//       const tokens = customerName.split(/\s+/g);
//       const [first, ...others] = tokens;

//       initOptions.businessDetails = {
//         name: gc.companyName,
//         address: {
//           addressLine1: gc.companyAddress.line1,
//           addressLine2: gc.companyAddress.line2,
//           city: gc.companyAddress.city,
//           state: gc.companyAddress.state,
//           postalCode: gc.companyAddress.postalCode,
//           countryCode: gc.companyAddress.countryCode,
//         },
//       };
//       initOptions.customerDetails = {
//         firstName: first,
//         lastName: others.join(' '),
//         email: gc.customerEmail ?? '',
//         addressLine1: gc.customerAddress?.line1 ?? '',
//         addressLine2: gc.customerAddress?.line2 ?? '',
//         city: gc.customerAddress?.city ?? '',
//         state: gc.customerAddress?.state,
//         postalCode: gc.customerAddress?.postalCode ?? '',
//         countryCode: gc.customerAddress?.countryCode ?? '',
//       };
//     }

//     // set callback that resets on each call after tokenization.
//     const onTokenizeSuccess = (val: string): void => {
//       options.onEvent({ type: 'TOKENIZE_SUCCESS', data: JSON.parse(val) });
//     };
//     setEventCallback(onTokenizeSuccess);

//     const onViewDismissed = (): void => {
//       options.onEvent({ type: 'EXIT', data: { reason: 'FINISHED' } });
//     };
//     setOnViewDismissedCallback(onViewDismissed);

//     IOSModule.initialize(initOptions);
//   },

//   /**
//    * noop
//    */
//   destroy() {},

//   /**
//    * iOS will only support loading of DD view in RN for now
//    */
//   show(): void {
//     IOSModule.loadDirectDebitView();
//   },

//   /**
//    * noop
//    */
//   showProgressIndicator() {},

//   /**
//    * Noop
//    */
//   showSuccess() {},

//   // /**
//   //  * Set direct debit details
//   //  */
//   // setDirectDebitDetails({
//   // }): void {
//   //   IOSModule.setDirectDebitDetails
//   // }

//   /**
//    * Fetch tokenised payment methods and direct debit
//    * @param _options
//    */
//   getSavedPaymentMethods(): Promise<PaymentMethodToken[]> {
//     return new Promise((resolve) => {
//       IOSModule.loadPaymentMethods((val: string) => {
//         const tokens = JSON.parse(val) as unknown[];
//         resolve(tokens as PaymentMethodToken[]);
//       });
//     });
//   },

//   /**
//    * Dismiss the checkout view
//    * @param _options
//    */
//   dismiss(): void {
//     IOSModule.dismissCheckout();
//   },
// };

// /**
//  * The event callback has to be continuously replaced in iOS
//  */
// function setEventCallback(onEvent: (e: any) => void): void {
//   IOSModule.setEventCallback((data: any) => {
//     onEvent(data);
//     setEventCallback(onEvent);
//   });
// }

// /**
//  * The onDismiss event callback has to be continuously replaced in iOS
//  */
// function setOnViewDismissedCallback(onEvent: (e: any) => void): void {
//   IOSModule.setOnViewDismissedCallback((data: any) => {
//     onEvent(data);
//     setOnViewDismissedCallback(onEvent);
//   });
// }
