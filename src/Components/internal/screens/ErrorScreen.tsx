import { useState } from 'react';
import { View } from 'react-native';
import { usePrimerLocalization } from '../localization';
import { CheckoutRoute, useNavigation, useRoute } from '../navigation';
import { PrimerErrorScreen } from '../../status';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { useBottomPadding } from './useBottomPadding';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { fmt } from '../debug';

const LOG = '[ErrorScreen]';
// CheckoutSheet drag-handle chrome above our content: paddingTop(12) + handle(4) + paddingBottom(4).
const DRAG_HANDLE_AREA = 20;
const CONTENT_HEIGHT = 274;
const TOP_PADDING = 24;

export function ErrorScreen() {
  const { t } = usePrimerLocalization();
  const { replace } = useNavigation();
  const { params } = useRoute<CheckoutRoute.error>();
  const { retry, clearPaymentOutcome, requestExpandedVaultDisplay } = usePrimerCheckout();
  const bottomPadding = useBottomPadding();
  // A long error message or large text needs more than the estimate; the sheet follows the content.
  const [contentHeight, setContentHeight] = useState(CONTENT_HEIGHT);
  const sheetHeight = DRAG_HANDLE_AREA + TOP_PADDING + contentHeight + bottomPadding;
  useStatusScreenHeight(sheetHeight);

  const title = params?.title ?? t('primer_checkout_error_title');
  const subtitle = params?.subtitle ?? t('primer_checkout_error_subtitle');

  const onRetry = () => {
    // Navigate to processing first so the user sees an immediate spinner;
    // the outcome transitioner replaces with success/error when retry resolves.
    replace(CheckoutRoute.processing);
    retry().catch((err) => {
      console.warn(`${LOG} retry error ${fmt(err)}`);
      // JS-side failures (e.g. configure/setRawData rejecting) never reach the
      // native onError callback, so paymentOutcome stays null — without this
      // the user is stuck on the processing spinner.
      replace(CheckoutRoute.error);
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
    <View style={{ height: sheetHeight, paddingTop: TOP_PADDING, paddingBottom: bottomPadding }}>
      <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
        <PrimerErrorScreen title={title} subtitle={subtitle} onRetry={onRetry} onChooseOtherMethod={onChooseOther} />
      </View>
    </View>
  );
}
