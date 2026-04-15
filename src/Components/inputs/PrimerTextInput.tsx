/* eslint-disable react-native/no-unused-styles */
import { useState, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, type TextStyle } from 'react-native';
import { useTheme } from '../internal/theme';
import type { PrimerTextInputProps, PrimerTextInputTheme } from '../../models/components/CardInputTypes';
import type { PrimerTokens } from '../internal/theme/types';

const DEFAULT_FIELD_HEIGHT = 44;
const LINE_HEIGHT_RATIO = 1.25;

function resolveTheme(tokens: PrimerTokens, override?: PrimerTextInputTheme) {
  const borderWidth = override?.borderWidth ?? tokens.borders.input;
  const focusedBorderWidth = Math.max(override?.focusedBorderWidth ?? tokens.borders.strong, borderWidth);
  return {
    backgroundColor: override?.backgroundColor ?? tokens.colors.background,
    borderColor: override?.borderColor ?? tokens.colors.border,
    borderRadius: override?.borderRadius ?? tokens.radii.small,
    borderWidth,
    disabledBackgroundColor: override?.disabledBackgroundColor ?? tokens.colors.surface,
    disabledBorderColor: override?.disabledBorderColor ?? tokens.colors.borderDisabled,
    errorColor: override?.errorColor ?? tokens.colors.borderError,
    errorFontSize: override?.errorFontSize ?? tokens.typography.bodySmall.fontSize,
    fieldHeight: override?.fieldHeight ?? DEFAULT_FIELD_HEIGHT,
    focusedBorderWidth,
    fontFamily: override?.fontFamily ?? tokens.typography.fontFamily,
    fontSize: override?.fontSize ?? tokens.typography.bodyLarge.fontSize,
    labelColor: override?.labelColor ?? tokens.colors.textSecondary,
    labelFontSize: override?.labelFontSize ?? tokens.typography.bodySmall.fontSize,
    placeholderColor: override?.placeholderColor ?? tokens.colors.textPlaceholder,
    primaryColor: override?.primaryColor ?? tokens.colors.borderFocused,
    textColor: override?.textColor ?? tokens.colors.textPrimary,
  };
}

export function PrimerTextInput({
  value,
  onChangeText,
  onBlur,
  onFocus,
  editable = true,
  keyboardType,
  maxLength,
  secureTextEntry = false,
  autoComplete,
  autoCapitalize = 'none',
  label,
  showLabel = true,
  placeholder,
  error,
  trailingContent,
  theme: themeOverride,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  testID,
}: PrimerTextInputProps) {
  const tokens = useTheme();
  const resolved = useMemo(() => resolveTheme(tokens, themeOverride), [tokens, themeOverride]);
  const [isFocused, setIsFocused] = useState(false);

  const currentBorderWidth = isFocused ? resolved.focusedBorderWidth : resolved.borderWidth;
  const borderWidthDiff = currentBorderWidth - resolved.borderWidth;

  const borderColor = !editable
    ? resolved.disabledBorderColor
    : error
      ? resolved.errorColor
      : isFocused
        ? resolved.primaryColor
        : resolved.borderColor;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {},
        error: {
          color: resolved.errorColor,
          fontFamily: resolved.fontFamily,
          fontSize: resolved.errorFontSize,
          marginTop: tokens.spacing.xsmall,
        },
        input: {
          color: editable ? resolved.textColor : tokens.colors.textDisabled,
          flex: 1,
          fontFamily: resolved.fontFamily,
          fontSize: resolved.fontSize,
          letterSpacing: tokens.typography.bodyLarge.letterSpacing,
          lineHeight: Math.round(resolved.fontSize * LINE_HEIGHT_RATIO),
          padding: 0,
        },
        inputContainer: {
          alignItems: 'center',
          backgroundColor: editable ? resolved.backgroundColor : resolved.disabledBackgroundColor,
          borderColor,
          borderRadius: resolved.borderRadius,
          borderWidth: currentBorderWidth,
          flexDirection: 'row',
          height: resolved.fieldHeight,
          paddingHorizontal: tokens.spacing.medium - borderWidthDiff,
        },
        label: {
          color: resolved.labelColor,
          fontFamily: resolved.fontFamily,
          fontSize: resolved.labelFontSize,
          marginBottom: tokens.spacing.xsmall,
        },
      }),
    [resolved, borderColor, currentBorderWidth, borderWidthDiff, editable, tokens]
  );

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {showLabel && label != null && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, inputStyle] as TextStyle[]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor={resolved.placeholderColor}
          testID={testID ? `${testID}-input` : undefined}
        />
        {trailingContent}
      </View>
      {error != null && (
        <Text style={[styles.error, errorStyle]} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}
    </View>
  );
}
