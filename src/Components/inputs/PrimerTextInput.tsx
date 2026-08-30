import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';
import { usePrimerTheme } from '../internal/theme';
import { LINE_HEIGHT_RATIO } from './dimensions';
import type { PrimerTextInputProps, PrimerTextInputRef, PrimerTextInputTheme } from '../types/CardInputTypes';
import type { PrimerTokens } from '../internal/theme/types';

// Shared nativeID for an empty InputAccessoryView rendered once in CheckoutSheet.
// Suppresses iOS's auto-added Previous/Next/Done navigation toolbar above the keyboard.
export const PRIMER_EMPTY_ACCESSORY_ID = 'primer-empty-input-accessory';

// Exported for tests: the override chain is easy to break silently.
export function resolveTheme(tokens: PrimerTokens, override?: PrimerTextInputTheme) {
  const borderWidth = override?.borderWidth ?? tokens.widths.default;
  const focusedBorderWidth = Math.max(override?.focusedBorderWidth ?? tokens.widths.focus, borderWidth);
  const errorBorderWidth = Math.max(override?.errorBorderWidth ?? tokens.widths.error, borderWidth);
  return {
    backgroundColor: override?.backgroundColor ?? tokens.colors.backgroundOutlinedDefault,
    borderColor: override?.borderColor ?? tokens.colors.borderOutlinedDefault,
    borderRadius: override?.borderRadius ?? tokens.radii.small,
    borderWidth,
    disabledBackgroundColor: override?.disabledBackgroundColor ?? tokens.colors.backgroundSecondary,
    disabledBorderColor: override?.disabledBorderColor ?? tokens.colors.borderOutlinedDisabled,
    errorColor: override?.errorColor ?? tokens.colors.borderOutlinedError,
    errorTextColor: override?.errorTextColor ?? tokens.colors.textNegative,
    // `fontFamily`/`labelFontSize` stay in the chain: they styled the error text before the
    // error token existed, so a merchant already setting them keeps working.
    errorFontFamily: override?.errorFontFamily ?? override?.fontFamily ?? tokens.typography.error.fontFamily,
    errorFontSize: override?.errorFontSize ?? override?.labelFontSize ?? tokens.typography.error.fontSize,
    fieldHeight: override?.fieldHeight ?? tokens.sizes.xxlarge,
    errorBorderWidth,
    focusedBorderWidth,
    fontFamily: override?.fontFamily ?? tokens.typography.fontFamily,
    fontSize: override?.fontSize ?? tokens.typography.bodyLarge.fontSize,
    labelColor: override?.labelColor ?? tokens.colors.textPrimary,
    labelFontSize: override?.labelFontSize ?? tokens.typography.bodySmall.fontSize,
    placeholderColor: override?.placeholderColor ?? tokens.colors.textPlaceholder,
    primaryColor: override?.primaryColor ?? tokens.colors.borderOutlinedFocus,
    textColor: override?.textColor ?? tokens.colors.textOutlinedDefault,
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
    textContentType,
    autoCapitalize = 'none',
    label,
    showLabel = true,
    placeholder,
    error,
    trailingContent,
    onSelectionChange,
    selectionColor,
    returnKeyType,
    onSubmitEditing,
    theme: themeOverride,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    accessibilityLabel,
    testID,
  },
  ref
) {
  const tokens = usePrimerTheme();
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

  const hasError = !!error;
  const currentBorderWidth = hasError
    ? resolved.errorBorderWidth
    : isFocused
      ? resolved.focusedBorderWidth
      : resolved.borderWidth;
  const borderWidthDiff = currentBorderWidth - resolved.borderWidth;

  // Error takes precedence over focus — the validation signal is more important than the
  // focus hint. Disabled still wins over both (you can't have errors on a non-editable field).
  const borderColor = !editable
    ? resolved.disabledBorderColor
    : hasError
      ? resolved.errorColor
      : isFocused
        ? resolved.primaryColor
        : resolved.borderColor;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {},
        error: {
          color: resolved.errorTextColor,
          fontFamily: resolved.errorFontFamily,
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
          textContentType={textContentType}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor={resolved.placeholderColor}
          onSelectionChange={onSelectionChange}
          selectionColor={selectionColor ?? resolved.primaryColor}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType !== 'next'}
          inputAccessoryViewID={Platform.OS === 'ios' ? PRIMER_EMPTY_ACCESSORY_ID : undefined}
          accessibilityState={{ disabled: !editable }}
          accessibilityLabel={accessibilityLabel ?? label}
          aria-invalid={hasError}
          testID={testID ? `${testID}-input` : undefined}
        />
        {trailingContent}
      </View>
      {hasError && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.error, errorStyle]}
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      )}
    </View>
  );
});
