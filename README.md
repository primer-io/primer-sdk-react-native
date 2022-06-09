<h1 align="center">Primer React Native SDK</h1>

<h3 align="center">

Official React Native SDK plugin for [Primer](https://primer.io)

</h3>

<p align="center">
<img src="https://img.shields.io/npm/v/@primer-io/react-native" />
</p>

**Note:** This quick start guide addresses the platform-specific integration points only. As everything prior to that (e.g. creating a client token) is the same for all the guidelines.

# Set up the Universal Checkout

## Step 1. Install the SDK

Add the SDK package.

```sh
\# With yarn
yarn add @primer-io/react-native

\# With npm
npm i @primer-io/react-native --save
```

Once you are done, navigate to the \/ios folder and run pod install.

## Step 2. Initialize the SDK

Import the Primer SDK, construct your settings and call the SDK’s configure function.

```js
import * as React from 'react';
import {
  Primer,  
  PrimerSettings,
  PrimerCheckoutData
} from '@primer-io/react-native';

const CheckoutScreen = (props: any) => {

  const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
    // Perform an action based on the payment creation response
    // ex. show success screen, redirect to order confirmation view, etc.
  };

  React.useEffect(() => {
    const settings: PrimerSettings = {
      onCheckoutComplete: onCheckoutComplete
    };

    Primer.configure(settings)
      .then(() => {
        // SDK is initialized sucessfully
      })
      .catch (err => {
        // SDK failed to initialize
      })
  }, []);
}
```

## Step 3. Generate a client token

**Note:** Check our guide on how to set up the client session [here](https://primer.io/docs/accept-payments/manage-client-sessions).

Make an API call to your backend to fetch a Client Token. Here is a simple example of how it can be done from your component. Once successful store your Client Token for future use.

```js
const CheckoutScreen = (props: any) => {

  // ...

  const onUniversalCheckoutButtonTapped = async () => {
    try {
      // Make an API request to your backend to create a client session
      // and fetch a client token.
      const clientToken = await createClientSession(clientSessionRequestParams);
    } catch (err) {
      // ...
    }
  };
}
```

## Step 4. Show Universal Checkout

At this step, you should have a Client Token available. Call the `showUniversalCheckout(clientToken)` function, with the Client Token (as shown below) to present Universal Checkout.

```js
const CheckoutScreen = (props: any) => {

  // ...

  const onUniversalCheckoutButtonTapped = async () => {
    try {
      // ...

      // Present Universal Checkout
			await Primer.showUniversalCheckout(clientToken);
    } catch (err) {
      // ...
    }
  };
}
```

## Full Code Snippet

```js
import * as React from 'react';
import {
  Primer,  
  PrimerSettings,
  PrimerCheckoutData
} from '@primer-io/react-native';

const CheckoutScreen = async (props: any) => {

		const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
        // Show a success screen
    };

		const onUniversalCheckoutButtonTapped = async () => {
				const settings: PrimerSettings = {
				    onCheckoutComplete: onCheckoutComplete
				};
				
				// Configure the SDK
				await Primer.configure(settings);
		
				// Ask your backend to create a client session
				const clientToken = await createClientSession(clientSessionRequestParams);

				// Present Universal Checkout
				await Primer.showUniversalCheckout(clientToken);
    };
}
```

You should now be able to see Universal Checkout! The user can now interact with Universal Checkout, and the SDK will create the payment. The payment’s data will be returned in the onCheckoutComplete callback configured in Step 2. 

## 📚 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
