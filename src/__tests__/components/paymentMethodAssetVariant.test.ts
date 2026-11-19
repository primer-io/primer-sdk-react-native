import { partnerAssets } from '../../Components/internal/paymentMethodAssetVariant';
import type { PaymentMethodItem } from '../../Components/types/PaymentMethodTypes';
import type { IPrimerAsset } from '../../models/PrimerPaymentMethodResource';

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

  it.each([false, true])('takes the coloured logo with the coloured background (dark %s)', (isDark) => {
    expect(partnerAssets(itemWith(LOGOS, { colored: '#c', light: '#l', dark: '#d' }), isDark)).toEqual({
      backgroundColor: '#c',
      logo: LOGOS.colored,
    });
  });

  it('gives each mode its own background and logo when there is no coloured background', () => {
    const item = itemWith(LOGOS, { light: '#l', dark: '#d' });

    expect(partnerAssets(item, false)).toEqual({ backgroundColor: '#l', logo: LOGOS.light });
    expect(partnerAssets(item, true)).toEqual({ backgroundColor: '#d', logo: LOGOS.dark });
  });

  it('takes the other mode when the current one has no background', () => {
    expect(partnerAssets(itemWith(LOGOS, { dark: '#d' }), false)).toEqual({ backgroundColor: '#d', logo: LOGOS.dark });
    expect(partnerAssets(itemWith(LOGOS, { light: '#l' }), true)).toEqual({ backgroundColor: '#l', logo: LOGOS.light });
  });

  it('uses the mode logo on the sheet colour when there is no background', () => {
    const item = itemWith(LOGOS, {});

    expect(partnerAssets(item, false)).toEqual({ backgroundColor: undefined, logo: LOGOS.light });
    expect(partnerAssets(item, true)).toEqual({ backgroundColor: undefined, logo: LOGOS.dark });
  });

  it('falls back to the mode logo when the background version has no logo', () => {
    const item = itemWith({ light: LOGOS.light, dark: LOGOS.dark }, { colored: '#c' });

    expect(partnerAssets(item, false)).toEqual({ backgroundColor: '#c', logo: LOGOS.light });
    expect(partnerAssets(item, true)).toEqual({ backgroundColor: '#c', logo: LOGOS.dark });
  });

  it('still finds a logo when neither the background nor the mode has one', () => {
    expect(partnerAssets(itemWith({ colored: LOGOS.colored }, {}), false).logo).toBe(LOGOS.colored);
  });

  it('leaves the logo out when there is none', () => {
    expect(partnerAssets(itemWith({}, { colored: '#c' }), false).logo).toBeUndefined();
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
