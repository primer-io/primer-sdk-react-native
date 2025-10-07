import { NativeModules } from 'react-native';
import type { PrimerValidationError as ValidationError } from '../../models/PrimerValidationError';
import type { PrimerVaultedPaymentMethod as VaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';
import type { PrimerVaultedPaymentMethodAdditionalData as VaultedPaymentMethodAdditionalData } from '../../models/PrimerVaultedPaymentMethodAdditionalData';
import type { PrimerVaultedPaymentMethodResult } from '../../models/PrimerVaultedPaymentMethodResult';
import type { PrimerValidationErrorResult } from '../../models/PrimerValidationErrorResult';

const { RNPrimerHeadlessUniversalCheckoutVaultManager } = NativeModules;

class PrimerHeadlessUniversalCheckoutVaultManager {
  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {}

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////

  async configure(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await RNPrimerHeadlessUniversalCheckoutVaultManager.configure();
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  async fetchVaultedPaymentMethods(): Promise<VaultedPaymentMethod[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const data: PrimerVaultedPaymentMethodResult =
          await RNPrimerHeadlessUniversalCheckoutVaultManager.fetchVaultedPaymentMethods();
        const paymentMethods: VaultedPaymentMethod[] = data.paymentMethods;
        const mappedPaymentMethods = sanitizePaymentMethods(paymentMethods);
        resolve(mappedPaymentMethods);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  async deleteVaultedPaymentMethod(vaultedPaymentMethodId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await RNPrimerHeadlessUniversalCheckoutVaultManager.deleteVaultedPaymentMethod(vaultedPaymentMethodId);
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  async validate(
    vaultedPaymentMethodId: string,
    additionalData: VaultedPaymentMethodAdditionalData
  ): Promise<ValidationError[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const data: PrimerValidationErrorResult = await RNPrimerHeadlessUniversalCheckoutVaultManager.validate(
          vaultedPaymentMethodId,
          JSON.stringify(additionalData)
        );
        const errors: ValidationError[] = data.validationErrors;
        resolve(errors);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  async startPaymentFlow(
    vaultedPaymentMethodId: string,
    additionalData?: VaultedPaymentMethodAdditionalData
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (additionalData) {
          await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlowWithAdditionalData(
            vaultedPaymentMethodId,
            JSON.stringify(additionalData)
          );
        } else {
          await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlow(vaultedPaymentMethodId);
        }
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
}

// Convert accountNumberLastFourDigits to accountNumberLast4Digits when present
// Overcomes an iOS limitation of toJsonObject()
function sanitizePaymentMethods(paymentMethods: VaultedPaymentMethod[]): VaultedPaymentMethod[] {
  return paymentMethods.map((method) => {
    const unwrappedInstrumentData = method.paymentInstrumentData as any;
    if (unwrappedInstrumentData?.accountNumberLastFourDigits !== undefined) {
      const { accountNumberLastFourDigits, ...rest } = unwrappedInstrumentData;
      return {
        ...method,
        paymentInstrumentData: {
          ...rest,
          accountNumberLast4Digits: accountNumberLastFourDigits,
        },
      };
    }
    return method;
  });
}

export default PrimerHeadlessUniversalCheckoutVaultManager;
