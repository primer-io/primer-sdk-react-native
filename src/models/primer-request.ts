const prinerInitIntent = [
  'vaultWithAny',
  'vaultWithCard',
  'vaultWithKlarna',
  'vaultWithPayPal',
  'vaultWithGooglePay',
  'payWithAny',
  'payWithCard',
  'payWithKlarna',
  'payWithPayPal',
  'payWithGooglePay',
] as const;

type PrimerInitIntent = typeof prinerInitIntent[number];

const primerResumeIntent = ['showError', 'showSuccess'] as const;

type PrimerResumeIntent = typeof primerResumeIntent[number];

export interface IPrimerInitRequest {
  intent: PrimerInitIntent;
  token: String;
  metadata?: IPrimerRequestMetadata;
}

export interface IPrimerResumeRequest {
  intent: PrimerResumeIntent;
  token: String;
  metadata?: IPrimerRequestMetadata;
}

interface IPrimerRequestMetadata {
  message: String;
}
