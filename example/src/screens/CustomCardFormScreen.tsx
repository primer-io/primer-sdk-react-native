import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PrimerCheckoutProvider,
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
  CardholderNameInput,
  PrimerTextInput,
} from '@primer-io/react-native';
import type {
  PrimerSettings,
  PrimerTextInputTheme,
} from '@primer-io/react-native';
import {appPaymentParameters} from '../models/IClientSessionRequestBody';
import {customAppearanceMode} from './SettingsScreen';
import {getPaymentHandlingStringVal} from '../network/Environment';
import {STRIPE_ACH_PUBLISHABLE_KEY} from '../Keys';

const THEMES: {label: string; theme?: PrimerTextInputTheme; bg?: string}[] = [
  {label: 'Default'},
  {
    label: 'Purple',
    theme: {
      primaryColor: '#6200EE',
      errorColor: '#B00020',
      borderColor: '#D1C4E9',
      backgroundColor: '#F3E5F5',
      textColor: '#311B92',
      placeholderColor: '#9575CD',
      borderRadius: 12,
      fieldHeight: 52,
      fontSize: 18,
      labelFontSize: 14,
    },
    bg: '#EDE7F6',
  },
  {
    label: 'Dark',
    theme: {
      primaryColor: '#BB86FC',
      errorColor: '#CF6679',
      borderColor: '#444444',
      backgroundColor: '#2C2C2C',
      textColor: '#E0E0E0',
      placeholderColor: '#888888',
      borderRadius: 8,
      fontSize: 15,
      focusedBorderWidth: 3,
    },
    bg: '#1E1E1E',
  },
  {
    label: 'Green',
    theme: {
      primaryColor: '#00C853',
      errorColor: '#FF5252',
      borderColor: '#A5D6A7',
      backgroundColor: '#E8F5E9',
      textColor: '#1B5E20',
      placeholderColor: '#66BB6A',
      borderRadius: 6,
      fontSize: 14,
      labelFontSize: 10,
      borderWidth: 2,
    },
    bg: '#F1F8E9',
  },
];

function ThemePicker({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <View style={pickerStyles.row}>
      {THEMES.map((t, i) => (
        <TouchableOpacity
          key={t.label}
          style={[pickerStyles.chip, selected === i && pickerStyles.chipActive]}
          onPress={() => onSelect(i)}>
          <Text
            style={[
              pickerStyles.chipText,
              selected === i && pickerStyles.chipTextActive,
            ]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CardForm() {
  const cardForm = useCardForm({collectCardholderName: true});
  const [themeIndex, setThemeIndex] = useState(0);
  const [disabledPreview, setDisabledPreview] = useState(false);
  const current = THEMES[themeIndex]!;
  const theme = current.theme;
  const bg = current.bg ?? '#f5f5f5';
  const titleColor = theme?.textColor ?? '#212121';
  const labelColor = theme?.placeholderColor ?? '#757575';
  const metaColor = theme?.placeholderColor ?? '#666';

  return (
    <ScrollView
      style={[formStyles.container, {backgroundColor: bg}]}
      contentContainerStyle={formStyles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={[formStyles.title, {color: titleColor}]}>Card Payment</Text>

      <Text style={[formStyles.sectionLabel, {color: labelColor}]}>Theme</Text>
      <ThemePicker selected={themeIndex} onSelect={setThemeIndex} />

      <View style={formStyles.fields}>
        <CardNumberInput
          cardForm={cardForm}
          theme={theme}
          testID="card-number"
        />
        <View style={formStyles.row}>
          <View style={formStyles.half}>
            <ExpiryDateInput
              cardForm={cardForm}
              theme={theme}
              testID="expiry-date"
            />
          </View>
          <View style={formStyles.half}>
            <CVVInput cardForm={cardForm} theme={theme} testID="cvv" />
          </View>
        </View>
        <CardholderNameInput
          cardForm={cardForm}
          theme={theme}
          testID="cardholder-name"
        />
      </View>

      <TouchableOpacity
        style={[
          formStyles.button,
          {backgroundColor: theme?.primaryColor ?? '#2f98ff'},
          theme?.borderRadius != null
            ? {borderRadius: theme.borderRadius}
            : undefined,
          (!cardForm.isValid || cardForm.isSubmitting) &&
            formStyles.buttonDisabled,
        ]}
        onPress={() => cardForm.submit()}
        disabled={!cardForm.isValid || cardForm.isSubmitting}>
        {cardForm.isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={formStyles.buttonText}>Pay</Text>
        )}
      </TouchableOpacity>

      {cardForm.binData?.preferred && (
        <Text style={[formStyles.meta, {color: metaColor}]}>
          Network: {cardForm.binData.preferred.displayName}
        </Text>
      )}

      <View style={formStyles.separator} />
      <Text style={[formStyles.sectionLabel, {color: labelColor}]}>
        Disabled State
      </Text>
      <TouchableOpacity
        style={[
          pickerStyles.chip,
          disabledPreview && pickerStyles.chipActive,
          {alignSelf: 'flex-start', marginBottom: 12},
        ]}
        onPress={() => setDisabledPreview(d => !d)}>
        <Text
          style={[
            pickerStyles.chipText,
            disabledPreview && pickerStyles.chipTextActive,
          ]}>
          {disabledPreview ? 'Enabled' : 'Disabled'}
        </Text>
      </TouchableOpacity>
      <PrimerTextInput
        value="4242 4242 4242 4242"
        onChangeText={() => {}}
        label="Card number"
        editable={!disabledPreview}
        theme={theme}
        testID="disabled-preview"
      />
    </ScrollView>
  );
}

export function CustomCardFormScreen({route}: {route: any}) {
  const clientToken = route.params?.clientToken as string;

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(
      appPaymentParameters.paymentHandling,
    ),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io',
      },
      stripeOptions: {
        publishableKey: STRIPE_ACH_PUBLISHABLE_KEY,
        mandateData: {
          merchantName: 'My Merchant Name',
        },
      },
    },
    uiOptions: {
      appearanceMode: customAppearanceMode,
    },
    debugOptions: {
      is3DSSanityCheckEnabled: false,
    },
    clientSessionCachingEnabled: true,
    apiVersion: '2.4',
  };

  if (appPaymentParameters.merchantName) {
    settings.paymentMethodOptions!.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName,
    };
  }

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      onCheckoutComplete={checkoutData => {
        console.log('Checkout complete:', checkoutData);
        Alert.alert('Success', 'Payment completed');
      }}
      onError={error => {
        console.error('Checkout error:', error);
        Alert.alert('Error', error.errorId ?? 'Unknown error');
      }}>
      <CardForm />
    </PrimerCheckoutProvider>
  );
}

const pickerStyles = StyleSheet.create({
  chip: {
    borderColor: '#e0e0e0',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#2f98ff',
    borderColor: '#2f98ff',
  },
  chipText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});

const formStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2f98ff',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  fields: {
    gap: 12,
  },
  half: {
    flex: 1,
  },
  meta: {
    color: '#666',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionLabel: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  separator: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginVertical: 24,
  },
  title: {
    color: '#212121',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
