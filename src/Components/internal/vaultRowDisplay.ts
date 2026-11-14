import type { ImageSourcePropType } from 'react-native';

import type { VaultedPaymentMethodItem } from '../types/VaultedPaymentMethodTypes';
import type { TranslationParams } from './localization/types';
import { getSavedMethodName, IDEAL_TYPE_SUFFIX } from './savedMethodName';

const PAYPAL_PAYMENT_METHOD_TYPE = 'PAYPAL';
const PAYPAL_NAME = 'PayPal';
const KLARNA_PAYMENT_METHOD_TYPE = 'KLARNA';

const paypalIcon = require('../../assets/images/ic-brand-paypal.png');
const klarnaIcon = require('../../assets/images/ic-brand-klarna.png');
const idealIcon = require('../../assets/images/ic-brand-ideal.png');
const paymentCardIcon = require('../../assets/images/ic-brand-payment-card.png');

type Translate = (key: string, params?: TranslationParams) => string;

export interface VaultRowDisplay {
  title: string | null;
  secondaryLabel: string | null;
  icon?: ImageSourcePropType;
  maskedNumber: string | null;
  expiryText: string | null;
  accessibilityLabel: string;
}

// One place both renderers derive row strings from — neither re-inspects paymentMethodType.
export function getVaultRowDisplay(item: VaultedPaymentMethodItem, t: Translate): VaultRowDisplay {
  const nativeIcon = item.iconUri != null ? { uri: item.iconUri } : undefined;

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
        icon: item.brandName != null ? nativeIcon : paymentCardIcon,
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
        icon: nativeIcon,
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
        icon: getBundledOtherIcon(item.paymentMethodType) ?? nativeIcon,
        maskedNumber: item.detail ?? null,
        expiryText: null,
        accessibilityLabel: t('accessibility_vaulted_payment_method', { paymentMethodName: name }),
      };
    }
  }
}

function getBundledOtherIcon(paymentMethodType: string): ImageSourcePropType | undefined {
  if (paymentMethodType === PAYPAL_PAYMENT_METHOD_TYPE) return paypalIcon;
  if (paymentMethodType === KLARNA_PAYMENT_METHOD_TYPE) return klarnaIcon;
  if (paymentMethodType.endsWith(IDEAL_TYPE_SUFFIX)) return idealIcon;
  return undefined;
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
