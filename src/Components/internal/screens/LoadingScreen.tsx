import { View } from 'react-native';

import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useRoute } from '../navigation';
import { PrimerLoadingScreen } from '../../status';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { useBottomSafeArea } from './useBottomSafeArea';

const CONTENT_HEIGHT = 246;

export function LoadingScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { route, params } = useRoute<CheckoutRoute.splash | CheckoutRoute.loading | CheckoutRoute.processing>();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  const defaultTitleKey =
    route === CheckoutRoute.splash
      ? 'primer_checkout_splash_title'
      : route === CheckoutRoute.processing
        ? 'primer_checkout_processing_title'
        : 'primer_checkout_loading_indicator';
  const defaultSubtitleKey =
    route === CheckoutRoute.splash
      ? 'primer_checkout_splash_subtitle'
      : route === CheckoutRoute.processing
        ? 'primer_checkout_processing_subtitle'
        : 'primer_checkout_loading_subtitle';

  const title = params?.title ?? t(defaultTitleKey);
  const subtitle = params?.subtitle ?? t(defaultSubtitleKey);

  return (
    /* eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height */
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <PrimerLoadingScreen title={title} subtitle={subtitle} />
    </View>
  );
}
