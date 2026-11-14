import type { VaultedPaymentMethodItem } from '../types/VaultedPaymentMethodTypes';
import type { TranslationParams } from './localization/types';
import { getSavedMethodName } from './savedMethodName';

const PAYPAL_PAYMENT_METHOD_TYPE = 'PAYPAL';
const PAYPAL_NAME = 'PayPal';

type Translate = (key: string, params?: TranslationParams) => string;

export interface VaultRowDisplay {
  title: string | null;
  secondaryLabel: string | null;
  iconUri?: string;
  maskedNumber: string | null;
  expiryText: string | null;
  accessibilityLabel: string;
}

// One place both renderers derive row strings from — neither re-inspects paymentMethodType.
export function getVaultRowDisplay(item: VaultedPaymentMethodItem, t: Translate): VaultRowDisplay {
  const iconUri = item.iconUri;

  switch (item.kind) {
    case 'card': {
      const maskedNumber = item.last4 != null ? t('primer_vault_format_masked', { last4: item.last4 }) : null;
      const expiryText =
        item.expiryMonth != null && item.expiryYear != null
          ? t('primer_vault_format_expires', { month: item.expiryMonth, year: item.expiryYear })
          : null;
      return {
        title: item.cardholderName ?? null,
        secondaryLabel: item.brandName ?? t('primer_vault_default_card'),
        iconUri,
        maskedNumber,
        expiryText,
        accessibilityLabel: buildCardAccessibilityLabel(item, t, expiryText),
      };
    }
    case 'bank': {
      const bankName = item.bankName ?? item.displayName ?? t('primer_vault_default_bank');
      const maskedNumber =
        item.accountLast4 != null ? t('primer_vault_format_masked', { last4: item.accountLast4 }) : null;
      return {
        title: bankName,
        secondaryLabel: t('primer_vault_default_bank'),
        iconUri,
        maskedNumber,
        expiryText: null,
        accessibilityLabel:
          item.accountLast4 != null
            ? t('accessibility_vaulted_ach_full', { bankName, last4: item.accountLast4 })
            : t('accessibility_vaulted_ach', { bankName }),
      };
    }
    case 'other': {
      const name = getSavedMethodName(item.paymentMethodType, item.displayName);
      return {
        title: item.holderName ?? null,
        secondaryLabel: item.paymentMethodType === PAYPAL_PAYMENT_METHOD_TYPE ? PAYPAL_NAME : name,
        iconUri,
        maskedNumber: item.detail ?? null,
        expiryText: null,
        accessibilityLabel: t('accessibility_vaulted_payment_method', { paymentMethodName: name }),
      };
    }
  }
}

function buildCardAccessibilityLabel(
  item: Extract<VaultedPaymentMethodItem, { kind: 'card' }>,
  t: Translate,
  expiryText: string | null
): string {
  const cardNetwork = item.brandName ?? t('primer_vault_default_card');
  if (item.last4 != null && expiryText != null) {
    return item.cardholderName != null
      ? t('accessibility_vaulted_card_full', {
          cardNetwork,
          last4: item.last4,
          expiry: expiryText,
          cardholderName: item.cardholderName,
        })
      : t('accessibility_vaulted_card_no_name', {
          cardNetwork,
          last4: item.last4,
          expiry: expiryText,
        });
  }
  return t('accessibility_vaulted_payment_method', { paymentMethodName: cardNetwork });
}
