import { useMemo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useNavigation, useRoute } from '../navigation';
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
  const { t } = useLocalization();
  const { popToRoot } = useNavigation();
  const { params } = useRoute<CheckoutRoute.error>();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = TOP_PADDING + CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const title = params?.title ?? t('primer_checkout_error_title');
  const subtitle = params?.subtitle ?? params?.error?.description ?? t('primer_checkout_error_subtitle');

  return (
    <View style={{ height: sheetHeight, paddingTop: TOP_PADDING, paddingBottom: bottomInset }}>
      <StatusScreenLayout
        icon={<Image source={errorIcon} style={{ width: STATUS_SCREEN_ICON_SIZE, height: STATUS_SCREEN_ICON_SIZE }} />}
        title={title}
        subtitle={subtitle}
      >
        <View style={styles.buttonGroup}>
          <CheckoutButton title={t('primer_common_button_retry')} variant="primary" onPress={popToRoot} />
          <CheckoutButton
            title={t('primer_checkout_error_button_other_methods')}
            variant="outlined"
            onPress={popToRoot}
          />
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
