import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useRoute } from '../navigation';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE } from './constants';
import { useBottomSafeArea } from './useBottomSafeArea';

const SPINNER_SCALE = 1.1;
const CONTENT_HEIGHT = 246;

export function LoadingScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { route, params } = useRoute<CheckoutRoute.splash | CheckoutRoute.loading>();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  const defaultTitleKey =
    route === CheckoutRoute.splash ? 'primer_checkout_splash_title' : 'primer_checkout_loading_indicator';
  const defaultSubtitleKey =
    route === CheckoutRoute.splash ? 'primer_checkout_splash_subtitle' : 'primer_checkout_loading_subtitle';

  const title = params?.title ?? t(defaultTitleKey);
  const subtitle = params?.subtitle ?? t(defaultSubtitleKey);

  return (
    /* eslint-disable react-native/no-inline-styles -- screen-level layout with fixed height and icon sizing */
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <StatusScreenLayout
        icon={
          <View
            style={{
              width: STATUS_SCREEN_ICON_SIZE,
              height: STATUS_SCREEN_ICON_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator
              size="large"
              color={tokens.colors.primary}
              style={{ transform: [{ scale: SPINNER_SCALE }] }}
            />
          </View>
        }
        title={title}
        subtitle={subtitle}
      />
    </View>
    /* eslint-enable react-native/no-inline-styles */
  );
}
