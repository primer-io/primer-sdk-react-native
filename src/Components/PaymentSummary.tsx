import { View, Text, StyleSheet } from 'react-native';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import type { PaymentSummaryProps, PaymentSummaryTheme } from '../models/components/PaymentMethodListTypes';

/**
 * Default theme for PaymentSummary
 */
const defaultTheme: PaymentSummaryTheme = {
  backgroundColor: '#F9FAFB',
  textColor: '#000000',
  secondaryTextColor: '#666666',
  primaryColor: '#0066FF',
  borderColor: '#E0E0E0',
  borderWidth: 0,
  borderRadius: 8,
  padding: 16,
  spacing: 8,
  amountFontSize: 24,
  amountFontWeight: 'bold',
  labelFontSize: 14,
};

/**
 * Format amount for display (amount is in cents)
 */
function formatAmount(amountInCents: number, currencyCode: string = 'EUR'): string {
  const amount = amountInCents / 100;
  const currencySymbol = currencyCode === 'USD' ? '$' : currencyCode === 'GBP' ? '£' : '€';
  return `${currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Calculate total amount from client session
 */
function calculateTotalFromClientSession(clientSession: any): { amount: number; currency: string } {
  if (!clientSession) {
    return { amount: 0, currency: 'EUR' };
  }

  // Try to get totalAmount directly
  if (clientSession.totalAmount !== undefined) {
    return {
      amount: clientSession.totalAmount,
      currency: clientSession.currencyCode || 'EUR',
    };
  }

  // Fallback: calculate from line items if available
  const lineItems = clientSession.lineItems || [];
  const total = lineItems.reduce((sum: number, item: any) => {
    return sum + (item.amount || 0) * (item.quantity || 1);
  }, 0);

  return {
    amount: total,
    currency: clientSession.currencyCode || 'EUR',
  };
}

/**
 * Payment Summary Component
 *
 * Displays the total payment amount with currency.
 * Can be used standalone or as a header for PaymentMethodList.
 *
 * @example
 * ```tsx
 * <PaymentSummary
 *   theme={{ primaryColor: '#0066FF' }}
 *   showLineItems={false}
 * />
 * ```
 */
export function PaymentSummary(props: PaymentSummaryProps) {
  const {
    theme: customTheme,
    style,
    showLineItems = false,
    label = 'Total Amount',
    amount: propAmount,
    currencyCode: propCurrency,
    children,
    testID = 'payment-summary',
  } = props;

  const { clientSession } = usePrimerCheckout();

  const theme = {
    backgroundColor: customTheme?.backgroundColor ?? defaultTheme.backgroundColor,
    textColor: customTheme?.textColor ?? defaultTheme.textColor,
    secondaryTextColor: customTheme?.secondaryTextColor ?? defaultTheme.secondaryTextColor,
    primaryColor: customTheme?.primaryColor ?? defaultTheme.primaryColor,
    borderColor: customTheme?.borderColor ?? defaultTheme.borderColor,
    borderWidth: customTheme?.borderWidth ?? defaultTheme.borderWidth,
    borderRadius: customTheme?.borderRadius ?? defaultTheme.borderRadius,
    padding: customTheme?.padding ?? defaultTheme.padding,
    spacing: customTheme?.spacing ?? defaultTheme.spacing,
    amountFontSize: customTheme?.amountFontSize ?? defaultTheme.amountFontSize,
    amountFontWeight: customTheme?.amountFontWeight ?? defaultTheme.amountFontWeight,
    labelFontSize: customTheme?.labelFontSize ?? defaultTheme.labelFontSize,
    fontFamily: customTheme?.fontFamily,
  };

  // Use prop amount/currency if provided, otherwise get from client session
  let amount: number;
  let currency: string;

  if (propAmount !== undefined) {
    amount = propAmount;
    currency = propCurrency || 'EUR';
  } else {
    const calculated = calculateTotalFromClientSession(clientSession);
    amount = calculated.amount;
    currency = calculated.currency;
  }

  const formattedAmount = formatAmount(amount, currency);

  // If custom children provided, render them
  if (children) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.borderRadius,
            padding: theme.padding,
          },
          style,
        ]}
        testID={testID}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
          borderWidth: theme.borderWidth,
          borderRadius: theme.borderRadius,
          padding: theme.padding,
        },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.secondaryTextColor,
            fontSize: theme.labelFontSize,
            fontFamily: theme.fontFamily,
            marginBottom: theme.spacing,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.amount,
          {
            color: theme.textColor,
            fontSize: theme.amountFontSize,
            fontWeight: theme.amountFontWeight,
            fontFamily: theme.fontFamily,
          },
        ]}
        testID={`${testID}-amount`}
      >
        {formattedAmount}
      </Text>

      {/* Show line items if requested */}
      {showLineItems && clientSession?.lineItems && (
        <View style={{ marginTop: (theme.spacing || 8) * 2 }}>
          {clientSession.lineItems.map((item: any, index: number) => (
            <View
              key={index}
              style={[
                styles.lineItem,
                {
                  marginBottom: theme.spacing,
                },
              ]}
            >
              <Text
                style={[
                  styles.lineItemText,
                  {
                    color: theme.textColor,
                    fontSize: theme.labelFontSize,
                    fontFamily: theme.fontFamily,
                  },
                ]}
              >
                {item.description || item.itemId} {item.quantity > 1 ? `x${item.quantity}` : ''}
              </Text>
              <Text
                style={[
                  styles.lineItemText,
                  {
                    color: theme.textColor,
                    fontSize: theme.labelFontSize,
                    fontFamily: theme.fontFamily,
                  },
                ]}
              >
                {formatAmount(item.amount * item.quantity, currency)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    // Font properties set dynamically
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineItemText: {
    // Font properties set dynamically
  },
});
