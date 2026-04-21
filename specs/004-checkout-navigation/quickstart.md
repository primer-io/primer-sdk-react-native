# Quickstart: Checkout Navigation & Route System

**Feature**: 004-checkout-navigation | **Date**: 2026-03-27

## Usage

### 1. Wrap checkout content with NavigationProvider

```tsx
import { NavigationProvider, CheckoutRoute } from './Components/internal/navigation';

function CheckoutContent() {
  return (
    <NavigationProvider
      initialRoute={CheckoutRoute.methodSelection}
    >
      <NavigationContainer screenMap={screenMap} />
    </NavigationProvider>
  );
}
```

### 2. Define screen map

```tsx
const screenMap: Record<CheckoutRoute, React.ComponentType> = {
  [CheckoutRoute.methodSelection]: MethodSelectionScreen,
  [CheckoutRoute.cardForm]: CardFormScreen,
  [CheckoutRoute.processing]: ProcessingScreen,
  [CheckoutRoute.success]: SuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
  // ... other screens
};
```

### 3. Navigate from a screen

```tsx
import { useNavigation, useRoute, CheckoutRoute } from './Components/internal/navigation';

function MethodSelectionScreen() {
  const { push } = useNavigation();

  const handleSelectCard = () => {
    push(CheckoutRoute.cardForm, { paymentMethodType: 'PAYMENT_CARD' });
  };

  return <Button onPress={handleSelectCard} title="Pay with Card" />;
}
```

### 4. Read route parameters

```tsx
function CardFormScreen() {
  const { params } = useRoute<CheckoutRoute.cardForm>();
  // params.paymentMethodType is typed as string
  return <Text>Entering card for {params.paymentMethodType}</Text>;
}
```

### 5. Add a header to a screen

```tsx
import { NavigationHeader } from './Components/internal/navigation';

function CardFormScreen() {
  const { params } = useRoute<CheckoutRoute.cardForm>();

  return (
    <View>
      <NavigationHeader
        showBackButton
        centerTitle="Card Details"
      />
      {/* screen content */}
    </View>
  );
}
```

### 6. Replace a transient screen

```tsx
function ProcessingScreen() {
  const { replace } = useNavigation();

  useEffect(() => {
    processPayment().then((result) => {
      if (result.success) {
        replace(CheckoutRoute.success, { checkoutData: result.data });
      } else {
        replace(CheckoutRoute.error, { error: result.error });
      }
    });
  }, []);

  return <LoadingSpinner />;
}
```

## File Structure

```
src/Components/internal/navigation/
├── index.ts                    # Public exports
├── types.ts                    # CheckoutRoute, RouteParamMap, NavigationState
├── NavigationContext.ts         # React context definition
├── navigationReducer.ts        # State reducer (push/pop/replace/popToRoot)
├── NavigationProvider.tsx       # Provider component + BackHandler
├── NavigationContainer.tsx      # Screen renderer with transitions
├── NavigationHeader.tsx         # Generic header component
├── useNavigation.ts            # Hook for navigation actions
└── useRoute.ts                 # Hook for reading current route + params
```

## Testing

```tsx
// Wrap component under test with NavigationProvider
import { NavigationProvider, CheckoutRoute } from './Components/internal/navigation';

function renderWithNavigation(component, route, params) {
  return render(
    <NavigationProvider initialRoute={route} initialParams={params}>
      {component}
    </NavigationProvider>
  );
}
```
