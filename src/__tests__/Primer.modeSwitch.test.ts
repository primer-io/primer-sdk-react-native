type FakeEmitter = {
  _subs: Array<{ eventType: string; callback: (...args: any[]) => void; remove: jest.Mock }>;
  addListener: jest.Mock;
  removeAllListeners: jest.Mock;
  emit: (eventType: string, data: any) => void;
};

const makeFakeEmitter = (): FakeEmitter => {
  const em: FakeEmitter = {
    _subs: [],
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: (eventType, data) => {
      em._subs.filter((s) => s.eventType === eventType).forEach((s) => s.callback(data));
    },
  };
  em.addListener.mockImplementation((eventType: string, callback: (...args: any[]) => void) => {
    const sub: any = { eventType, callback };
    sub.remove = jest.fn(() => {
      const i = em._subs.indexOf(sub);
      if (i >= 0) em._subs.splice(i, 1);
    });
    em._subs.push(sub);
    return sub;
  });
  em.removeAllListeners.mockImplementation((eventType?: string) => {
    if (eventType) {
      for (let i = em._subs.length - 1; i >= 0; i--) {
        const sub = em._subs[i];
        if (sub && sub.eventType === eventType) em._subs.splice(i, 1);
      }
    } else {
      em._subs.length = 0;
    }
  });
  return em;
};

jest.mock('../specs/NativePrimer', () => {
  return {
    __esModule: true,
    default: {
      configure: jest.fn().mockResolvedValue(undefined),
      showUniversalCheckoutWithClientToken: jest.fn().mockResolvedValue(undefined),
      showVaultManagerWithClientToken: jest.fn().mockResolvedValue(undefined),
      showPaymentMethod: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
      cleanUp: jest.fn().mockResolvedValue(undefined),
      handleTokenizationNewClientToken: jest.fn(),
      handleTokenizationSuccess: jest.fn(),
      handleTokenizationFailure: jest.fn(),
      handleResumeWithNewClientToken: jest.fn(),
      handleResumeSuccess: jest.fn(),
      handleResumeFailure: jest.fn(),
      handlePaymentCreationAbort: jest.fn(),
      handlePaymentCreationContinue: jest.fn(),
      showErrorMessage: jest.fn(),
      setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
    },
  };
});

jest.mock(
  'react-native',
  () => {
    const emitters: Array<{ module: unknown; emitter: FakeEmitter }> = [];
    const { default: nativePrimer } = jest.requireMock('../specs/NativePrimer');
    const dropInModule = nativePrimer;
    const headlessModule = {
      startWithClientToken: jest.fn().mockResolvedValue({ availablePaymentMethods: [] }),
      cleanUp: jest.fn().mockResolvedValue(undefined),
      handleTokenizationNewClientToken: jest.fn().mockResolvedValue(undefined),
      handleResumeWithNewClientToken: jest.fn().mockResolvedValue(undefined),
      handleCompleteFlow: jest.fn().mockResolvedValue(undefined),
      handlePaymentCreationAbort: jest.fn().mockResolvedValue(undefined),
      handlePaymentCreationContinue: jest.fn().mockResolvedValue(undefined),
      setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
    };

    return {
      NativeModules: {
        NativePrimer: dropInModule,
        PrimerHeadlessUniversalCheckout: headlessModule,
      },
      NativeEventEmitter: jest.fn().mockImplementation((nativeModule: unknown) => {
        const emitter = makeFakeEmitter();
        emitters.push({ module: nativeModule, emitter });
        return emitter;
      }),
      __emitters: emitters,
      __dropInModule: dropInModule,
      __headlessModule: headlessModule,
    };
  },
  { virtual: true }
);

import { Primer } from '../Primer';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';

const rnMock = require('react-native');
const emitters: Array<{ module: unknown; emitter: FakeEmitter }> = rnMock.__emitters;
const dropInModule = rnMock.__dropInModule;
const headlessModule = rnMock.__headlessModule;

const dropInEmitter = () => emitters.find((e) => e.module === dropInModule)!.emitter;
const headlessEmitter = () => emitters.find((e) => e.module === headlessModule)!.emitter;

const payloadError = { error: { errorId: 'native-err', description: 'boom' } };

describe('Primer mode switch — ESC-852', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dropInEmitter()._subs.length = 0;
    headlessEmitter()._subs.length = 0;
  });

  it('Headless → Primer.cleanUp → Drop-in: only the Drop-in onError handler fires', async () => {
    const headlessOnError = jest.fn();
    const dropInOnError = jest.fn();

    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: headlessOnError },
    } as any);

    expect(headlessEmitter()._subs.some((s) => s.eventType === 'onError')).toBe(true);

    Primer.cleanUp();

    expect(headlessEmitter()._subs.filter((s) => s.eventType === 'onError').length).toBe(0);

    await Primer.configure({ onError: dropInOnError } as any);
    await Primer.showUniversalCheckout('tok-d');

    dropInEmitter().emit('onError', payloadError);

    expect(dropInOnError).toHaveBeenCalledTimes(1);
    expect(headlessOnError).not.toHaveBeenCalled();
  });

  it('Headless → Drop-in → Headless: only the latest Headless handler fires', async () => {
    const firstHeadlessOnError = jest.fn();
    const dropInOnError = jest.fn();
    const secondHeadlessOnError = jest.fn();

    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h1', {
      headlessUniversalCheckoutCallbacks: { onError: firstHeadlessOnError },
    } as any);

    await Primer.configure({ onError: dropInOnError } as any);
    await Primer.showUniversalCheckout('tok-d');

    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h2', {
      headlessUniversalCheckoutCallbacks: { onError: secondHeadlessOnError },
    } as any);

    headlessEmitter().emit('onError', payloadError);

    expect(secondHeadlessOnError).toHaveBeenCalledTimes(1);
    expect(firstHeadlessOnError).not.toHaveBeenCalled();
    expect(dropInOnError).not.toHaveBeenCalled();
  });

  it('does not accumulate subscriptions across many mode switches', async () => {
    const onError = jest.fn();

    for (let i = 0; i < 5; i++) {
      await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
        headlessUniversalCheckoutCallbacks: { onError },
      } as any);
      await Primer.configure({ onError } as any);
      await Primer.showUniversalCheckout('tok-d');
    }

    expect(headlessEmitter()._subs.length).toBeLessThanOrEqual(0);
    expect(dropInEmitter()._subs.filter((s) => s.eventType === 'onError').length).toBe(1);
  });

  it('Primer.cleanUp drains both mode subscription arrays', async () => {
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: jest.fn() },
    } as any);
    await Primer.configure({ onError: jest.fn() } as any);
    await Primer.showUniversalCheckout('tok-d');

    Primer.cleanUp();

    expect(dropInEmitter()._subs.length).toBe(0);
    expect(headlessEmitter()._subs.length).toBe(0);
    expect(dropInModule.dismiss).toHaveBeenCalledTimes(1);
  });

  it('HeadlessUniversalCheckout.cleanUp drains headless subscriptions and calls native cleanUp', async () => {
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: jest.fn() },
    } as any);

    expect(headlessEmitter()._subs.length).toBeGreaterThan(0);

    await PrimerHeadlessUniversalCheckout.cleanUp();

    expect(headlessEmitter()._subs.length).toBe(0);
    expect(headlessModule.cleanUp).toHaveBeenCalledTimes(1);
  });

  it('starting Drop-in after Headless removes stale Headless listeners first', async () => {
    const headlessOnError = jest.fn();
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: headlessOnError },
    } as any);

    expect(headlessEmitter()._subs.some((s) => s.eventType === 'onError')).toBe(true);

    await Primer.configure({ onError: jest.fn() } as any);
    await Primer.showUniversalCheckout('tok-d');

    expect(headlessEmitter()._subs.some((s) => s.eventType === 'onError')).toBe(false);
  });

  it('starting Headless after Drop-in removes stale Drop-in listeners first', async () => {
    const dropInOnError = jest.fn();
    await Primer.configure({ onError: dropInOnError } as any);
    await Primer.showUniversalCheckout('tok-d');

    expect(dropInEmitter()._subs.some((s) => s.eventType === 'onError')).toBe(true);

    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: jest.fn() },
    } as any);

    expect(dropInEmitter()._subs.some((s) => s.eventType === 'onError')).toBe(false);
  });
});
