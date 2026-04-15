import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle } from 'react-native';

import {
  CheckoutRoute,
  CheckoutSheet,
  NavigationContainer,
  NavigationHeader,
  NavigationProvider,
  useNavigation,
  useRoute,
  useSheetHeight,
  useTheme,
} from '@primer-io/react-native';

// --- Sample Screens ---

function MethodSelectionScreen() {
  const demoStyles = useDemoStyles();
  const { push } = useNavigation();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader title="Select Method" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>Choose a payment method</Text>
        <DemoButton
          title="Pay with Card"
          onPress={() =>
            push(CheckoutRoute.cardForm, { paymentMethodType: 'PAYMENT_CARD' })
          }
        />
        <DemoButton
          title="Vaulted Methods"
          onPress={() => push(CheckoutRoute.vaultedMethods)}
        />
        <DemoButton
          title="Select Country"
          onPress={() =>
            push(CheckoutRoute.countrySelector, { selectedCountryCode: 'US' })
          }
        />
      </View>
    </View>
  );
}

function CardFormScreen() {
  const demoStyles = useDemoStyles();
  const { push } = useNavigation();
  const { params } = useRoute<CheckoutRoute.cardForm>();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader showBackButton backLabel="Back" title="Card Details" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>
          Payment method: {params.paymentMethodType}
        </Text>
        <DemoButton
          title="Submit Payment"
          onPress={() => push(CheckoutRoute.processing)}
        />
      </View>
    </View>
  );
}

function ProcessingScreen() {
  const demoStyles = useDemoStyles();
  const { replace } = useNavigation();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader title="Processing" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>Processing payment...</Text>
        <DemoButton
          title="Simulate Success"
          onPress={() =>
            replace(CheckoutRoute.success, {
              checkoutData: { payment: { orderId: '12345' } },
            })
          }
        />
        <DemoButton
          title="Simulate Error"
          onPress={() =>
            replace(CheckoutRoute.error, {
              error: {
                errorId: 'test-error',
                description: 'Payment declined',
              } as any,
            })
          }
        />
      </View>
    </View>
  );
}

function SuccessScreen() {
  const demoStyles = useDemoStyles();
  const { popToRoot } = useNavigation();
  const { params } = useRoute<CheckoutRoute.success>();
  const { setHeightRatio } = useSheetHeight();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader title="Success" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.title}>Payment Successful!</Text>
        <Text style={demoStyles.description}>
          {JSON.stringify(params.checkoutData)}
        </Text>
        <DemoButton title="Shrink Sheet (50%)" onPress={() => setHeightRatio(0.5)} />
        <DemoButton title="Expand Sheet (92%)" onPress={() => setHeightRatio(0.92)} />
        <DemoButton title="Back to Start" onPress={popToRoot} />
      </View>
    </View>
  );
}

function ErrorScreen() {
  const demoStyles = useDemoStyles();
  const { popToRoot } = useNavigation();
  const { params } = useRoute<CheckoutRoute.error>();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader title="Error" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.title}>Payment Failed</Text>
        <Text style={demoStyles.description}>{params.error.description}</Text>
        <DemoButton title="Try Again" onPress={popToRoot} />
      </View>
    </View>
  );
}

function VaultedMethodsScreen() {
  const demoStyles = useDemoStyles();
  const { push } = useNavigation();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader
        showBackButton
        backLabel="Back"
        title="Saved Cards"
        rightAction={{ label: 'Edit', onPress: () => {} }}
      />
      <View style={demoStyles.content}>
        <DemoButton
          title="Visa •••• 4242 → Recapture CVV"
          onPress={() =>
            push(CheckoutRoute.cvvRecapture, {
              paymentMethodId: 'pm_123',
              last4: '4242',
            })
          }
        />
        <DemoButton
          title="Delete Visa •••• 4242"
          onPress={() =>
            push(CheckoutRoute.deleteConfirmation, {
              paymentMethodId: 'pm_123',
            })
          }
        />
      </View>
    </View>
  );
}

function CountrySelectorScreen() {
  const demoStyles = useDemoStyles();
  const { params } = useRoute<CheckoutRoute.countrySelector>();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader
        showBackButton
        backLabel="Back"
        title="Select Country"
      />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>
          Current: {params.selectedCountryCode ?? 'None'}
        </Text>
        <Text style={demoStyles.description}>🇺🇸 United States</Text>
        <Text style={demoStyles.description}>🇬🇧 United Kingdom</Text>
        <Text style={demoStyles.description}>🇩🇪 Germany</Text>
      </View>
    </View>
  );
}

function CvvRecaptureScreen() {
  const demoStyles = useDemoStyles();
  const { params } = useRoute<CheckoutRoute.cvvRecapture>();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader showBackButton backLabel="Back" title="Re-enter CVV" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>
          Card ending in {params.last4}
        </Text>
        <Text style={demoStyles.description}>
          Method ID: {params.paymentMethodId}
        </Text>
      </View>
    </View>
  );
}

function DeleteConfirmationScreen() {
  const demoStyles = useDemoStyles();
  const { pop } = useNavigation();
  const { params } = useRoute<CheckoutRoute.deleteConfirmation>();

  return (
    <View style={demoStyles.screen}>
      <NavigationHeader
        showBackButton
        backLabel="Back"
        title="Confirm Delete"
      />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>
          Delete payment method {params.paymentMethodId}?
        </Text>
        <DemoButton title="Cancel" onPress={pop} />
      </View>
    </View>
  );
}

function PlaceholderScreen() {
  const demoStyles = useDemoStyles();
  return (
    <View style={demoStyles.screen}>
      <NavigationHeader title="Placeholder" />
      <View style={demoStyles.content}>
        <Text style={demoStyles.description}>Placeholder screen</Text>
      </View>
    </View>
  );
}

// --- Screen Map ---

const screenMap: Partial<Record<CheckoutRoute, React.ComponentType>> = {
  [CheckoutRoute.methodSelection]: MethodSelectionScreen,
  [CheckoutRoute.cardForm]: CardFormScreen,
  [CheckoutRoute.processing]: ProcessingScreen,
  [CheckoutRoute.success]: SuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
  [CheckoutRoute.vaultedMethods]: VaultedMethodsScreen,
  [CheckoutRoute.countrySelector]: CountrySelectorScreen,
  [CheckoutRoute.cvvRecapture]: CvvRecaptureScreen,
  [CheckoutRoute.deleteConfirmation]: DeleteConfirmationScreen,
  [CheckoutRoute.splash]: PlaceholderScreen,
  [CheckoutRoute.loading]: PlaceholderScreen,
};

// --- Demo Button ---

function DemoButton({ title, onPress }: { title: string; onPress: () => void }) {
  const demoStyles = useDemoStyles();
  return (
    <TouchableOpacity style={demoStyles.button} onPress={onPress}>
      <Text style={demoStyles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

// --- Modal Wrapper (used from SettingsScreen) ---

export function NavigationDemoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <CheckoutSheet
      visible={visible}
      onRequestDismiss={onClose}
      onDismiss={onClose}
    >
      <NavigationProvider initialRoute={CheckoutRoute.methodSelection}>
        <NavigationContainer screenMap={screenMap} />
      </NavigationProvider>
    </CheckoutSheet>
  );
}

// --- Styles ---

function useDemoStyles() {
  const tokens = useTheme();
  return useMemo(() => {
    const { colors, spacing, typography, radii } = tokens;
    return StyleSheet.create({
      button: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radii.medium,
        height: 48,
        justifyContent: 'center',
        marginVertical: spacing.xsmall + spacing.xxsmall,
      },
      buttonText: {
        color: colors.background,
        fontFamily: typography.titleLarge.fontFamily,
        fontSize: typography.titleLarge.fontSize,
        fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      },
      content: {
        flex: 1,
        paddingHorizontal: spacing.large,
        paddingTop: spacing.large,
      },
      description: {
        color: colors.textSecondary,
        fontFamily: typography.bodyMedium.fontFamily,
        fontSize: typography.bodyMedium.fontSize,
        letterSpacing: typography.bodyMedium.letterSpacing,
        lineHeight: typography.bodyMedium.lineHeight,
        marginBottom: spacing.medium,
      },
      screen: {
        backgroundColor: colors.background,
        flex: 1,
        paddingTop: spacing.large,
      },
      title: {
        color: colors.textPrimary,
        fontFamily: typography.titleXLarge.fontFamily,
        fontSize: typography.titleXLarge.fontSize,
        fontWeight: typography.titleXLarge.fontWeight as TextStyle['fontWeight'],
        letterSpacing: typography.titleXLarge.letterSpacing,
        lineHeight: typography.titleXLarge.lineHeight,
        marginBottom: spacing.small,
      },
    });
  }, [tokens]);
}
