import { routeMethodSelection } from '../../Components/internal/routeMethodSelection';

// The classifier is load-bearing for both `usePrimerPaymentMethod` and `MethodSelectionScreen`,
// so the two route a method the same way. Categories mirror RN Headless manager categories.
describe('routeMethodSelection', () => {
  it('routes PAYMENT_CARD to card (by type, regardless of category)', () => {
    expect(routeMethodSelection('PAYMENT_CARD', ['RAW_DATA'])).toBe('card');
  });

  it('routes a NATIVE_UI method to nativeUi', () => {
    expect(routeMethodSelection('GOOGLE_PAY', ['NATIVE_UI'])).toBe('nativeUi');
  });

  it('routes pure-redirect NATIVE_UI APMs (Twint/Sofort) to nativeUi', () => {
    expect(routeMethodSelection('ADYEN_TWINT', ['NATIVE_UI'])).toBe('nativeUi');
    expect(routeMethodSelection('ADYEN_SOFORT', ['NATIVE_UI'])).toBe('nativeUi');
  });

  it('routes a COMPONENT_WITH_REDIRECT method (iDEAL/Dotpay) to bankSelection', () => {
    expect(routeMethodSelection('ADYEN_IDEAL', ['COMPONENT_WITH_REDIRECT'])).toBe('bankSelection');
    expect(routeMethodSelection('ADYEN_DOTPAY', ['COMPONENT_WITH_REDIRECT'])).toBe('bankSelection');
  });

  it('routes a non-card RAW_DATA method to unsupported until the rawDataForm split lands in #394', () => {
    expect(routeMethodSelection('ADYEN_BANCONTACT_CARD', ['RAW_DATA'])).toBe('unsupported');
  });

  it('returns unsupported for a category that is not yet routed', () => {
    expect(routeMethodSelection('SOME_FUTURE_METHOD', ['CARD_COMPONENTS'])).toBe('unsupported');
  });

  it('returns unsupported when the method is absent from the session (no categories)', () => {
    expect(routeMethodSelection('GOOGLE_PAY', [])).toBe('unsupported');
  });
});
