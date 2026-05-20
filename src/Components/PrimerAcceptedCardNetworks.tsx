import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from './internal/theme';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import { useCardNetworkIcons } from './hooks/useCardNetworkIcons';

export interface PrimerAcceptedCardNetworksProps {
  /** Merchant override for the network list. When `undefined`, falls back to context. */
  networks?: string[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Brand-spec backgrounds for chips that ship with a tinted plate behind the logo.
 * Networks not listed render on the theme's surface color with the logo overlaid.
 */
const BRAND_BACKGROUNDS: Record<string, string> = {
  AMEX: '#116dd0',
  DINERS_CLUB: '#254a9b',
};

/** Abbreviation text color on tinted brand chips. */
const ON_BRAND_TEXT_COLOR = '#ffffff';

const CHIP_WIDTH = 28;
const CHIP_HEIGHT = 20;
const CHIP_RADIUS = 2;
const CHIP_GAP = 4;

export function PrimerAcceptedCardNetworks({
  networks: propNetworks,
  style,
  testID = 'primer-accepted-card-networks',
}: PrimerAcceptedCardNetworksProps) {
  const tokens = useTheme();
  const { acceptedCardNetworks } = usePrimerCheckout();
  const resolved = propNetworks ?? acceptedCardNetworks ?? [];
  const chips = useCardNetworkIcons(resolved);

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.row}
      testID={testID}
      accessibilityElementsHidden
    >
      {chips.map((chip) => {
        const brandBg = BRAND_BACKGROUNDS[chip.network];
        const backgroundColor = brandBg ?? tokens.colors.surface;
        return (
          <View key={chip.network} style={[styles.chip, { backgroundColor }]} testID={`${testID}-chip-${chip.network}`}>
            {chip.iconUri ? (
              <Image source={{ uri: chip.iconUri }} style={styles.icon} resizeMode="contain" />
            ) : (
              <Text
                style={[
                  styles.abbreviation,
                  {
                    color: brandBg ? ON_BRAND_TEXT_COLOR : tokens.colors.textPrimary,
                    fontFamily: tokens.typography.fontFamily,
                  },
                ]}
              >
                {chip.abbreviation}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  abbreviation: { fontSize: 9, fontWeight: '600' },
  chip: {
    alignItems: 'center',
    borderRadius: CHIP_RADIUS,
    height: CHIP_HEIGHT,
    justifyContent: 'center',
    width: CHIP_WIDTH,
  },
  icon: { height: CHIP_HEIGHT - 4, width: CHIP_WIDTH - 4 },
  row: { flexDirection: 'row', gap: CHIP_GAP },
});
