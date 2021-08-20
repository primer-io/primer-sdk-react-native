export interface PrimerException {
  name: PrimerNativeExceptionType;
  description?: String;
}

const exceptions = [
  'ParseJsonFailed',
  'InitFailed',
  'CheckoutFlowFailed',
  'TokenizationFailed',
  'clientTokenNotConfigured',
  'settingsNotConfigured',
  'invalidPrimerIntent',
  'noIosViewController',
] as const;

type PrimerNativeExceptionType = typeof exceptions[number];
