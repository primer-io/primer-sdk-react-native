import type { CountryCode } from './countryCode';
import type { CurrencyCode } from './currencyCode';

export interface IPrimerSettings {
  order?: IOrder;
  business?: IBusiness;
  customer?: ICustomer;
  options?: IOptions;
}

interface IOrder {
  amount?: number;
  currency?: CurrencyCode;
  countryCode?: CountryCode;
  items?: IOrderItem[];
}

interface IOrderItem {
  name: string;
  unitAmount?: number;
  quantity: number;
  isPending?: boolean;
}

interface IBusiness {
  name: string;
  address: IAddress;
}

interface ICustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  shipping?: IAddress;
  billing?: IAddress;
}

interface IOptions {
  hasDisabledSuccessScreen?: boolean;
  isInitialLoadingHidden?: boolean;
  locale?: string;
  iosMerchantIdentifier?: string;
  iosUrlScheme?: string;
  iosUrlSchemeIdentifier?: string;
  isFullScreenOnly?: boolean;
  androidRedirectScheme?: string;
}
