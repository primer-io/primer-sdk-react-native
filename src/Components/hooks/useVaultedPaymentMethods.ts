import { useCallback, useMemo } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { UseVaultedPaymentMethodsReturn, VaultedPaymentMethodItem } from '../types/VaultedPaymentMethodTypes';
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
  } = usePrimerCheckout();

  const vaultedMethods = useMemo<VaultedPaymentMethodItem[]>(
    () => rawMethods.map((m) => toVaultedItem(m, vaultedIconUrisById[m.id])),
    [rawMethods, vaultedIconUrisById]
  );

  const primaryMethod = vaultedMethods[0] ?? null;

  const pay = useCallback(async () => {
    if (!primaryMethod) return;
    await payFromVault(primaryMethod.id);
  }, [primaryMethod, payFromVault]);

  const payById = useCallback(
    async (id: string) => {
      await payFromVault(id);
    },
    [payFromVault]
  );

  return {
    vaultedMethods,
    primaryMethod,
    isLoading: isLoadingVaulted,
    error: vaultedError,
    pay,
    payById,
  };
}
