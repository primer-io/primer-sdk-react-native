# Data Model: useCardForm() Hook

## Entities

### UseCardFormOptions (hook input)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| collectCardholderName | boolean | No | Whether to include cardholder name in required fields. Default: false |
| onValidationChange | callback | No | Called when validation state changes (isValid, errors) |
| onMetadataChange | callback | No | Called when card metadata changes (network detection) |
| onBinDataChange | callback | No | Called when BIN data changes |

### UseCardFormReturn (hook output)

| Field | Type | Description |
|-------|------|-------------|
| cardNumber | string | Formatted card number (with spaces) |
| expiryDate | string | Formatted expiry (MM/YY) |
| cvv | string | CVV digits |
| cardholderName | string | Cardholder name |
| updateCardNumber | (value: string) => void | Card number updater |
| updateExpiryDate | (value: string) => void | Expiry updater |
| updateCVV | (value: string) => void | CVV updater |
| updateCardholderName | (value: string) => void | Name updater |
| isValid | boolean | Overall form validity from native SDK |
| errors | CardFormErrors | Per-field errors (only for touched fields) |
| markFieldTouched | (field: CardFormField) => void | Mark a field as touched |
| submit | () => Promise\<void\> | Trigger tokenization. No-op if invalid or already submitting |
| isSubmitting | boolean | Whether submission is in progress |
| requiredFields | PrimerInputElementType[] | Required fields from merchant config |
| binData | PrimerBinData \| null | Card network detection data |
| reset | () => void | Clear all fields and state |

### CardFormErrors

```
Partial<Record<'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName', string>>
```

Only contains entries for touched fields with active errors. Empty object = no visible errors.

### CardFormField (union type)

```
'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName'
```

## State Transitions

### Hook Lifecycle

```
[Mounted] → [Waiting for SDK] → [Configuring Manager] → [Ready]
                                                            ↓
                                              [Field Updates + Validation]
                                                            ↓
                                                      [Submitting]
                                                       ↙        ↘
                                                [Success]    [Error → Ready]
```

### Touched State (per field)

```
[Untouched] → markFieldTouched() → [Touched]
                                        ↓
                              errors visible for this field
```

## Relationships

- `useCardForm` → uses `usePrimerCheckout()` for SDK readiness
- `useCardForm` → creates/manages `RawDataManager` instance internally
- `RawDataManager` → emits validation events → parsed into `CardFormErrors`
- `RawDataManager` → emits BIN data events → stored as `PrimerBinData`
- `submit()` → calls `RawDataManager.submit()` → triggers native tokenization/3DS
