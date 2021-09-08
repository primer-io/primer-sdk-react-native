import type { CountryCode } from './utils/countryCode';
import type { CurrencyCode } from './utils/currencyCode';

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
  shipping?: IAddress; // TODO: map to native
}

interface IOrderItem {
  name: string;
  unitAmount?: number;
  quantity: number;
  isPending?: boolean;
}

interface IBusiness {
  name: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  address: IAddress;
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
  isResultScreenEnabled?: boolean; // TODO: map to native
  isLoadingScreenEnabled?: boolean; // TODO: map to native
  isFullScreenEnabled?: boolean; // TODO: map to native
  locale?: string; // TODO: language code, region code, locale code
  ios?: IIosOptions; // TODO: map to native
  androids?: IAndroidOptions; // TODO: map to native
}

interface IIosOptions {
  urlScheme?: string; // TODO: map to native
  urlSchemeIdentifier?: string; // TODO: map to native
  merchantIdentifier?: string; // TODO: map to native + Evangelos & Apple Pay
}
interface IAndroidOptions {
  redirectScheme?: string;
}

interface IAddress {
  line1: String;
  line2: String;
  postalCode: String;
  state?: String;
  city: String;
  country: CountryCode;
}
