import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';
import { usePrimerTheme } from '../internal/theme';
import { LINE_HEIGHT_RATIO } from './dimensions';
import type { PrimerTextInputProps, PrimerTextInputRef, PrimerTextInputTheme } from '../types/CardInputTypes';
import type { PrimerTokens, PrimerTypographyStyle } from '../internal/theme/types';

// Shared nativeID for an empty InputAccessoryView rendered once in CheckoutSheet.
// Suppresses iOS's auto-added Previous/Next/Done navigation toolbar above the keyboard.
export const PRIMER_EMPTY_ACCESSORY_ID = 'primer-empty-input-accessory';

// A line height set by the merchant wins. Otherwise the style's own token, unless the merchant
// sized this one input by hand, in which case the line grows with the text rather than clipping it.
function scaledLineHeight(
  override: number | undefined,
  overriddenFontSize: number | undefined,
  style: PrimerTypographyStyle
): number {
  if (override != null) return override;
  if (overriddenFontSize != null) return Math.round(overriddenFontSize * LINE_HEIGHT_RATIO);
  return style.lineHeight;
}

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
    disabledBackgroundColor: override?.disabledBackgroundColor ?? tokens.colors.backgroundOutlinedDisabled,
    disabledBorderColor: override?.disabledBorderColor ?? tokens.colors.borderOutlinedDisabled,
    errorColor: override?.errorColor ?? tokens.colors.borderOutlinedError,
    errorTextColor: override?.errorTextColor ?? tokens.colors.textNegative,
    // `fontFamily`/`labelFontSize` stay in the chain: they styled the error text before the
    // error token existed, so a merchant already setting them keeps working.
    errorFontFamily: override?.errorFontFamily ?? override?.fontFamily ?? tokens.typography.error.fontFamily,
    errorFontSize: override?.errorFontSize ?? override?.labelFontSize ?? tokens.typography.error.fontSize,
    errorFontWeight: (override?.errorFontWeight ?? tokens.typography.error.fontWeight) as TextStyle['fontWeight'],
    errorLetterSpacing: override?.errorLetterSpacing ?? tokens.typography.error.letterSpacing,
    errorLineHeight: scaledLineHeight(
      override?.errorLineHeight,
      override?.errorFontSize ?? override?.labelFontSize,
      tokens.typography.error
    ),
    fieldHeight: override?.fieldHeight ?? tokens.sizes.xxlarge,
    errorBorderWidth,
    focusedBorderWidth,
    // The per-style font, not the brand font, so a merchant setting only bodyLarge.fontFamily
    // reaches the field. The brand font still reaches it, through the style's own default.
    fontFamily: override?.fontFamily ?? tokens.typography.bodyLarge.fontFamily,
    fontSize: override?.fontSize ?? tokens.typography.bodyLarge.fontSize,
    fontWeight: (override?.fontWeight ?? tokens.typography.bodyLarge.fontWeight) as TextStyle['fontWeight'],
    letterSpacing: override?.letterSpacing ?? tokens.typography.bodyLarge.letterSpacing,
    lineHeight: scaledLineHeight(override?.lineHeight, override?.fontSize, tokens.typography.bodyLarge),
    labelColor: override?.labelColor ?? tokens.colors.textPrimary,
    labelFontFamily: override?.fontFamily ?? tokens.typography.bodySmall.fontFamily,
    labelFontSize: override?.labelFontSize ?? tokens.typography.bodySmall.fontSize,
    labelFontWeight: (override?.labelFontWeight ?? tokens.typography.bodySmall.fontWeight) as TextStyle['fontWeight'],
    labelLetterSpacing: override?.labelLetterSpacing ?? tokens.typography.bodySmall.letterSpacing,
    labelLineHeight: scaledLineHeight(override?.labelLineHeight, override?.labelFontSize, tokens.typography.bodySmall),
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
    leadingContent,
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
  // Error beats focus beats resting.
  const currentBorderWidth = useMemo(() => {
    if (hasError) return resolved.errorBorderWidth;
    if (isFocused) return resolved.focusedBorderWidth;
    return resolved.borderWidth;
  }, [hasError, isFocused, resolved]);
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
          fontWeight: resolved.errorFontWeight,
          letterSpacing: resolved.errorLetterSpacing,
          lineHeight: resolved.errorLineHeight,
          marginTop: tokens.spacing.xsmall,
        },
        input: {
          color: editable ? resolved.textColor : tokens.colors.textDisabled,
          flex: 1,
          fontFamily: resolved.fontFamily,
          fontSize: resolved.fontSize,
          fontWeight: resolved.fontWeight,
          letterSpacing: resolved.letterSpacing,
          lineHeight: resolved.lineHeight,
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
          color: editable ? resolved.labelColor : tokens.colors.textDisabled,
          fontFamily: resolved.labelFontFamily,
          fontSize: resolved.labelFontSize,
          fontWeight: resolved.labelFontWeight,
          letterSpacing: resolved.labelLetterSpacing,
          lineHeight: resolved.labelLineHeight,
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
        {leadingContent}
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
