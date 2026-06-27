import type { PrimerCheckoutData } from '../../../models/PrimerCheckoutData';
import type { PrimerError } from '../../../models/PrimerError';

export enum CheckoutRoute {
  splash = 'splash',
  loading = 'loading',
  methodSelection = 'methodSelection',
  cardForm = 'cardForm',
  bankSelection = 'bankSelection',
  rawDataForm = 'rawDataForm',
  qrCode = 'qrCode',
  klarna = 'klarna',
  processing = 'processing',
  success = 'success',
  error = 'error',
  countrySelector = 'countrySelector',
  vaultedMethods = 'vaultedMethods',
  deleteConfirmation = 'deleteConfirmation',
  cvvRecapture = 'cvvRecapture',
}

export type RouteParamMap = {
  [CheckoutRoute.splash]: { title?: string; subtitle?: string } | undefined;
  [CheckoutRoute.loading]: { title?: string; subtitle?: string } | undefined;
  [CheckoutRoute.methodSelection]: undefined;
  [CheckoutRoute.cardForm]: { paymentMethodType: string };
  [CheckoutRoute.bankSelection]: { paymentMethodType: string };
  [CheckoutRoute.rawDataForm]: { paymentMethodType: string };
  [CheckoutRoute.qrCode]: undefined;
  [CheckoutRoute.klarna]: { paymentMethodType: string };
  [CheckoutRoute.processing]: undefined;
  [CheckoutRoute.success]: { checkoutData?: PrimerCheckoutData; title?: string; subtitle?: string } | undefined;
  [CheckoutRoute.error]: { error?: PrimerError; title?: string; subtitle?: string } | undefined;
  [CheckoutRoute.countrySelector]: { selectedCountryCode?: string };
  [CheckoutRoute.vaultedMethods]: undefined;
  [CheckoutRoute.deleteConfirmation]: { paymentMethodId: string };
  [CheckoutRoute.cvvRecapture]: { paymentMethodId: string; last4: string };
};

export interface RouteEntry<R extends CheckoutRoute = CheckoutRoute> {
  route: R;
  params: RouteParamMap[R];
  key: string;
}

export interface NavigationState {
  stack: RouteEntry[];
  isAnimating: boolean;
}

export type NavigationAction =
  | { type: 'push'; route: CheckoutRoute; params: RouteParamMap[CheckoutRoute]; key: string }
  | { type: 'pop' }
  | { type: 'replace'; route: CheckoutRoute; params: RouteParamMap[CheckoutRoute]; key: string }
  | { type: 'popToRoot' }
  | { type: 'setAnimating'; isAnimating: boolean };
