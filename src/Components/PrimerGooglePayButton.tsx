import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { PrimerGooglePayButton as PrimerGooglePayNativeButton } from '../HeadlessUniversalCheckout/Components/PrimerGooglePayButton';
import { useGooglePay } from './hooks/useGooglePay';
import type { PrimerGooglePayButtonProps } from './types/PrimerGooglePayTypes';

/**
 * Google Pay button for Checkout Components. Renders nothing when Google Pay is unavailable
 * (including all of iOS), so merchants need no `Platform.OS` check. Tap starts the payment via
 * `useGooglePay()`; outcomes flow through the provider exactly like cards.
 */
export const PrimerGooglePayButton: React.FC<PrimerGooglePayButtonProps> = ({ style, onPress, ...rest }) => {
  const { isAvailable, isLoading, startPayment } = useGooglePay();

  if (!isAvailable) {
    return null;
  }

  const handlePress =
    onPress ??
    (() => {
      // Outcomes are delivered through the provider, so the rejection here needs no handling.
      startPayment().catch(() => {});
    });

  return (
    <TouchableOpacity onPress={handlePress} disabled={isLoading} accessibilityRole="button" {...rest}>
      <PrimerGooglePayNativeButton style={[styles.button, style]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
  },
});
