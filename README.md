<img src="./assets/cover.png"  width="100%"/>

<h1 align="center"><img src="./assets/primer-logo.png" height="24px">Primer React Native SDK</h1>

<h3 align="center">

Official React Native SDK plugin for [Primer](https://primer.io)

</h3>

<p align="center">
<img src="https://img.shields.io/npm/v/@primer-io/react-native" />
</p>

---

The simplest payments integration, ever. Integrate payments once with just a few lines of code, and empower ops teams to automate complex business logic with Primer.

### Features of the React Native SDK

- 💳 Create great payment experiences with our Universal Checkout

- 🧩 Connect and configure new payment methods with only a few lines of code

- ✅ Dynamically handle 3DS 2.0 across processors and be SCA ready

- ♻️ Store payment methods for one-click checkout, recurring and repeat payments

- 🔒 Always PCI compliant without redirecting customers

## 💾 Installation

```sh
npm i @primer-io/react-native
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

For more info & help troubleshooting, check out our 🔥 [docs](https://www.notion.so/primerapi/Quick-Start-1f12ad53684543a3ab3c93d5173670f5)

## 📚 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
