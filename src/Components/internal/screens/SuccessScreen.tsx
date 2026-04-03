import { Image, View } from 'react-native';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE, BOTTOM_SAFE_AREA } from './constants';

const checkCircleIcon = require('./assets/check-circle-large.png');
const SHEET_HEIGHT = 280;

export function SuccessScreen() {
  useStatusScreenHeight(SHEET_HEIGHT);

  return (
    // eslint-disable-next-line react-native/no-inline-styles -- screen-level layout with fixed height
    <View style={{ height: SHEET_HEIGHT, justifyContent: 'center', paddingBottom: BOTTOM_SAFE_AREA }}>
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
