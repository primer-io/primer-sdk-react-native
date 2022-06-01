import type { CountryCode } from './utils/countryCode';
import type { CurrencyCode } from './utils/currencyCode';

export type PrimerSettings = IPrimerSettings;
interface IPrimerSettings {
  order?: IOrder;
  business?: IBusiness;
  customer?: ICustomer;
  options?: IOptions;
}

interface IOrder {
  id?: string;
  amount?: number;
  currency?: CurrencyCode;
  countryCode?: CountryCode;
  items?: IOrderItem[];
  shipping?: IAddress;
}

interface IOrderItem {
  name: string;
  amount: number;
  quantity: number;
  isPending?: boolean;
}

interface IBusiness {
  name?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  address?: IAddress;
}

interface ICustomer {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billing?: IAddress;
}

interface IOptions {
  isResultScreenEnabled?: boolean;
  isLoadingScreenEnabled?: boolean;
  isFullScreenEnabled?: boolean;
  is3DSOnVaultingEnabled?: boolean;
  is3DSDevelopmentModeEnabled?: boolean;
  locale?: string;
  ios?: IIosOptions;
  android?: IAndroidOptions;
}

interface IIosOptions {
  urlScheme?: string;
  urlSchemeIdentifier?: string;
  merchantIdentifier?: string;
}

interface IAndroidOptions {
    redirectScheme?: string;
}

interface IAddress {
  line1?: String;
  line2?: String;
  postalCode?: String;
  state?: String;
  city?: String;
  country?: CountryCode;
}
