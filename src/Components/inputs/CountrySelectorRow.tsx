import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../internal/theme';
import type { PrimerTokens } from '../internal/theme';
import { FIELD_HEIGHT, LINE_HEIGHT_RATIO } from './dimensions';

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
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const hasValue = !!value;
  const text = hasValue ? (displayName ?? value) : placeholder;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.label}>{label}</Text>
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
        <Text
          style={[styles.value, !hasValue && styles.placeholder]}
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
  const { colors, radii, spacing, typography, borders } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    chevron: {
      color: tokens.colors.textSecondary,
      fontSize: typography.bodyLarge.fontSize + 4,
      lineHeight: FIELD_HEIGHT,
      marginLeft: spacing.small,
    },
    container: {},
    label: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      marginBottom: spacing.xsmall,
    },
    placeholder: {
      color: colors.textPlaceholder,
    },
    row: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.small,
      borderWidth: borders.input,
      flexDirection: 'row',
      height: FIELD_HEIGHT,
      paddingHorizontal: spacing.medium,
    },
    rowDisabled: {
      backgroundColor: colors.surface,
      borderColor: colors.borderDisabled,
    },
    value: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: typography.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: Math.round(typography.bodyLarge.fontSize * LINE_HEIGHT_RATIO),
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
