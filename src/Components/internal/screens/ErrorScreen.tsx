import { useMemo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useNavigation } from '../navigation';
import type { PrimerTokens } from '../theme';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE, BOTTOM_SAFE_AREA } from './constants';
import { CheckoutButton } from '../ui';

const errorIcon = require('./assets/error-large.png');
const SHEET_HEIGHT = 350;

export function ErrorScreen() {
  const tokens = useTheme();
  const { popToRoot } = useNavigation();
  useStatusScreenHeight(SHEET_HEIGHT);
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={{ height: SHEET_HEIGHT, paddingTop: BOTTOM_SAFE_AREA, paddingBottom: BOTTOM_SAFE_AREA }}>
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
