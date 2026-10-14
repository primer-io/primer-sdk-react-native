import { useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { usePrimerLocalization } from '../localization';
import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { PrimerTextInput } from '../../inputs/PrimerTextInput';
import type { PrimerTextInputRef } from '../../types/CardInputTypes';

const lockIcon = require('../screens/assets/lock.png');

const ICON_SIZE = 20;
const INPUT_WIDTH = 119;

export interface VaultedCardCvvRowProps {
  value: string;
  onChangeValue: (next: string) => void;
  /** Network-specific CVV abbreviation from the card descriptor (CVV / CVC / CID / CVN / CVE / CVP2). */
  cvvLabel: string;
  /** Network-specific CVV length (3 or 4). */
  maxLength: number;
  /** When true, the input auto-focuses and opens the keyboard on mount. */
  autoFocus?: boolean;
  error?: string;
}

export function VaultedCardCvvRow({
  value,
  onChangeValue,
  cvvLabel,
  maxLength,
  autoFocus = false,
  error,
}: VaultedCardCvvRowProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const inputRef = useRef<PrimerTextInputRef>(null);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus, maxLength]);

  const handleChangeText = (next: string) => {
    onChangeValue(next.replace(/\D/g, ''));
  };

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.caption} numberOfLines={2}>
          {t('primer_vault_cvv_hint_with_label', { label: cvvLabel })}
        </Text>
      </View>
      <View style={styles.inputWrap}>
        <PrimerTextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          maxLength={maxLength}
          secureTextEntry
          autoComplete="cc-csc"
          showLabel={false}
          placeholder={cvvLabel}
          accessibilityLabel={t('accessibility_vaulted_method_cvv', { label: cvvLabel })}
          error={error}
        />
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    caption: {
      color: colors.textSecondary,
      flex: 1,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
    },
    icon: {
      height: ICON_SIZE,
      tintColor: colors.textSecondary,
      width: ICON_SIZE,
    },
    inputWrap: {
      width: INPUT_WIDTH,
    },
    left: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: spacing.small,
      minWidth: 0,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.medium,
      width: '100%',
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
