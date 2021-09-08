<h1 align="center"> Primer React Native SDK</h1>

<h3 align="center">

Official React Native SDK plugin for [Primer](https://primer.io)

</h3>

## 🔥 Overview

- 💳 **[Universal Checkout](./packages/universal-checkout/README.md)**: Create your own **best-in-class payment experience** featuring [tons of payment methods](#) with just a couple of lines of code.

- 🔒 **[Vault Manager](./packages/vault-manager/README.md)**: Enable your customer to **save and manage their payment methods**.

## Installation

```sh
npm install @primer-io/react-native
```

## Usage

```js
import { Primer } from '@primer-io/react-native';

// ...

// fetch Primer client token from backend.
const token: string = await fetchClientToken();

// configure settings, theme, and listeners.
Primer.configure({
  onTokenizeSuccess: (
    paymentInstrumentToken: PaymentInstrumentToken,
    callback: any
  ) => {
    // send paymentInstrumentToken to backend and call
    // the Primer payments API.
  },
});

// show Universal Checkout with client token and settings.
Primer.showUniversalCheckout(token);
```

## 🤝 Contributing

Contributions are a huge help on our journey to build the checkout experience of the future. Any contributions you make are **greatly appreciated**.

_For more details, please refer to our [Contribution Guidelines](./CONTRIBUTING.md)._

## 🤙 Get in touch

Need some help? Have an idea to improve the SDK?

Send us a message on our [shared slack channel](#)!

## 📚 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
