import type { PrimerRawData } from '../../../models/PrimerRawData';

export type RawFieldValues = Record<string, string>;

/**
 * Builds the `PrimerRawData` payload for a method from its collected field values. The shape is
 * chosen by payment method type — BLIK → OTP, MBWay → phone number, Bancontact → card fields — not
 * by which keys happen to be present. `PrimerRawData` is open, so each shape is assignable.
 */
export function buildRawData(type: string, values: RawFieldValues): PrimerRawData {
  switch (type) {
    case 'ADYEN_BLIK':
      return { otp: values.OTP ?? values.OTP_CODE ?? '' };
    case 'ADYEN_MBWAY':
      return { phoneNumber: values.PHONE_NUMBER ?? '' };
    case 'ADYEN_BANCONTACT_CARD':
      return {
        cardNumber: values.CARD_NUMBER ?? '',
        expiryDate: values.EXPIRY_DATE ?? '',
        cardholderName: values.CARDHOLDER_NAME ?? '',
      };
    default:
      return {}; // unreachable — routing allowlists these three types
  }
}
