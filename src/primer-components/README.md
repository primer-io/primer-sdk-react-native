# Primer Components for React Native

With **Primer Components** you can tap into the full suite of **Primer Universal Checkout** features while retaining complete control over the look and feel of your UI.

To get started with Components in React Native, simply insert the `usePrimer` hook in the component where you wish to render your checkout:

```tsx
import { usePrimer } from 'primer';

const MyComponent = () => {
  const { event, showCheckout } = usePrimer();

  // ...
};
```

## Handle events

Next use the event variable of the hook to determine how to render the 7 different UI states of the checkout like this:

```tsx
const MyComponent = () => {
  const { event, showCheckout } = usePrimer();

  const renderCheckout = (): ReactElement => {
    // switch case through all possible events & return the desired view component.
    switch (event.state) {
      case 'void':
        return <Button onClick={() => showCheckout()}>Show Checkout</Button>;
      case 'createClientSession':
      // return view component while generating new client token
      case 'loading':
      // return loading screen component
      case 'selectPaymentMethod':
      // return view component for selecting payment method.
      case 'form':
      // return form component
      case 'success':
      // return success screen component
      case 'error':
      // return error screen component
    }
  };

  return renderCheckout();
};
```

## Configure resolvable events

Some events (`createClientSession`, `selectPaymentMethod`, `form`) require you to call an `event.resolve` method to continue the checkout flow. For example, for the event `createClientSession`, you must generate asynchronously your own client token and `resolve` by passing in the new client token string like this:

```tsx
case "createClientSession":
  const onLoad = () => api.generateClientToken((t) => event.resolve(t)); // API call
  return <CheckoutLoading onLoad={onLoad} />; // custom loading UI component.
```

## Set up forms

A common checkout state is to collect user data through some kind of form. In Primer Components, this is handled through the `form` event state. This event object has an `inputs` property that contains an array of configuration details for the required inputs of the form. You must use these details to render your form using the `PrimerInput` custom react component:

```tsx
case "form":
  return return (
    <View>
      {event.inputs.map((input) => {
        return <PrimerInput key={input.type} inputType={input.type} />;
      })}
      <Button onClick={() => event.resolve()}>Submit</Button>
    </View>
  );

```

- You can style the `PrimerInput` component exactly the same way you would for a regular input component.
- The possible input types are `cardholderName`, `cardNumber`, `cvv`, `expiry`, `addressLine1`, `addressLine2`, `city`, `country`, `postalCode`, and `state`.
- Each input config also contains a `validationError` property. Use this to display any validation error UI.
