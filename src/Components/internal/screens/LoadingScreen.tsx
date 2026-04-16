import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../theme';
import { StatusScreenLayout } from './StatusScreenLayout';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { STATUS_SCREEN_ICON_SIZE } from './constants';
import { useBottomSafeArea } from './useBottomSafeArea';

const SPINNER_SCALE = 1.1;
const CONTENT_HEIGHT = 246;

export function LoadingScreen() {
  const tokens = useTheme();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  const sheetHeight = CONTENT_HEIGHT + bottomInset;
  useStatusScreenHeight(sheetHeight);

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
        title="Loading"
        subtitle="This may take a few seconds."
      />
    </View>
    /* eslint-enable react-native/no-inline-styles */
  );
}
