import { buildRawData } from '../../Components/internal/screens/buildRawData';

// The payload shape is chosen by payment method type, not by which fields happen to be present.
describe('buildRawData', () => {
  it('maps a BLIK one-time code (iOS OTP) to { otp }', () => {
    expect(buildRawData('ADYEN_BLIK', { OTP: '123456' })).toEqual({ otp: '123456' });
  });

  it('maps the Android OTP_CODE key to { otp } as well', () => {
    expect(buildRawData('ADYEN_BLIK', { OTP_CODE: '654321' })).toEqual({ otp: '654321' });
  });

  it('picks the shape by type, ignoring unrelated fields', () => {
    expect(buildRawData('ADYEN_BLIK', { OTP: '111', PHONE_NUMBER: '+44123' })).toEqual({ otp: '111' });
  });

  it('maps a phone number (MBWay) to { phoneNumber }', () => {
    expect(buildRawData('ADYEN_MBWAY', { PHONE_NUMBER: '+351912345678' })).toEqual({ phoneNumber: '+351912345678' });
  });

  it('maps Bancontact card-fields to the card-data shape', () => {
    expect(
      buildRawData('ADYEN_BANCONTACT_CARD', {
        CARD_NUMBER: '4111',
        EXPIRY_DATE: '03/30',
        CARDHOLDER_NAME: 'John Smith',
      })
    ).toEqual({ cardNumber: '4111', expiryDate: '03/30', cardholderName: 'John Smith' });
  });

  it('defaults missing Bancontact fields to empty strings', () => {
    expect(buildRawData('ADYEN_BANCONTACT_CARD', { CARD_NUMBER: '4111' })).toEqual({
      cardNumber: '4111',
      expiryDate: '',
      cardholderName: '',
    });
  });

  it('returns an empty payload for an unknown type — no silent card fallthrough', () => {
    expect(buildRawData('SOMETHING_ELSE', { OTP: '123', CARD_NUMBER: '4111' })).toEqual({});
  });
});
