# Implementation Plan: Loading & Status Screens

**Branch**: `005-loading-status-screens` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/005-loading-status-screens/spec.md`

## Summary

Implement three generic status screen components (loading, success, error) for the Checkout Components feature, matching Figma designs. These are visual shells with debug navigation — no functional checkout logic. Builds on the navigation system, design tokens, and checkout sheet from PR #336.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native >=0.68 (project targets RN 0.81.1, React 19.1.0)  
**Primary Dependencies**: React Native primitives (View, Text, TouchableOpacity, ActivityIndicator, StyleSheet)  
**Storage**: N/A  
**Testing**: Jest + react-test-renderer (existing pattern from PrimerCheckoutProvider.test.tsx)  
**Target Platform**: iOS and Android (React Native cross-platform)  
**Project Type**: SDK library (React Native module)  
**Performance Goals**: N/A — static visual components  
**Constraints**: No new dependencies; all styling via design tokens; icons built from RN View primitives (no SVG library)  
**Scale/Scope**: 3 screen components + shared layout + button component + 2 icon components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a template with no project-specific principles defined. No gates to check.

**Post-Phase 1 re-check**: No violations. Components follow existing patterns (functional components, useTheme, useMemo + StyleSheet.create, useNavigation/useRoute hooks).

## Project Structure

### Documentation (this feature)

```text
specs/005-loading-status-screens/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Build sequence
└── contracts/
    └── screen-components.md  # Component interfaces
```

### Source Code (new files)

```text
src/Components/internal/screens/
├── index.ts                    # Exports
├── StatusScreenLayout.tsx      # Shared icon + title + subtitle layout
├── CheckoutButton.tsx          # Primary and outlined button variants
├── CheckCircleIcon.tsx         # Green checkmark icon (View-based)
├── WarningTriangleIcon.tsx     # Red warning icon (View-based)
├── LoadingScreen.tsx           # Spinner + loading message
├── SuccessScreen.tsx           # Checkmark + success message
└── ErrorScreen.tsx             # Warning + error message + buttons

src/__tests__/components/screens/
├── StatusScreenLayout.test.tsx
├── CheckoutButton.test.tsx
├── LoadingScreen.test.tsx
├── SuccessScreen.test.tsx
└── ErrorScreen.test.tsx
```

### Files to modify

```text
example/src/screens/NavigationDemoScreen.tsx  # Update screenMap to use real screen components
```

**Structure Decision**: New screen components go in `src/Components/internal/screens/` following the existing `internal/` subdirectory pattern (navigation/, checkout-sheet/, theme/). These are internal SDK components, not exported to consumers.

## Key Implementation Patterns

### Styling pattern (from NavigationHeader.tsx)

```typescript
function MyScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  return <View style={styles.container}>...</View>;
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography, radii } = tokens;
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xxxlarge,
      paddingVertical: 48, // 3 × spacing.large
    },
    title: {
      color: colors.textPrimary,
      ...typography.bodyLarge,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
    },
  });
}
```

### Screen registration pattern (from NavigationDemoScreen.tsx)

```typescript
const screenMap: Partial<Record<CheckoutRoute, React.ComponentType>> = {
  [CheckoutRoute.splash]: LoadingScreen,
  [CheckoutRoute.loading]: LoadingScreen,
  [CheckoutRoute.processing]: LoadingScreen,
  [CheckoutRoute.success]: SuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
};
```

### Token mapping to Figma

| Figma value | Token path |
|-------------|------------|
| Green checkmark circle | `colors.iconPositive` (#3eb68f) |
| Red warning triangle | `colors.iconNegative` (#ff7279) |
| Blue spinner | `colors.primary` (#2f98ff) |
| Title text color | `colors.textPrimary` (#212121) |
| Subtitle text color | `colors.textSecondary` (#757575) |
| Title typography | `typography.bodyLarge` (16px/20px, weight 400) |
| Subtitle typography | `typography.bodyMedium` (14px/20px, weight 400) |
| Button text typography | `typography.titleLarge` (16px/20px, weight 600) |
| Button primary bg | `colors.primary` (#2f98ff) |
| Button primary text | `colors.background` (white) |
| Button outlined border | `colors.border` (#e0e0e0) |
| Button outlined text | `colors.textPrimary` (#212121) |
| Button border radius | `radii.medium` (8px) |
| Button padding | `spacing.medium` (12px) |
| Icon-to-text gap | `spacing.small` (8px) |
| Title-to-subtitle gap | `spacing.xsmall` (4px) |
| Horizontal padding | `spacing.xxxlarge` (32px) |

## Prerequisite

Branch `005-loading-status-screens` must be rebased onto `ov/feat/ACC-6920` before implementation. The navigation system, design tokens, checkout sheet, and route definitions are all on that branch.

## Complexity Tracking

No complexity violations — all components follow existing established patterns.
