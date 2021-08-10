export interface IPrimerSettings {
  order: IOrder;
  business: IBusiness;
  customer: ICustomer;
  appearance: IAppearance;
}

interface IOrder {
  amount?: Number;
  currency?: String;
}

interface IBusiness {
  name?: String;
  address?: IAddress;
}

interface ICustomer {
  firstName?: String;
  lastName?: String;
  email?: String;
  shipping?: IAddress;
  billing?: IAddress;
}

interface IAppearance {
  hasDisabledSuccessScreen: boolean;
  isInitialLoadingHidden: boolean;
  locale?: String;
}
