import { useCallback, useMemo } from 'react';
import { usePrimerVault } from './usePrimerVault';
import type {
  UseVaultedPaymentMethodsReturn,
  VaultDisplayMode,
  VaultedPaymentMethodItem,
} from '../types/VaultedPaymentMethodTypes';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';

const CARD_PAYMENT_METHOD_TYPE = 'PAYMENT_CARD';

function titleCase(value: string): string {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function pad2(value: number | undefined): string | undefined {
  if (value == null) return undefined;
  return value < 10 ? `0${value}` : String(value);
}

function toVaultedItem(method: PrimerVaultedPaymentMethod, iconUri: string | undefined): VaultedPaymentMethodItem {
  const isCard = method.paymentMethodType === CARD_PAYMENT_METHOD_TYPE;
  const instrument = method.paymentInstrumentData;

  const last4Raw = instrument?.last4Digits ?? instrument?.accountNumberLast4Digits;
  const last4 = last4Raw != null ? String(last4Raw) : undefined;

  const yearRaw = instrument?.expirationYear;
  // Year field is typed as `number` (e.g. 2026) — display the last two digits for the card row.
  const expiryYear = yearRaw != null ? String(yearRaw).slice(-2) : undefined;

  return {
    id: method.id,
    paymentMethodType: method.paymentMethodType,
    paymentInstrumentType: method.paymentInstrumentType,
    cardholderName: isCard ? instrument?.cardholderName : undefined,
    last4,
    expiryMonth: isCard ? pad2(instrument?.expirationMonth) : undefined,
    expiryYear: isCard ? expiryYear : undefined,
    brandName: isCard && instrument?.network ? titleCase(instrument.network) : undefined,
    brandIconUri: iconUri,
    rawMethod: method,
  };
}

export function useVaultedPaymentMethods(): UseVaultedPaymentMethodsReturn {
  const {
    vaultedMethods: rawMethods,
    vaultedIconUrisById,
    isLoadingVaulted,
    vaultedError,
    payFromVault,
    activeVaultedMethodId,
    vaultDisplayOverride,
    selectVaultedMethodId,
    requestExpandedVaultDisplay,
    deleteVaultedPaymentMethod,
  } = usePrimerVault();

  const vaultedMethods = useMemo<VaultedPaymentMethodItem[]>(
    () => rawMethods.map((m) => toVaultedItem(m, vaultedIconUrisById[m.id])),
    [rawMethods, vaultedIconUrisById]
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

  const pay = useCallback(async () => {
    if (!activeMethod) return;
    await payFromVault(activeMethod.id);
  }, [activeMethod, payFromVault]);

  const payById = useCallback(
    async (id: string) => {
      await payFromVault(id);
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
    pay,
    payById,
    selectVaultedMethodId,
    requestExpandedVaultDisplay,
    deleteVaultedPaymentMethod,
  };
}
