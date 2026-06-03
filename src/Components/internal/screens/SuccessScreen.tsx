import { View } from 'react-native';
import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useRoute } from '../navigation';
import { PrimerSuccessScreen } from '../../status';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';

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

  const title = params?.title ?? t('primer_checkout_success_title');
  const subtitle = params?.subtitle ?? t('primer_checkout_success_subtitle');

  return (
    // eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <PrimerSuccessScreen title={title} subtitle={subtitle} onDismiss={onCancel} autoDismissMs={AUTO_DISMISS_MS} />
    </View>
  );
}
