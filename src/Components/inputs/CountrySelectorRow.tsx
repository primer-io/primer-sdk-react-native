import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { usePrimerTheme } from '../internal/theme';
import type { PrimerTokens } from '../internal/theme';
import { flagEmoji } from '../internal/flags';

export interface CountrySelectorRowProps {
  /** ISO country code currently selected, or empty if none. */
  value: string;
  /** Human-readable country name, when available. Falls back to the code, then the placeholder. */
  displayName?: string;
  /** Field label shown above the row. */
  label: string;
  /** Placeholder shown when no country is selected. */
  placeholder: string;
  /** Fires when the row is pressed — host wires navigation to the country selector screen. */
  onPress: () => void;
  /** Disables the row. */
  editable?: boolean;
  /** Optional outer container style. */
  style?: StyleProp<ViewStyle>;
  /** Test ID root. */
  testID?: string;
}

export function CountrySelectorRow({
  value,
  displayName,
  label,
  placeholder,
  onPress,
  editable = true,
  style,
  testID,
}: CountrySelectorRowProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const hasValue = !!value;
  const text = hasValue ? (displayName ?? value) : placeholder;
  const flag = hasValue ? flagEmoji(value) : '';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={[styles.label, !editable && styles.textDisabled]}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={!editable}
        activeOpacity={0.7}
        style={[styles.row, !editable && styles.rowDisabled]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !editable }}
        accessibilityLabel={label}
        accessibilityValue={{ text: hasValue ? text : '' }}
        testID={testID ? `${testID}-row` : undefined}
      >
        {flag !== '' && (
          <Text style={styles.flag} accessibilityElementsHidden>
            {flag}
          </Text>
        )}
        <Text
          style={[styles.value, !hasValue && styles.placeholder, !editable && styles.textDisabled]}
          numberOfLines={1}
          testID={testID ? `${testID}-value` : undefined}
        >
          {text}
        </Text>
        <Text style={styles.chevron} accessibilityElementsHidden>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, sizes, spacing, typography, widths } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    chevron: {
      color: tokens.colors.textSecondary,
      fontSize: typography.bodyLarge.fontSize + 4,
      lineHeight: sizes.xxlarge,
      marginLeft: spacing.small,
    },
    container: {},
    flag: {
      fontSize: typography.bodyLarge.fontSize + 4,
      marginRight: spacing.small,
      minWidth: 28,
    },
    label: {
      color: colors.textPrimary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
      marginBottom: spacing.xsmall,
    },
    placeholder: {
      color: colors.textPlaceholder,
    },
    row: {
      alignItems: 'center',
      backgroundColor: colors.backgroundOutlinedDefault,
      borderColor: colors.borderOutlinedDefault,
      borderRadius: radii.small,
      borderWidth: widths.default,
      flexDirection: 'row',
      height: sizes.xxlarge,
      paddingHorizontal: spacing.medium,
    },
    rowDisabled: {
      backgroundColor: colors.backgroundOutlinedDisabled,
      borderColor: colors.borderOutlinedDisabled,
    },
    textDisabled: {
      color: colors.textDisabled,
    },
    value: {
      color: colors.textOutlinedDefault,
      flex: 1,
      fontFamily: typography.bodyLarge.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
