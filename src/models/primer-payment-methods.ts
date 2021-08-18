const vaultPaymentMethods = [
  'Card',
  'PayPal',
  'Klarna',
  'GoCardless',
  'Any',
] as const;

type VaultPaymentMethod = typeof vaultPaymentMethods[number];

const directCheckoutPaymentMethods = [
  'Card',
  'PayPal',
  'Klarna',
  'ApplePay',
  'GooglePay',
  'Any',
] as const;

type DirectCheckoutPaymentMethod = typeof directCheckoutPaymentMethods[number];
