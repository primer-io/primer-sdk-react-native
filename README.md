<h1 align="center">Primer React Native SDK</h1>

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

---

## 💾 Installation

```sh
npm i @primer-io/react-native
```

## 🔧 Usage

```js
import { Primer } from '@primer-io/react-native';

// fetch Primer client token from backend.
const token: string = await fetchClientToken();

// configure listeners and settings.
const onTokenizeSuccess = async (t, handler) => {
  const payment = await createPayment(t);
  handler.handleSuccess(); // resume the checkout flow with success message.
};

// show Universal Checkout with client token and config.
Primer.showUniversalCheckout(token, { onTokenizeSuccess });
```

For more info & help troubleshooting, check out our 🔥 [docs](https://www.notion.so/primerio/Quick-Start-6c5eb61e5bbe426ca66244259e06048e)

## 📚 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
