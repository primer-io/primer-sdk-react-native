import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { CheckoutRoute } from '../navigation/types';
import { usePrimerLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerPaymentMethod } from '../../hooks/usePrimerPaymentMethod';
import { PrimerTextInput } from '../../inputs/PrimerTextInput';
import { CheckoutButton } from '../ui/CheckoutButton';
import { useBottomSafeArea } from './useBottomSafeArea';
import { buildRawData } from './buildRawData';

// Field keys are the SDK's input-element-type strings. NOTE the platform split for BLIK's
// one-time code: iOS reports 'OTP', Android reports 'OTP_CODE' — both are handled.
const FIELD_LABEL_KEY: Record<string, string> = {
  PHONE_NUMBER: 'primer_card_form_label_phone',
  OTP: 'primer_card_form_label_otp',
  OTP_CODE: 'primer_card_form_label_otp',
  CARD_NUMBER: 'primer_card_form_label_number',
  EXPIRY_DATE: 'primer_card_form_label_expiry',
  CARDHOLDER_NAME: 'primer_card_form_label_name',
};

const NUMERIC_FIELDS = new Set<string>(['PHONE_NUMBER', 'OTP', 'OTP_CODE', 'CARD_NUMBER', 'EXPIRY_DATE']);

// Autofill hints and capitalisation, per field. `autoComplete` drives Android, `textContentType`
// drives iOS, and only the cardholder name wants capitalisation.
type FieldInputProps = Pick<TextInputProps, 'autoComplete' | 'textContentType' | 'autoCapitalize'>;

const FIELD_INPUT_PROPS: Record<string, FieldInputProps> = {
  PHONE_NUMBER: { autoComplete: 'tel', textContentType: 'telephoneNumber' },
  OTP: { autoComplete: 'one-time-code', textContentType: 'oneTimeCode' },
  OTP_CODE: { autoComplete: 'one-time-code', textContentType: 'oneTimeCode' },
  CARD_NUMBER: { autoComplete: 'cc-number', textContentType: 'creditCardNumber' },
  EXPIRY_DATE: { autoComplete: 'cc-exp', textContentType: 'creditCardExpiration' },
  CARDHOLDER_NAME: { autoComplete: 'cc-name', textContentType: 'creditCardName', autoCapitalize: 'words' },
};

type FieldValues = Record<string, string>;

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
    void setData(buildRawData(params.paymentMethodType, next)).catch(() => {});
  };

  const handleSubmit = () => {
    if (!isValid) return;
    // Jump to processing while tokenisation / any redirect runs; the outcome navigates away.
    replace(CheckoutRoute.processing);
    void submit().catch(() => {});
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
        {requiredInputs.map((field) => {
          const labelKey = FIELD_LABEL_KEY[field];
          const label = labelKey ? t(labelKey) : field;
          return (
            <PrimerTextInput
              key={field}
              label={label}
              value={values[field] ?? ''}
              onChangeText={(text) => handleChange(field, text)}
              keyboardType={
                field === 'PHONE_NUMBER' ? 'phone-pad' : NUMERIC_FIELDS.has(field) ? 'number-pad' : 'default'
              }
              autoCapitalize="none"
              {...FIELD_INPUT_PROPS[field]}
            />
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, tokens.spacing.large) }]}>
        <CheckoutButton
          title={t('primer_common_button_pay')}
          onPress={handleSubmit}
          variant="primary"
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    footer: {
      backgroundColor: colors.backgroundPrimary,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
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
