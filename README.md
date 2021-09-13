<h1 align="center"> Primer React Native SDK</h1>

<h3 align="center">

Official React Native SDK plugin for [Primer](https://primer.io)

</h3>

## 💾 Installation

```sh
npm install @primer-io/react-native
```

## 🔧 Usage

```js
import { Primer } from '@primer-io/react-native';

// fetch Primer client token from backend.
const token: string = await fetchClientToken();

// configure settings, theme, and listeners.
const onTokenizeSuccess: OnTokenizeSuccessCallback = (t, handler) => {
  setPaymentInstrument(t);
  handler.resumeWithSuccess(); // call this to resume the checkout flow.
};

const config = { onTokenizeSuccess };

// show Universal Checkout with client token and config.
Primer.showUniversalCheckout(token, config);
```

## 📚 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
