export interface PrimerError {
  name: PrimerErrorType;
  description?: String;
}

const errors = [
  'ParseJsonFailed',
  'InitFailed',
  'CheckoutFlowFailed',
  'TokenizationFailed',
  'clientTokenNotConfigured',
  'settingsNotConfigured',
  'invalidPrimerIntent',
  'noIosViewController',
] as const;

type PrimerErrorType = typeof errors[number];
