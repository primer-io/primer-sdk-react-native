import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import AssetsManager from '../HeadlessUniversalCheckout/Managers/AssetsManager';

export interface CardNetworkIconProps {
  /**
   * Card network identifier (e.g., "VISA", "MASTERCARD")
   */
  cardNetwork?: string;

  /**
   * Size of the icon
   * @default { width: 40, height: 24 }
   */
  size?: { width: number; height: number };

  /**
   * Style for the image when loaded
   */
  imageStyle?: ImageStyle;

  /**
   * Style for the fallback text badge container
   */
  badgeStyle?: ViewStyle;

  /**
   * Style for the fallback text badge text
   */
  textStyle?: TextStyle;

  /**
   * Background color for the fallback text badge
   */
  badgeColor?: string;

  /**
   * Whether to show a fallback text badge if image loading fails
   * @default true
   */
  showFallback?: boolean;
}

/**
 * Card Network Icon Component
 *
 * Displays the card network logo as an image. If image loading fails,
 * shows a text badge with the network name.
 *
 * @example
 * ```tsx
 * <CardNetworkIcon
 *   cardNetwork="VISA"
 *   badgeColor="#0066FF"
 * />
 * ```
 */
export function CardNetworkIcon(props: CardNetworkIconProps) {
  const {
    cardNetwork,
    size = { width: 40, height: 24 },
    imageStyle,
    badgeStyle,
    textStyle,
    badgeColor = '#0066FF',
    showFallback = true,
  } = props;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const assetsManager = React.useRef(new AssetsManager()).current;

  // Map card network names to display names and potential enum formats
  const getCardNetworkInfo = (network: string | undefined) => {
    if (!network) return null;

    const networkMap: Record<string, { display: string; assetKeys: string[] }> = {
      'VISA': { display: 'Visa', assetKeys: ['visa', 'Visa', 'VISA'] },
      'MASTERCARD': { display: 'Mastercard', assetKeys: ['mastercard', 'Mastercard', 'MASTERCARD', 'master_card'] },
      'AMERICAN_EXPRESS': { display: 'Amex', assetKeys: ['amex', 'Amex', 'AMEX', 'american_express', 'americanExpress'] },
      'DISCOVER': { display: 'Discover', assetKeys: ['discover', 'Discover', 'DISCOVER'] },
      'JCB': { display: 'JCB', assetKeys: ['jcb', 'JCB', 'Jcb'] },
      'DINERS_CLUB': { display: 'Diners', assetKeys: ['diners', 'Diners', 'DINERS', 'diners_club', 'dinersClub'] },
      'UNIONPAY': { display: 'UnionPay', assetKeys: ['unionpay', 'UnionPay', 'UNIONPAY', 'union_pay'] },
      'MAESTRO': { display: 'Maestro', assetKeys: ['maestro', 'Maestro', 'MAESTRO'] },
    };

    return networkMap[network] || { display: network, assetKeys: [network.toLowerCase(), network] };
  };

  // Attempt to load card network image with format variations
  useEffect(() => {
    const fetchCardNetworkImage = async () => {
      if (!cardNetwork) {
        setImageUrl(null);
        return;
      }

      const networkInfo = getCardNetworkInfo(cardNetwork);
      if (!networkInfo) {
        setImageUrl(null);
        return;
      }

      // Try each format variation until one succeeds
      for (const formatVariation of networkInfo.assetKeys) {
        try {
          const url = await assetsManager.getCardNetworkImageURL(formatVariation);
          setImageUrl(url);
          return; // Success! Stop trying other formats
        } catch (error) {
          // Continue to next format variation
        }
      }

      // All formats failed
      setImageUrl(null);
    };

    fetchCardNetworkImage();
  }, [cardNetwork, assetsManager]);

  // Don't render anything if no card network
  if (!cardNetwork) {
    return null;
  }

  const networkInfo = getCardNetworkInfo(cardNetwork);

  // Show image if loaded
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size.width,
            height: size.height,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    );
  }

  // Show fallback text badge if enabled
  if (showFallback && networkInfo) {
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor,
            height: size.height,
          },
          badgeStyle,
        ]}
      >
        <Text style={[styles.badgeText, textStyle]}>
          {networkInfo.display}
        </Text>
      </View>
    );
  }

  // Don't show anything if fallback disabled and image failed
  return null;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
