import { partnerAssets, pickVariant } from '../../Components/internal/paymentMethodAssetVariant';
import type { AssetVariant } from '../../Components/internal/paymentMethodAssetVariant';
import type { PaymentMethodItem } from '../../Components/types/PaymentMethodTypes';
import type { IPrimerAsset } from '../../models/PrimerPaymentMethodResource';

describe('pickVariant', () => {
  // The same cases as the Android SDK's PaymentMethodItemAssetTest.
  it.each<[IPrimerAsset, boolean, AssetVariant | null]>([
    [{ colored: 'c', light: 'l', dark: 'd' }, false, 'colored'],
    [{ colored: 'c', light: 'l', dark: 'd' }, true, 'colored'],
    [{ light: 'l', dark: 'd' }, false, 'light'],
    [{ light: 'l', dark: 'd' }, true, 'dark'],
    [{ dark: 'd' }, false, 'dark'],
    [{ light: 'l' }, true, 'light'],
    [{}, false, null],
  ])('prefers coloured, then the mode, then the other mode: %j, dark %s → %s', (asset, isDark, expected) => {
    expect(pickVariant(asset, isDark)).toBe(expected);
  });

  it('is null without an asset', () => {
    expect(pickVariant(undefined, true)).toBeNull();
  });
});

describe('partnerAssets', () => {
  const LOGOS = { colored: 'file:///colored.png', light: 'file:///light.png', dark: 'file:///dark.png' };

  function itemWith(logo: IPrimerAsset, background: IPrimerAsset): PaymentMethodItem {
    return {
      type: 'PAYPAL',
      name: 'PayPal',
      // What the public hook picked: never drawn when the resource has assets.
      logo: 'file:///hook.png',
      backgroundColor: '#hook',
      categories: ['NATIVE_UI'],
      intents: ['CHECKOUT'],
      resource: {
        paymentMethodType: 'PAYPAL',
        paymentMethodName: 'PayPal',
        paymentMethodLogo: logo,
        paymentMethodBackgroundColor: background,
      },
      paymentMethod: {
        paymentMethodType: 'PAYPAL',
        paymentMethodManagerCategories: ['NATIVE_UI'],
        supportedPrimerSessionIntents: ['CHECKOUT'],
      },
    };
  }

  it('takes the coloured logo with the coloured background', () => {
    expect(partnerAssets(itemWith(LOGOS, { colored: '#c', light: '#l', dark: '#d' }), true)).toEqual({
      backgroundColor: '#c',
      logo: LOGOS.colored,
    });
  });

  it.each([
    [false, '#l', LOGOS.light],
    [true, '#d', LOGOS.dark],
  ])(
    'puts the mode logo, not the coloured one, on a background with only light and dark (dark %s)',
    (isDark, backgroundColor, logo) => {
      expect(partnerAssets(itemWith(LOGOS, { light: '#l', dark: '#d' }), isDark)).toEqual({ backgroundColor, logo });
    }
  );

  it.each([
    [false, LOGOS.light],
    [true, LOGOS.dark],
  ])('falls back through pickVariant when the background version has no logo (dark %s)', (isDark, logo) => {
    const lightAndDark = { light: LOGOS.light, dark: LOGOS.dark };
    expect(partnerAssets(itemWith(lightAndDark, { colored: '#c' }), isDark)).toEqual({ backgroundColor: '#c', logo });
  });

  it.each([
    [false, LOGOS.light],
    [true, LOGOS.dark],
  ])('uses the mode logo on the sheet colour when there is no background (dark %s)', (isDark, logo) => {
    expect(partnerAssets(itemWith(LOGOS, {}), isDark)).toEqual({ backgroundColor: undefined, logo });
  });

  it('still finds a logo when neither the background nor the mode has one', () => {
    expect(partnerAssets(itemWith({ colored: LOGOS.colored }, {}), false).logo).toBe(LOGOS.colored);
  });

  it('keeps the item logo and background when there are no backend assets', () => {
    const item: PaymentMethodItem = { ...itemWith({}, {}), resource: undefined };
    expect(partnerAssets(item, false)).toEqual({ backgroundColor: '#hook', logo: 'file:///hook.png' });
    const nativeView = { paymentMethodType: 'GOOGLE_PAY', paymentMethodName: 'Google Pay', nativeViewName: 'View' };
    expect(partnerAssets({ ...item, resource: nativeView }, true)).toEqual({
      backgroundColor: '#hook',
      logo: 'file:///hook.png',
    });
  });
});
