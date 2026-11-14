import { titleCaseFromType } from './utils/formatting';

export const IDEAL_TYPE_SUFFIX = '_IDEAL';
const IDEAL_NAME = 'iDEAL | Wero';

export function getSavedMethodName(paymentMethodType: string, sessionName?: string): string {
  if (paymentMethodType.endsWith(IDEAL_TYPE_SUFFIX)) return IDEAL_NAME;
  return sessionName ?? titleCaseFromType(paymentMethodType);
}
