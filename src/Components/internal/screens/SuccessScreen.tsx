import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useRoute } from '../navigation';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE } from './constants';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';

const checkCircleIcon = require('./assets/check-circle-large.png');
const CONTENT_HEIGHT = 246;
const AUTO_DISMISS_MS = 3000;

export function SuccessScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { params } = useRoute<CheckoutRoute.success>();
  const { onCancel } = useCheckoutFlow();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  useEffect(() => {
    const id = setTimeout(onCancel, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [onCancel]);

  const title = params?.title ?? t('primer_checkout_success_title');
  const subtitle = params?.subtitle ?? t('primer_checkout_success_subtitle');

  return (
    // eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <StatusScreenLayout
        icon={
          <Image source={checkCircleIcon} style={{ width: STATUS_SCREEN_ICON_SIZE, height: STATUS_SCREEN_ICON_SIZE }} />
        }
        title={title}
        subtitle={subtitle}
      />
    </View>
  );
}
