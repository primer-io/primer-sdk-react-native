import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../theme';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE, BOTTOM_SAFE_AREA } from './constants';

const SPINNER_SCALE = 1.1;
const SHEET_HEIGHT = 280;

export function LoadingScreen() {
  const tokens = useTheme();
  useStatusScreenHeight(SHEET_HEIGHT);

  return (
    /* eslint-disable react-native/no-inline-styles -- screen-level layout with fixed height and icon sizing */
    <View style={{ height: SHEET_HEIGHT, justifyContent: 'center', paddingBottom: BOTTOM_SAFE_AREA }}>
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
        title="Loading"
        subtitle="This may take a few seconds."
      />
    </View>
    /* eslint-enable react-native/no-inline-styles */
  );
}
