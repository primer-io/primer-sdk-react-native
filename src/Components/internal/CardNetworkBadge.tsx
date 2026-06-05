import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme';
import { getNetworkAbbreviation } from './cardNetwork';
import { PLACEHOLDER_ICON_HEIGHT, PLACEHOLDER_ICON_WIDTH } from '../inputs/dimensions';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../../HeadlessUniversalCheckout/Managers/AssetsManager';

const LOG = '[CardNetworkBadge]';
const placeholderSource = require('../../assets/images/ic-card-placeholder.png');

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();
const iconCache = new Map<string, Promise<string>>();

function getCardNetworkIconURL(identifier: string): Promise<string> {
  const key = identifier.toUpperCase();
  const existing = iconCache.get(key);
  if (existing) return existing;
  const promise = assetsManager.getCardNetworkImageURL(key).catch((err) => {
    iconCache.delete(key);
    throw err;
  });
  iconCache.set(key, promise);
  return promise;
}

function useNetworkIconUri(identifier: string | null): string | null {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    setUri(null);
    if (!identifier || identifier.toUpperCase() === 'OTHER') return;
    let cancelled = false;
    getCardNetworkIconURL(identifier)
      .then((u) => {
        if (!cancelled) setUri(u);
      })
      .catch((err) => {
        console.warn(`${LOG} icon fetch failed ${identifier}: ${String(err)}`);
        if (!cancelled) setUri(null);
      });
    return () => {
      cancelled = true;
    };
  }, [identifier]);
  return uri;
}

export interface CardNetworkBadgeProps {
  identifier: string;
  testID?: string;
  marginLeft?: number;
}

// Renders the icon for a given card network identifier. Falls back to an
// abbreviation chip (e.g. "CB" for Cartes Bancaires) when no asset exists,
// then to a generic placeholder. Shared by CardNumberInput trailing content
// and the multi-network selector.
export function CardNetworkBadge({ identifier, testID, marginLeft }: CardNetworkBadgeProps) {
  const tokens = useTheme();
  const uri = useNetworkIconUri(identifier);
  const baseStyle = marginLeft != null ? { marginLeft } : null;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.chipImage,
          baseStyle,
          { backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.xsmall },
        ]}
        resizeMode="contain"
        testID={testID}
      />
    );
  }
  const abbreviation = getNetworkAbbreviation(identifier);
  if (abbreviation) {
    return (
      <View
        style={[
          styles.chip,
          baseStyle,
          {
            backgroundColor: tokens.colors.surface,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.xsmall,
            borderWidth: tokens.borders.input,
          },
        ]}
        testID={testID}
      >
        <Text
          style={{
            color: tokens.colors.textPrimary,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmall.fontSize,
          }}
        >
          {abbreviation}
        </Text>
      </View>
    );
  }
  return (
    <Image source={placeholderSource} style={[styles.placeholder, baseStyle]} resizeMode="contain" testID={testID} />
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    height: PLACEHOLDER_ICON_HEIGHT,
    justifyContent: 'center',
    width: PLACEHOLDER_ICON_WIDTH,
  },
  chipImage: {
    height: PLACEHOLDER_ICON_HEIGHT,
    width: PLACEHOLDER_ICON_WIDTH,
  },
  placeholder: {
    height: PLACEHOLDER_ICON_HEIGHT,
    width: PLACEHOLDER_ICON_WIDTH,
  },
});
