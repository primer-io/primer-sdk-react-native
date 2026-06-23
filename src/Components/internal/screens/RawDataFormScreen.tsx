import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { CheckoutRoute } from '../navigation/types';
import { usePrimerLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerPaymentMethod } from '../../hooks/usePrimerPaymentMethod';
import { useBottomSafeArea } from './useBottomSafeArea';

import type { PrimerRawData } from '../../../models/PrimerRawData';

// Field keys are the SDK's input-element-type strings. NOTE the platform split for BLIK's
// one-time code: iOS reports 'OTP', Android reports 'OTP_CODE' — both are handled.
const FIELD_LABEL: Record<string, string> = {
  PHONE_NUMBER: 'Phone number',
  OTP: 'One-time code',
  OTP_CODE: 'One-time code',
  CARD_NUMBER: 'Card number',
  EXPIRY_DATE: 'Expiry date (MM/YY)',
  CARDHOLDER_NAME: 'Cardholder name',
};

const NUMERIC_FIELDS = new Set<string>(['PHONE_NUMBER', 'OTP', 'OTP_CODE', 'CARD_NUMBER', 'EXPIRY_DATE']);

type FieldValues = Record<string, string>;

// The present input keys tell us which raw-data model to build (single-field phone/OTP, or
// Bancontact card-fields). PrimerRawData is an open interface, so each shape is assignable.
function buildRawData(values: FieldValues): PrimerRawData {
  const otp = values.OTP ?? values.OTP_CODE;
  if (otp != null) {
    return { otp };
  }
  if (values.PHONE_NUMBER != null) {
    return { phoneNumber: values.PHONE_NUMBER };
  }
  return {
    cardNumber: values.CARD_NUMBER ?? '',
    expiryDate: values.EXPIRY_DATE ?? '',
    cardholderName: values.CARDHOLDER_NAME ?? '',
  };
}

/**
 * Prebuilt input form for non-card RAW_DATA methods — MBWay (phone), Bancontact (card-fields),
 * BLIK (one-time code). Renders exactly the fields the method reports (never the card form). On
 * submit the SDK tokenises; methods that redirect/poll are owned by the native flow. Dogfoods the
 * public `usePrimerPaymentMethod` API.
 */
export function RawDataFormScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { params } = useRoute<CheckoutRoute.rawDataForm>();
  const { pop, replace, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const bottomInset = useBottomSafeArea();

  const method = usePrimerPaymentMethod(params.paymentMethodType);
  const form = method.kind === 'rawDataForm' ? method : null;
  const start = form?.start;
  const [values, setValues] = useState<FieldValues>({});

  // Activate this method's raw-data manager on mount.
  useEffect(() => {
    void start?.();
  }, [start]);

  // Defensive: this screen is only routed to for raw-data form methods.
  if (!form) {
    return null;
  }

  const { requiredInputs, isValid, setData, submit } = form;

  const handleChange = (field: string, text: string) => {
    const next = { ...values, [field]: text };
    setValues(next);
    void setData(buildRawData(next)).catch(() => {});
  };

  const handleSubmit = () => {
    if (!isValid) return;
    // Jump to processing while tokenisation / any redirect runs; the outcome navigates away.
    replace(CheckoutRoute.processing);
    void submit();
  };

  return (
    <View style={styles.root}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        showBackButton={canGoBack}
        backLabel={t('primer_common_back')}
        onBackPress={pop}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {requiredInputs.map((field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{FIELD_LABEL[field] ?? field}</Text>
            <TextInput
              style={styles.input}
              value={values[field] ?? ''}
              onChangeText={(text) => handleChange(field, text)}
              keyboardType={NUMERIC_FIELDS.has(field) ? 'number-pad' : 'default'}
              autoCapitalize="none"
              accessibilityLabel={FIELD_LABEL[field] ?? field}
            />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, tokens.spacing.large) }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid}
          activeOpacity={0.7}
          style={[styles.payButton, !isValid && styles.payButtonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
        >
          <Text style={styles.payButtonText}>{t('primer_common_button_pay')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    field: {
      gap: spacing.xsmall,
    },
    footer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    input: {
      borderColor: colors.border,
      borderRadius: radii.medium,
      borderWidth: StyleSheet.hairlineWidth,
      color: colors.textPrimary,
      fontSize: typography.titleLarge.fontSize,
      minHeight: 48,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
    },
    label: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
    payButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
      minHeight: 44,
      padding: spacing.medium,
      width: '100%',
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      color: colors.background,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
