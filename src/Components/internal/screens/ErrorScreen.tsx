import { useMemo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useNavigation } from '../navigation';
import type { PrimerTokens } from '../theme';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE } from './constants';
import { useBottomSafeArea } from './useBottomSafeArea';
import { CheckoutButton } from '../ui';

const errorIcon = require('./assets/error-large.png');
const CONTENT_HEIGHT = 282;
const TOP_PADDING = 34;

export function ErrorScreen() {
  const tokens = useTheme();
  const { popToRoot } = useNavigation();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = TOP_PADDING + CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={{ height: sheetHeight, paddingTop: TOP_PADDING, paddingBottom: bottomInset }}>
      <StatusScreenLayout
        icon={<Image source={errorIcon} style={{ width: STATUS_SCREEN_ICON_SIZE, height: STATUS_SCREEN_ICON_SIZE }} />}
        title="Payment failed"
        subtitle="There was a network issue."
      >
        <View style={styles.buttonGroup}>
          <CheckoutButton title="Retry" variant="primary" onPress={popToRoot} />
          <CheckoutButton title="Choose other payment method" variant="outlined" onPress={popToRoot} />
        </View>
      </StatusScreenLayout>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    buttonGroup: {
      gap: spacing.small,
      width: '100%',
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
