export type PrimerFlow = PrimerVaultFlow | PrimerCheckoutFlow;

interface PrimerVaultFlow {
  intent: 'Vault';
  paymentMethod?: VaultPaymentMethod;
}

interface PrimerCheckoutFlow {
  intent: 'Checkout';
  paymentMethod?: DirectCheckoutPaymentMethod;
}
