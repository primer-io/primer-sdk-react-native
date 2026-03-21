import type { TranslationKey } from '../types';

const en: Record<TranslationKey, string> = {
  // Checkout flow
  'checkout.pay_button': 'Pay',
  'checkout.cancel': 'Cancel',
  'checkout.processing': 'Processing...',
  'checkout.success': 'Payment successful',
  'checkout.pay_amount': 'Pay {{amount}}',

  // Errors
  'error.generic': 'Something went wrong. Please try again.',
  'error.card_declined': 'Your card was declined. Please try a different card.',
  'error.network': 'Network error. Please check your connection.',
  'error.invalid_card': 'Invalid card details. Please check and try again.',

  // Card form labels
  'card.number_label': 'Card number',
  'card.expiry_label': 'Expiry date',
  'card.cvv_label': 'CVV',
  'card.cardholder_label': 'Cardholder name',

  // Accessibility
  'a11y.card_number_field': 'Card number input field',
  'a11y.expiry_field': 'Expiry date input field',
  'a11y.cvv_field': 'Security code input field',
  'a11y.cardholder_field': 'Cardholder name input field',
  'a11y.pay_button': 'Pay now',
  'a11y.close_button': 'Close',
};

export default en;
