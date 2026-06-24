import type { PrimerRawData } from '../../../models/PrimerRawData';

export type RawFieldValues = Record<string, string>;

/**
 * Maps the collected input values to the right `PrimerRawData` shape by which keys are present:
 * a one-time code (BLIK — `OTP`/`OTP_CODE`), a phone number (MBWay), or Bancontact card-fields.
 * `PrimerRawData` is an open interface, so each shape is assignable.
 */
export function buildRawData(values: RawFieldValues): PrimerRawData {
  const otp = values.OTP ?? values.OTP_CODE;
  if (otp != null) {
    return { otp };
  }
  if (values.PHONE_NUMBER != null) {
    return { phoneNumber: values.PHONE_NUMBER };
  }
  return {
    cardNumber: values.CARD_NUMBER ?? '',
    expiryDate: values.EXPIRY_DATE ?? '',
    cardholderName: values.CARDHOLDER_NAME ?? '',
  };
}
