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

const CHIP_WIDTH = 28;
const CHIP_HEIGHT = 20;

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
      contentContainerStyle={[styles.row, { gap: tokens.spacing.xsmall }]}
      testID={testID}
      accessibilityElementsHidden
    >
      {chips.map((chip) => (
        <View
          key={chip.network}
          style={[styles.chip, { backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.xsmall }]}
          testID={`${testID}-chip-${chip.network}`}
        >
          {chip.iconUri ? (
            <Image source={{ uri: chip.iconUri }} style={styles.icon} resizeMode="contain" />
          ) : (
            <Text
              style={[
                styles.abbreviation,
                { color: tokens.colors.textPrimary, fontFamily: tokens.typography.fontFamily },
              ]}
            >
              {chip.abbreviation}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  abbreviation: { fontSize: 9, fontWeight: '600' },
  chip: {
    alignItems: 'center',
    height: CHIP_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
    width: CHIP_WIDTH,
  },
  icon: { height: CHIP_HEIGHT, width: CHIP_WIDTH },
  row: { flexDirection: 'row' },
});
