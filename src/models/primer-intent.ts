export type PrimerIntent = PrimerVaultIntent | PrimerCheckoutIntent;

interface PrimerVaultIntent {
  flow: 'Vault';
  paymentMethod?: VaultPaymentMethod;
}

interface PrimerCheckoutIntent {
  flow: 'Checkout';
  paymentMethod?: DirectCheckoutPaymentMethod;
}
