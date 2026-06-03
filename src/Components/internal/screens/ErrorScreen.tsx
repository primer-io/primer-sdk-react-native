import { View } from 'react-native';
import { useTheme } from '../theme';
import { useLocalization } from '../localization';
import { CheckoutRoute, useNavigation, useRoute } from '../navigation';
import { PrimerErrorScreen } from '../../status';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { useBottomSafeArea } from './useBottomSafeArea';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { fmt } from '../debug';
import { PrimerError } from '../../../models/PrimerError';

const LOG = '[ErrorScreen]';
const CONTENT_HEIGHT = 282;
const TOP_PADDING = 34;

export function ErrorScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { replace } = useNavigation();
  const { params } = useRoute<CheckoutRoute.error>();
  const { retry, clearPaymentOutcome, requestExpandedVaultDisplay } = usePrimerCheckout();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = TOP_PADDING + CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  const title = params?.title ?? t('primer_checkout_error_title');
  const subtitle = params?.subtitle ?? params?.error?.description ?? t('primer_checkout_error_subtitle');

  const onRetry = () => {
    // Navigate to processing first so the user sees an immediate spinner;
    // the outcome transitioner replaces with success/error when retry resolves.
    replace(CheckoutRoute.processing);
    retry().catch((err) => {
      console.warn(`${LOG} retry error ${fmt(err)}`);
      // JS-side failures (e.g. configure/setRawData rejecting) never reach the
      // native onError callback, so paymentOutcome stays null — without this
      // the user is stuck on the processing spinner.
      replace(CheckoutRoute.error, err instanceof PrimerError ? { error: err } : undefined);
    });
  };

  const onChooseOther = () => {
    // Flip the vault block to expanded layout (so APMs and the full method list
    // are visible again) but keep the shopper's selected vault id intact —
    // they may still want to retry the same vault method, just from the full menu.
    requestExpandedVaultDisplay();
    clearPaymentOutcome();
    replace(CheckoutRoute.methodSelection);
  };

  return (
    <View style={{ height: sheetHeight, paddingTop: TOP_PADDING, paddingBottom: bottomInset }}>
      <PrimerErrorScreen title={title} subtitle={subtitle} onRetry={onRetry} onChooseOtherMethod={onChooseOther} />
    </View>
  );
}
