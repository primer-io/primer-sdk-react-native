# Data Model: Card Input Components

## Entities

### CardInputBase (internal)

The shared rendering component used by all four public input components.

**State**:
- `isFocused: boolean` — local focus state, managed internally via onFocus/onBlur
- All other state comes from the `cardForm` prop (UseCardFormReturn)

**Derived values** (computed from cardForm + local state):
- `value: string` — from cardForm[fieldName]
- `error: string | undefined` — from cardForm.errors[fieldName]
- `borderColor: string` — error state → errorColor, focused → focusedColor, default → borderColor
- `editable: boolean` — `!cardForm.isSubmitting`

### CardInputTheme (merchant-facing)

Optional visual overrides that layer on top of SDK PrimerTokens.

| Property         | Maps to PrimerToken           | Default source             |
|------------------|-------------------------------|----------------------------|
| primaryColor     | colors.borderFocused          | tokens.colors.borderFocused |
| errorColor       | colors.borderError + error    | tokens.colors.borderError   |
| textColor        | colors.textPrimary            | tokens.colors.textPrimary   |
| placeholderColor | colors.textPlaceholder        | tokens.colors.textPlaceholder |
| backgroundColor  | colors.background             | tokens.colors.background    |
| borderColor      | colors.border                 | tokens.colors.border        |
| borderWidth      | borders.input                 | tokens.borders.input        |
| borderRadius     | radii.medium                  | tokens.radii.medium         |
| fontSize         | typography.bodyLarge.fontSize  | tokens.typography.bodyLarge.fontSize |
| fontFamily       | typography.fontFamily          | tokens.typography.fontFamily |
| fieldHeight      | (custom)                      | 48                          |

### Field Configuration (internal, per-component)

| Component           | Hook field       | keyboardType | maxLength | secureText | autoComplete | autoCapitalize |
|---------------------|------------------|-------------|-----------|------------|-------------|----------------|
| CardNumberInput     | cardNumber       | number-pad  | 19        | false      | cc-number   | none           |
| ExpiryDateInput     | expiryDate       | number-pad  | 5         | false      | cc-exp      | none           |
| CVVInput            | cvv              | number-pad  | 4         | true       | cc-csc      | none           |
| CardholderNameInput | cardholderName   | default     | none      | false      | name        | words          |

### State Transitions (focus + error)

```
Initial → [no value, no error, not focused]
  ↓ tap
Focused → [editing, no error shown, focused border]
  ↓ blur
Touched → [error shown if invalid, default border]
  ↓ tap again
Focused+Touched → [error still shown, focused border]
  ↓ blur
Touched → [updated error if still invalid]
  ↓ form submit
Submitting → [editable=false, all fields locked]
  ↓ complete/error
Touched → [back to normal state]
```
