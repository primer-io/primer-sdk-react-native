import { buildRawData } from '../../Components/internal/screens/buildRawData';

describe('buildRawData', () => {
  it('maps a BLIK one-time code (OTP) to { otp }', () => {
    expect(buildRawData({ OTP: '123456' })).toEqual({ otp: '123456' });
  });

  it('maps the Android OTP_CODE key to { otp } as well', () => {
    expect(buildRawData({ OTP_CODE: '654321' })).toEqual({ otp: '654321' });
  });

  it('prefers the one-time code over a phone number when both are present', () => {
    expect(buildRawData({ OTP: '111', PHONE_NUMBER: '+44123' })).toEqual({ otp: '111' });
  });

  it('maps a phone number (MBWay) to { phoneNumber }', () => {
    expect(buildRawData({ PHONE_NUMBER: '+351912345678' })).toEqual({ phoneNumber: '+351912345678' });
  });

  it('maps Bancontact card-fields to the card-data shape', () => {
    expect(buildRawData({ CARD_NUMBER: '4111', EXPIRY_DATE: '03/30', CARDHOLDER_NAME: 'John Smith' })).toEqual({
      cardNumber: '4111',
      expiryDate: '03/30',
      cardholderName: 'John Smith',
    });
  });

  it('defaults missing card-fields to empty strings', () => {
    expect(buildRawData({ CARD_NUMBER: '4111' })).toEqual({
      cardNumber: '4111',
      expiryDate: '',
      cardholderName: '',
    });
  });
});
