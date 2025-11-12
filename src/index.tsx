// ========================================
// DropIn / Universal Checkout
// ========================================
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

// ========================================
// Components API (React-idiomatic)
// ========================================

// Provider
export { PrimerCheckoutProvider } from './Components/PrimerCheckoutProvider';

// Components
export { CardForm } from './Components/CardForm';

// Hooks
export { useCardForm, usePrimerCheckout } from './Components/hooks';

// Types
export type {
  PrimerCheckoutProviderProps,
  PrimerCheckoutContextValue,
} from './models/components/PrimerCheckoutProviderTypes';

export type {
  UseCardFormOptions,
  UseCardFormReturn,
  CardFormProps,
  CardFormErrors,
  CardFormTheme,
  CardMetadata,
  CardFormField,
  CardFormState,
} from './models/components/CardFormTypes';

// ========================================
// Headless Universal Checkout
// ========================================
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
// Headless Checkout Core
export { PrimerHeadlessUniversalCheckout as HeadlessUniversalCheckout } from './HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
export type { IPrimerHeadlessUniversalCheckoutPaymentMethod as PaymentMethod } from './models/PrimerHeadlessUniversalCheckoutPaymentMethod';
export { default as AssetsManager } from './HeadlessUniversalCheckout/Managers/AssetsManager';
export { default as NativeUIManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/NativeUIManager';
export { default as RawDataManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
export type { IPrimerVaultedPaymentMethod as VaultedPaymentMethod } from './models/PrimerVaultedPaymentMethod';

export type { IPrimerVaultedPaymentMethodAdditonalData as VaultedPaymentMethodAdditionalData } from './models/PrimerVaultedPaymentMethodAdditionalData';

export type { IPrimerValidationError as ValidationError } from './models/PrimerValidationError';

export { default as VaultManager } from './HeadlessUniversalCheckout/Managers/VaultManager';
export { PrimerHeadlessUniversalCheckoutKlarnaManager as KlarnaManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';
export type {
  KlarnaComponent,
  KlarnaManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';
export type { NamedComponentStep } from './models/NamedComponentStep';
export type { KlarnaPaymentCategory } from './models/klarna/KlarnaPaymentCategory';
export type {
  PrimerValidComponentData,
  PrimerValidatingComponentData,
  PrimerInvalidComponentData,
  PrimerComponentDataValidationError,
} from './models/PrimerComponentDataValidation';
export type {
  KlarnaPaymentOptions,
  KlarnaPaymentFinalization,
  KlarnaPaymentValidatableData,
} from './models/klarna/KlarnaPaymentCollectableData';
import type {
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
import type { UserDetailsRetrieved, UserDetailsCollected, AchStep } from './models/ach/AchSteps';
export type { UserDetailsRetrieved as CollectUserDetails, UserDetailsCollected, AchStep };
import type { AchFirstName, AchLastName, AchEmailAddress, AchValidatableData } from './models/ach/AchCollectableData';
export type { AchFirstName, AchLastName, AchEmailAddress, AchValidatableData };
import { PrimerHeadlessUniversalCheckoutAchManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager';
import type {
  StripeAchUserDetailsComponent,
  AchManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager';

import { PrimerHeadlessUniversalCheckoutAchMandateManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchMandateManager';
export { PrimerHeadlessUniversalCheckoutAchMandateManager as AchMandateManager };
export { PrimerHeadlessUniversalCheckoutAchManager as AchManager };
export type { StripeAchUserDetailsComponent, AchManagerProps };

import { PrimerHeadlessUniversalCheckoutComponentWithRedirectManager } from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';
import type {
  BanksComponent,
  ComponentWithRedirectManagerProps,
} from './HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';
export { PrimerHeadlessUniversalCheckoutComponentWithRedirectManager as ComponentWithRedirectManager };
export type { BanksComponent, ComponentWithRedirectManagerProps };
import type { IssuingBank } from './models/IssuingBank';
export type { IssuingBank };
import type { BankId, BankListFilter, BanksValidatableData } from './models/banks/BanksCollectableData';
export type { BankId, BankListFilter, BanksValidatableData };
import type { BanksLoading, BanksRetrieved, BanksStep } from './models/banks/BanksSteps';
export type { BanksLoading, BanksRetrieved, BanksStep };
import type { NamedComponentValidatableData } from './models/NamedComponentValidatableData';
export type { NamedComponentValidatableData };

// must be exported in order to support the old architecture
const nativeModule = require('./specs/NativePrimer').default;
export default nativeModule;
