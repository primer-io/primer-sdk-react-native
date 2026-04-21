# Data Model: Loading & Status Screens

**Feature**: 005-loading-status-screens  
**Date**: 2026-04-02

## Entities

### StatusScreenLayout (shared layout)

Encapsulates the common visual structure shared by all status screens.

| Field | Type | Description |
|-------|------|-------------|
| icon | ReactNode | 56px icon element (spinner, checkmark, warning) |
| title | string | Primary message (body/large typography) |
| subtitle | string | Secondary message (body/medium typography) |

**Layout rules**:
- Icon: 56x56px, centered
- Gap between icon and text area: `spacing.small` (8px)
- Gap between title and subtitle: `spacing.xsmall` (4px)
- Vertical padding: 48px (3 × `spacing.large`)
- Horizontal padding: `spacing.xxxlarge` (32px)
- All content centered horizontally

### StatusScreenButton

Interactive button used on the error screen.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Button label text |
| onPress | () => void | Tap handler |
| variant | 'primary' \| 'outlined' | Visual style variant |

**Visual rules (primary)**:
- Background: `colors.primary` (#2f98ff)
- Text: `colors.background` (white)
- Typography: `typography.titleLarge`
- Border radius: `radii.medium` (8px)
- Padding: `spacing.medium` (12px)

**Visual rules (outlined)**:
- Background: `colors.background` (white)
- Border: `borders.default` width, `colors.border` color
- Text: `colors.textPrimary`
- Typography: `typography.titleLarge`
- Border radius: `radii.medium` (8px)
- Padding: `spacing.medium` (12px)

**Button group rules**:
- Gap between buttons: `spacing.small` (8px)
- Full width within container

## Existing Entities (from dependency chain)

### CheckoutRoute (enum — already defined)

Routes relevant to this feature:
- `loading` — params: `undefined`
- `processing` — params: `undefined`
- `success` — params: `{ checkoutData?: unknown }`
- `error` — params: `{ error: PrimerError }`
- `splash` — params: `undefined`

### PrimerError (class — already defined)

Fields used by the error screen:
- `errorId: string`
- `description: string`
- `recoverySuggestion?: string`

### PrimerTokens (interface — already defined)

Token categories used by status screens:
- `colors`: `primary`, `background`, `success`, `error`, `iconPositive`, `iconNegative`, `textPrimary`, `textSecondary`, `border`
- `spacing`: `xsmall` (4), `small` (8), `medium` (12), `large` (16), `xxxlarge` (32)
- `typography`: `bodyLarge`, `bodyMedium`, `titleLarge`
- `radii`: `medium` (8)
- `borders`: `default` (1)

## State

No new state management introduced in this phase. Screens are stateless visual components — state machine integration is deferred to a follow-up ticket.
