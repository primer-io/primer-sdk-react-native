import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { useLocalization } from './internal/localization';
import { useNavigation } from './internal/navigation/useNavigation';
import { CheckoutRoute } from './internal/navigation/types';
import { PrimerTextInput } from './inputs/PrimerTextInput';
import { CountrySelectorRow } from './inputs/CountrySelectorRow';
import { getCountryName } from './internal/countries';
import type { PrimerBillingAddressFormProps } from './types/BillingAddressFormTypes';

export function PrimerBillingAddressForm({
  billingForm,
  style,
  testID = 'primer-billing-address-form',
}: PrimerBillingAddressFormProps) {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { push } = useNavigation();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const handleCountryPress = useCallback(() => {
    push(CheckoutRoute.countrySelector, { selectedCountryCode: billingForm.countryCode || undefined });
  }, [push, billingForm.countryCode]);

  if (!billingForm.sectionVisible) return null;

  const { visibleFields } = billingForm;
  const showNameRow = visibleFields.firstName || visibleFields.lastName;
  const showPostalCityRow = visibleFields.postalCode || visibleFields.city;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {visibleFields.countryCode && (
        <CountrySelectorRow
          value={billingForm.countryCode}
          displayName={getCountryName(billingForm.countryCode)}
          label={t('primer_card_form_label_country')}
          placeholder={t('primer_card_form_placeholder_country_code')}
          onPress={handleCountryPress}
          testID={`${testID}-country`}
        />
      )}

      {showNameRow && (
        <View style={styles.row}>
          {visibleFields.firstName && (
            <View style={styles.halfField}>
              <PrimerTextInput
                value={billingForm.firstName}
                onChangeText={billingForm.updateFirstName}
                onBlur={() => billingForm.markFieldTouched('firstName')}
                autoComplete="name-given"
                autoCapitalize="words"
                label={t('primer_card_form_label_first_name')}
                placeholder={t('primer_card_form_placeholder_first_name')}
                error={billingForm.errors.firstName}
                returnKeyType="next"
                testID={`${testID}-first-name`}
              />
            </View>
          )}
          {visibleFields.lastName && (
            <View style={styles.halfField}>
              <PrimerTextInput
                value={billingForm.lastName}
                onChangeText={billingForm.updateLastName}
                onBlur={() => billingForm.markFieldTouched('lastName')}
                autoComplete="name-family"
                autoCapitalize="words"
                label={t('primer_card_form_label_last_name')}
                placeholder={t('primer_card_form_placeholder_last_name')}
                error={billingForm.errors.lastName}
                returnKeyType="next"
                testID={`${testID}-last-name`}
              />
            </View>
          )}
        </View>
      )}

      {visibleFields.addressLine1 && (
        <PrimerTextInput
          value={billingForm.addressLine1}
          onChangeText={billingForm.updateAddressLine1}
          onBlur={() => billingForm.markFieldTouched('addressLine1')}
          autoComplete="street-address"
          autoCapitalize="words"
          label={t('primer_card_form_label_address1')}
          placeholder={t('primer_card_form_placeholder_address1')}
          error={billingForm.errors.addressLine1}
          returnKeyType="next"
          testID={`${testID}-address-line-1`}
        />
      )}

      {visibleFields.addressLine2 && (
        <PrimerTextInput
          value={billingForm.addressLine2}
          onChangeText={billingForm.updateAddressLine2}
          onBlur={() => billingForm.markFieldTouched('addressLine2')}
          autoCapitalize="words"
          label={t('primer_card_form_label_address2')}
          placeholder={t('primer_card_form_placeholder_address2')}
          error={billingForm.errors.addressLine2}
          returnKeyType="next"
          testID={`${testID}-address-line-2`}
        />
      )}

      {showPostalCityRow && (
        <View style={styles.row}>
          {visibleFields.postalCode && (
            <View style={styles.halfField}>
              <PrimerTextInput
                value={billingForm.postalCode}
                onChangeText={billingForm.updatePostalCode}
                onBlur={() => billingForm.markFieldTouched('postalCode')}
                autoComplete="postal-code"
                autoCapitalize="characters"
                label={t('primer_card_form_label_postal')}
                placeholder={t('primer_card_form_placeholder_postal')}
                error={billingForm.errors.postalCode}
                returnKeyType="next"
                testID={`${testID}-postal-code`}
              />
            </View>
          )}
          {visibleFields.city && (
            <View style={styles.halfField}>
              <PrimerTextInput
                value={billingForm.city}
                onChangeText={billingForm.updateCity}
                onBlur={() => billingForm.markFieldTouched('city')}
                autoCapitalize="words"
                label={t('primer_card_form_label_city')}
                placeholder={t('primer_card_form_placeholder_city')}
                error={billingForm.errors.city}
                returnKeyType="next"
                testID={`${testID}-city`}
              />
            </View>
          )}
        </View>
      )}

      {visibleFields.state && (
        <PrimerTextInput
          value={billingForm.state}
          onChangeText={billingForm.updateState}
          onBlur={() => billingForm.markFieldTouched('state')}
          autoCapitalize="words"
          label={t('primer_card_form_label_state')}
          placeholder={t('primer_card_form_placeholder_state')}
          error={billingForm.errors.state}
          returnKeyType="done"
          testID={`${testID}-state`}
        />
      )}
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    container: {
      gap: spacing.medium,
      width: '100%',
    },
    halfField: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.medium,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
