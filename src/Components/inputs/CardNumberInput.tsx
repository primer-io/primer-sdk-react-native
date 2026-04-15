import { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import type { CardNumberInputProps } from '../../models/components/CardInputTypes';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../../HeadlessUniversalCheckout/Managers/AssetsManager';

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();

const NETWORK_ICON_WIDTH = 32;
const NETWORK_ICON_HEIGHT = 20;
const NETWORK_ICON_MARGIN = 8;

export function CardNumberInput({
  cardForm,
  showCardNetworkIcon = true,
  placeholder = '1234 1234 1234 1234',
  label = 'Card number',
  ...rest
}: CardNumberInputProps) {
  const networkId = cardForm.binData?.preferred?.network;
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!showCardNetworkIcon || networkId == null) {
      setIconUrl(null);
      return;
    }
    let cancelled = false;
    assetsManager
      .getCardNetworkImageURL(networkId)
      .then((url) => {
        if (!cancelled) setIconUrl(url);
      })
      .catch(() => {
        if (!cancelled) setIconUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [showCardNetworkIcon, networkId]);

  return (
    <PrimerTextInput
      value={cardForm.cardNumber}
      onChangeText={cardForm.updateCardNumber}
      error={cardForm.errors.cardNumber}
      editable={!cardForm.isSubmitting}
      onBlur={() => cardForm.markFieldTouched('cardNumber')}
      keyboardType="number-pad"
      maxLength={19}
      autoComplete="cc-number"
      label={label}
      placeholder={placeholder}
      trailingContent={
        iconUrl != null ? (
          <Image
            source={{ uri: iconUrl }}
            style={iconStyles.icon}
            resizeMode="contain"
            testID={rest.testID ? `${rest.testID}-network-icon` : undefined}
          />
        ) : undefined
      }
      {...rest}
    />
  );
}

const iconStyles = StyleSheet.create({
  icon: {
    height: NETWORK_ICON_HEIGHT,
    marginLeft: NETWORK_ICON_MARGIN,
    width: NETWORK_ICON_WIDTH,
  },
});
