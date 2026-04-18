import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';
import { useTheme } from '../internal/theme';
import { FIELD_HEIGHT, LINE_HEIGHT_RATIO } from './dimensions';
import type {
  PrimerTextInputProps,
  PrimerTextInputRef,
  PrimerTextInputTheme,
} from '../../models/components/CardInputTypes';
import type { PrimerTokens } from '../internal/theme/types';

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
    fieldHeight: override?.fieldHeight ?? FIELD_HEIGHT,
    focusedBorderWidth,
    fontFamily: override?.fontFamily ?? tokens.typography.fontFamily,
    fontSize: override?.fontSize ?? tokens.typography.bodyLarge.fontSize,
    labelColor: override?.labelColor ?? tokens.colors.textPrimary,
    labelFontSize: override?.labelFontSize ?? tokens.typography.bodySmall.fontSize,
    placeholderColor: override?.placeholderColor ?? tokens.colors.textPlaceholder,
    primaryColor: override?.primaryColor ?? tokens.colors.borderFocused,
    textColor: override?.textColor ?? tokens.colors.textPrimary,
  };
}

export const PrimerTextInput = forwardRef<PrimerTextInputRef, PrimerTextInputProps>(function PrimerTextInput(
  {
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
    trailingContent,
    onSelectionChange,
    selectionColor,
    theme: themeOverride,
    style,
    inputStyle,
    labelStyle,
    testID,
  },
  ref
) {
  const tokens = useTheme();
  const resolved = useMemo(() => resolveTheme(tokens, themeOverride), [tokens, themeOverride]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  useImperativeHandle(
    ref,
    () => ({
      setCaret(start: number, end?: number) {
        const selection = { start, end: end ?? start };
        const apply = () => inputRef.current?.setNativeProps({ selection });
        // Web SDK hit the same race on Android with setSelectionRange — defer a tick.
        if (Platform.OS === 'android') {
          setTimeout(apply, 0);
        } else {
          apply();
        }
      },
      focus() {
        inputRef.current?.focus();
      },
      blur() {
        inputRef.current?.blur();
      },
    }),
    []
  );

  const currentBorderWidth = isFocused ? resolved.focusedBorderWidth : resolved.borderWidth;
  const borderWidthDiff = currentBorderWidth - resolved.borderWidth;

  const borderColor = !editable
    ? resolved.disabledBorderColor
    : isFocused
      ? resolved.primaryColor
      : resolved.borderColor;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {},
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
          ref={inputRef}
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
          onSelectionChange={onSelectionChange}
          selectionColor={selectionColor ?? resolved.primaryColor}
          testID={testID ? `${testID}-input` : undefined}
        />
        {trailingContent}
      </View>
    </View>
  );
});
