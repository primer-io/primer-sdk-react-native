export { Primer } from './Primer';
export type { PrimerSettings, PrimerApiVersion } from './models/PrimerSettings';
export { PrimerInputElementType as InputElementType } from './models/PrimerInputElementType';
export { PrimerSessionIntent as SessionIntent } from './models/PrimerSessionIntent';
export type {
  PrimerPaymentCreationHandler as PaymentCreationHandler,
  PrimerTokenizationHandler as TokenizationHandler,
  PrimerResumeHandler as ResumeHandler,
  PrimerErrorHandler as ErrorHandler,
} from './models/PrimerHandlers';
export type { PrimerPaymentMethodTokenData } from './models/PrimerPaymentMethodTokenData';
export type {
  PrimerClientSession as ClientSession,
  PrimerOrder as Order,
  PrimerLineItem as LineItem,
  PrimerCustomer as Customer,
  PrimerAddress as Address,
} from './models/PrimerClientSession';
export type {
  PrimerRawData as RawData,
  PrimerCardData as CardData,
  PrimerBancontactCardData as BancontactCardData,
  PrimerPhoneNumberData as PhoneNumberData,
  PrimerRetailerData as RetailerData,
} from './models/PrimerRawData';
export type {
  PrimerCheckoutAdditionalInfo as CheckoutAdditionalInfo,
  MultibancoCheckoutAdditionalInfo,
} from './models/PrimerCheckoutAdditionalInfo';
export type { RetailOutletsRetail } from './models/RetailOutletsRetail';
export type {
  PrimerCheckoutData as CheckoutData,
  PrimerCheckoutDataPayment as CheckoutDataPayment,
} from './models/PrimerCheckoutData';
export type { PrimerCheckoutPaymentMethodData as CheckoutPaymentMethodData } from './models/PrimerCheckoutPaymentMethodData';
export type { PrimerError } from './models/PrimerError';
export type { PrimerPaymentMethodAsset as Asset } from './models/PrimerPaymentMethodResource';
export type {
  IPrimerPaymentMethodResource as Resource,
  PrimerPaymentMethodAsset as AssetResource,
  PrimerPaymentMethodNativeView as NativeViewResource,
  IPrimerAsset as AssetResourceColors,
} from './models/PrimerPaymentMethodResource';
export { PrimerHeadlessUniversalCheckout as HeadlessUniversalCheckout } from './HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
export type { IPrimerHeadlessUniversalCheckoutPaymentMethod as PaymentMethod } from './models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import PrimerHeadlessUniversalCheckoutAssetsManager from './HeadlessUniversalCheckout/Managers/AssetsManager';
export { PrimerHeadlessUniversalCheckoutAssetsManager as AssetsManager };
import PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/NativeUIManager';
export { PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager as NativeUIManager };
import PrimerHeadlessUniversalCheckoutRawDataManager from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
export { PrimerHeadlessUniversalCheckoutRawDataManager as RawDataManager };
export type { IPrimerVaultedPaymentMethod as VaultedPaymentMethod } from './models/PrimerVaultedPaymentMethod';

export type { IPrimerVaultedPaymentMethodAdditonalData as VaultedPaymentMethodAdditionalData } from './models/PrimerVaultedPaymentMethodAdditionalData';

export type { IPrimerValidationError as ValidationError } from './models/PrimerValidationError';

import PrimerHeadlessUniversalCheckoutVaultManager from './HeadlessUniversalCheckout/Managers/VaultManager';
export { PrimerHeadlessUniversalCheckoutVaultManager as VaultManager };
import {
  PrimerHeadlessUniversalCheckoutKlarnaManager,
  KlarnaComponent,
  KlarnaManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';

export { PrimerHeadlessUniversalCheckoutKlarnaManager as KlarnaManager };
export type { KlarnaComponent, KlarnaManagerProps };

import { NamedComponentStep } from './models/NamedComponentStep';
export type { NamedComponentStep };
import { KlarnaPaymentCategory } from './models/klarna/KlarnaPaymentCategory';
export type{ KlarnaPaymentCategory };
import {
  PrimerValidComponentData,
  PrimerValidatingComponentData,
  PrimerInvalidComponentData,
  PrimerComponentDataValidationError,
} from './models/PrimerComponentDataValidation';
export type {
  PrimerValidComponentData,
  PrimerValidatingComponentData,
  PrimerInvalidComponentData,
  PrimerComponentDataValidationError,
};
import {
  KlarnaPaymentOptions,
  KlarnaPaymentFinalization,
  KlarnaPaymentValidatableData,
} from './models/klarna/KlarnaPaymentCollectableData';
export type { KlarnaPaymentOptions, KlarnaPaymentFinalization, KlarnaPaymentValidatableData };
import {
  PaymentSessionCreated,
  PaymentSessionAuthorized,
  PaymentSessionFinalized,
  PaymentViewLoaded,
  KlarnaPaymentStep,
} from './models/klarna/KlarnaPaymentSteps';
export type {
  PaymentSessionCreated,
  PaymentSessionAuthorized,
  PaymentSessionFinalized,
  PaymentViewLoaded,
  KlarnaPaymentStep,
};
import { PrimerKlarnaPaymentView } from './HeadlessUniversalCheckout/Components/PrimerKlarnaPaymentView';
export { PrimerKlarnaPaymentView };
import { NativeResourceView } from './HeadlessUniversalCheckout/Components/NativeResourceView';
export { NativeResourceView };
import { PrimerGooglePayButtonConstants } from './HeadlessUniversalCheckout/Components/NativeResourceView';
export { PrimerGooglePayButtonConstants };
import { PrimerGooglePayButton } from './HeadlessUniversalCheckout/Components/PrimerGooglePayButton';
export { PrimerGooglePayButton };
import { UserDetailsRetrieved, UserDetailsCollected, AchStep } from './models/ach/AchSteps';
export type { UserDetailsRetrieved as CollectUserDetails, UserDetailsCollected, AchStep };
import { AchFirstName, AchLastName, AchEmailAddress, AchValidatableData } from './models/ach/AchCollectableData';
export type { AchFirstName, AchLastName, AchEmailAddress, AchValidatableData };
import {
  PrimerHeadlessUniversalCheckoutAchManager,
  StripeAchUserDetailsComponent,
  AchManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager';


import { PrimerHeadlessUniversalCheckoutAchMandateManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchMandateManager';
export { PrimerHeadlessUniversalCheckoutAchMandateManager as AchMandateManager };
export { PrimerHeadlessUniversalCheckoutAchManager as AchManager };
export type { StripeAchUserDetailsComponent, AchManagerProps };

import {
  PrimerHeadlessUniversalCheckoutComponentWithRedirectManager,
  BanksComponent,
  ComponentWithRedirectManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';
export { PrimerHeadlessUniversalCheckoutComponentWithRedirectManager as ComponentWithRedirectManager };
export type { BanksComponent, ComponentWithRedirectManagerProps };
import { IssuingBank } from './models/IssuingBank';
export type { IssuingBank };
import { BankId, BankListFilter, BanksValidatableData } from './models/banks/BanksCollectableData';
export type { BankId, BankListFilter, BanksValidatableData };
import { BanksLoading, BanksRetrieved, BanksStep } from './models/banks/BanksSteps';
export type { BanksLoading, BanksRetrieved, BanksStep };
import { NamedComponentValidatableData } from './models/NamedComponentValidatableData';
export type { NamedComponentValidatableData };

// must be exported in order to support the old architecture
const nativeModule = require("./specs/NativePrimer").default;
export default nativeModule;