import { useCallback, useMemo } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import { classifyVault } from '../types/VaultedPaymentMethodTypes';
import { maskEmail } from '../internal/utils/formatting';
import { getCardNetworkDisplayName } from '../internal/cardNetworkDisplayName';
import type {
  UsePrimerVaultManagerReturn,
  VaultDisplayMode,
  VaultedPaymentMethodItem,
} from '../types/VaultedPaymentMethodTypes';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';
import type { PrimerVaultedPaymentMethodAdditionalData } from '../../models/PrimerVaultedPaymentMethodAdditionalData';

function pad2(value: number | undefined): string | undefined {
  if (value == null) return undefined;
  return value < 10 ? `0${value}` : String(value);
}

function parseVaultedMethod(
  method: PrimerVaultedPaymentMethod,
  iconUri: string | undefined,
  displayName: string | undefined
): VaultedPaymentMethodItem {
  const instrument = method.paymentInstrumentData;
  const base = {
    id: method.id,
    paymentMethodType: method.paymentMethodType,
    paymentInstrumentType: method.paymentInstrumentType,
    iconUri,
    displayName,
    rawMethod: method,
  };

  switch (classifyVault(method)) {
    case 'card': {
      const yearRaw = instrument?.expirationYear;
      return {
        ...base,
        kind: 'card',
        cardholderName: instrument?.cardholderName,
        last4: instrument?.last4Digits,
        expiryMonth: pad2(instrument?.expirationMonth),
        // Year field is typed as `number` (e.g. 2026) — display the last two digits.
        expiryYear: yearRaw != null ? String(yearRaw).slice(-2) : undefined,
        network: instrument?.network,
        brandName: getCardNetworkDisplayName(instrument?.network ?? instrument?.binData?.network),
      };
    }
    case 'bank':
      return {
        ...base,
        kind: 'bank',
        bankName: instrument?.bankName,
        accountLast4: instrument?.accountNumberLast4Digits,
      };
    case 'other': {
      const payer = instrument?.externalPayerInfo;
      const email = payer?.email ?? instrument?.sessionData?.billingAddress?.email;
      const holderName =
        [payer?.firstName, payer?.lastName].filter((part) => part != null && part.trim() !== '').join(' ') || undefined;
      return { ...base, kind: 'other', holderName, detail: email ? maskEmail(email) : undefined };
    }
  }
}

export function usePrimerVaultManager(): UsePrimerVaultManagerReturn {
  const {
    vaultedMethods: rawMethods,
    vaultedIconUrisById,
    vaultedNamesById,
    isLoadingVaulted,
    vaultedError,
    payFromVault,
    activeVaultedMethodId,
    vaultDisplayOverride,
    selectVaultedMethodId,
    requestExpandedVaultDisplay,
    deleteVaultedPaymentMethod,
    requiresVaultedCardCvv,
    cvvInputVisible,
  } = usePrimerCheckout();

  const vaultedMethods = useMemo<VaultedPaymentMethodItem[]>(
    () => rawMethods.map((m) => parseVaultedMethod(m, vaultedIconUrisById[m.id], vaultedNamesById[m.id])),
    [rawMethods, vaultedIconUrisById, vaultedNamesById]
  );

  const originalDefault = vaultedMethods[0] ?? null;

  const userPicked =
    activeVaultedMethodId != null ? (vaultedMethods.find((m) => m.id === activeVaultedMethodId) ?? null) : null;
  const activeMethod = userPicked ?? originalDefault;

  // Lite is shown once the shopper has made an explicit selection from the list,
  // and only while they haven't reverted via Show other ways to pay.
  // `activeVaultedMethodId` is null until the first selection happens, so the
  // "no interaction yet" path stays in expanded.
  const hasUserSelected = activeVaultedMethodId != null;
  const vaultDisplayMode: VaultDisplayMode =
    hasUserSelected && vaultDisplayOverride !== 'expanded' ? 'lite' : 'expanded';

  const pay = useCallback(
    async (additionalData?: PrimerVaultedPaymentMethodAdditionalData) => {
      if (!activeMethod) return;
      await payFromVault(activeMethod.id, additionalData);
    },
    [activeMethod, payFromVault]
  );

  const payById = useCallback(
    async (id: string, additionalData?: PrimerVaultedPaymentMethodAdditionalData) => {
      await payFromVault(id, additionalData);
    },
    [payFromVault]
  );

  return {
    vaultedMethods,
    primaryMethod: originalDefault,
    originalDefault,
    activeMethod,
    vaultDisplayMode,
    isLoading: isLoadingVaulted,
    error: vaultedError,
    requiresVaultedCardCvv,
    cvvInputVisible,
    pay,
    payById,
    selectVaultedMethodId,
    requestExpandedVaultDisplay,
    deleteVaultedPaymentMethod,
  };
}
