export interface PrimerException {
  name: PrimerNativeExceptionType;
  description?: String;
}

const exceptions = [
  'ParseJsonFailed',
  'InitFailed',
  'CheckoutFlowFailed',
  'TokenizationFailed',
] as const;

type PrimerNativeExceptionType = typeof exceptions[number];
