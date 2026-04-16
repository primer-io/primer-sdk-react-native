import { Image, View } from 'react-native';
import { useTheme } from '../theme';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE } from './constants';
import { useBottomSafeArea } from './useBottomSafeArea';

const checkCircleIcon = require('./assets/check-circle-large.png');
const CONTENT_HEIGHT = 246;

export function SuccessScreen() {
  const tokens = useTheme();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

  return (
    // eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height
    <View style={{ height: sheetHeight, justifyContent: 'center', paddingBottom: bottomInset }}>
      <StatusScreenLayout
        icon={
          <Image source={checkCircleIcon} style={{ width: STATUS_SCREEN_ICON_SIZE, height: STATUS_SCREEN_ICON_SIZE }} />
        }
        title="Payment successful"
        subtitle="You'll be redirected to the order confirmation page soon."
      />
    </View>
  );
}
