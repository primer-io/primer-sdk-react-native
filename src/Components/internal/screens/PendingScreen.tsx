import { View } from 'react-native';
import { usePrimerTheme } from '../theme';
import { usePrimerLocalization } from '../localization';
import { PrimerSuccessScreen } from '../../status';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { useBottomSafeArea } from './useBottomSafeArea';

// Taller than the success screen: the ported completion copy runs several lines.
const CONTENT_HEIGHT = 320;

/**
 * Pending confirmation for asynchronously-settling payments (Stripe ACH): the payment is
 * authorized and awaiting settlement — its own screen, distinct from the generic success,
 * carrying the completion copy the native SDKs ship. Dismissal is owned by the flow-level
 * wrapper in CheckoutFlow (which also clears the outcome) — no timer here.
 */
export function PendingScreen() {
  const tokens = usePrimerTheme();
  const { t } = usePrimerLocalization();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  return (
    // eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <PrimerSuccessScreen
        title={t('primer_ach_pay_with_title')}
        subtitle={t('primer_ach_payment_request_completed')}
      />
    </View>
  );
}
